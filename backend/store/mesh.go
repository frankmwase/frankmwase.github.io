package store

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/frankmwase/portfolio-api/graph"
	"github.com/lib/pq"
	"github.com/pgvector/pgvector-go"
)

const schema = `
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS nodes (id varchar(50) PRIMARY KEY, label varchar(255) NOT NULL, type varchar(50) NOT NULL, summary text NOT NULL, terms text[] NOT NULL, embedding vector(384));
CREATE TABLE IF NOT EXISTS edges (source varchar(50) REFERENCES nodes(id), target varchar(50) REFERENCES nodes(id), type varchar(50) NOT NULL, PRIMARY KEY (source,target,type));
ALTER TABLE nodes ADD COLUMN IF NOT EXISTS jurisdiction text NOT NULL DEFAULT 'Unreviewed';
ALTER TABLE nodes ADD COLUMN IF NOT EXISTS applicability text NOT NULL DEFAULT 'Unreviewed';
ALTER TABLE nodes ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;
ALTER TABLE nodes ADD COLUMN IF NOT EXISTS citations jsonb NOT NULL DEFAULT '[]';
ALTER TABLE nodes ADD COLUMN IF NOT EXISTS embedding_version text NOT NULL DEFAULT '';
ALTER TABLE edges ADD COLUMN IF NOT EXISTS reason text NOT NULL DEFAULT 'Unreviewed';
ALTER TABLE edges ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS nodes_lexical_idx ON nodes USING gin (to_tsvector('simple', label || ' ' || summary || ' ' || array_to_string(terms,' ')));
`

// SyncGraph replaces legacy seed content with the reviewed graph in a single transaction.
// Repeating it is safe, and removes retired/unsafe compliance edges on existing installations.
func (s *PostgresStore) SyncGraph(g graph.Graph, embed func(string) ([]float32, error), version string) error {
	if err := g.Validate(); err != nil {
		return err
	}
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err = tx.Exec(schema); err != nil {
		return fmt.Errorf("migrate graph: %w", err)
	}
	if _, err = tx.Exec("DELETE FROM edges"); err != nil {
		return err
	}
	ids := make([]string, 0, len(g.Nodes))
	for _, n := range g.Nodes {
		ids = append(ids, n.ID)
		citations, _ := json.Marshal(n.Citations)
		var v interface{}
		embedVersion := ""
		if embed != nil {
			vec, e := embed(n.Label + ". " + n.Summary + ". " + strings.Join(n.Terms, ", "))
			if e != nil {
				return fmt.Errorf("embedding %s: %w", n.ID, e)
			}
			v = pgvector.NewVector(vec)
			embedVersion = version
		}
		_, err = tx.Exec(`INSERT INTO nodes(id,label,type,summary,terms,jurisdiction,applicability,verified,citations,embedding,embedding_version)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    ON CONFLICT(id) DO UPDATE SET label=excluded.label,type=excluded.type,summary=excluded.summary,terms=excluded.terms,jurisdiction=excluded.jurisdiction,applicability=excluded.applicability,verified=excluded.verified,citations=excluded.citations,embedding=excluded.embedding,embedding_version=excluded.embedding_version`, n.ID, n.Label, n.Type, n.Summary, pq.Array(n.Terms), n.Jurisdiction, n.Applicability, n.Verified, citations, v, embedVersion)
		if err != nil {
			return err
		}
	}
	if _, err = tx.Exec("DELETE FROM nodes WHERE NOT (id = ANY($1))", pq.Array(ids)); err != nil {
		return err
	}
	for _, e := range g.Edges {
		if _, err = tx.Exec("INSERT INTO edges(source,target,type,reason,verified) VALUES($1,$2,$3,$4,$5)", e.Source, e.Target, e.Type, e.Reason, e.Verified); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (s *PostgresStore) Mesh() (graph.Graph, error) {
	g := graph.Graph{Nodes: []graph.Node{}, Edges: []graph.Edge{}}
	rows, err := s.db.Query(`SELECT id,label,type,summary,terms,jurisdiction,applicability,verified,citations FROM nodes ORDER BY id`)
	if err != nil {
		return g, err
	}
	for rows.Next() {
		var n graph.Node
		var b []byte
		if err = rows.Scan(&n.ID, &n.Label, &n.Type, &n.Summary, pq.Array(&n.Terms), &n.Jurisdiction, &n.Applicability, &n.Verified, &b); err != nil {
			break
		}
		if err = json.Unmarshal(b, &n.Citations); err != nil {
			break
		}
		g.Nodes = append(g.Nodes, n)
	}
	if err == nil {
		err = rows.Err()
	}
	rows.Close()
	if err != nil {
		return g, err
	}
	rows, err = s.db.Query(`SELECT source,target,type,reason,verified FROM edges ORDER BY source,target,type`)
	if err != nil {
		return g, err
	}
	for rows.Next() {
		var e graph.Edge
		if err = rows.Scan(&e.Source, &e.Target, &e.Type, &e.Reason, &e.Verified); err != nil {
			break
		}
		g.Edges = append(g.Edges, e)
	}
	if err == nil {
		err = rows.Err()
	}
	rows.Close()
	return g, err
}

type Match struct {
	Node graph.Node `json:"node"`
	Mode string     `json:"mode"`
}

// Search ranks lexical matches and, when available, semantic matches on the same indexed model version.
func (s *PostgresStore) Search(query string, vector []float32, version string) (*Match, error) {
	var v interface{}
	if len(vector) == 384 {
		v = pgvector.NewVector(vector)
	}
	row := s.db.QueryRow(`SELECT id,label,type,summary,terms,jurisdiction,applicability,verified,citations,lex,sim FROM (
 SELECT id,label,type,summary,terms,jurisdiction,applicability,verified,citations,
 (CASE WHEN lower(label)=lower($1) THEN 5 ELSE 0 END + CASE WHEN lower($1)=ANY(SELECT lower(x) FROM unnest(terms) x) THEN 3 ELSE 0 END +
 ts_rank_cd(to_tsvector('simple', label || ' ' || summary || ' ' || array_to_string(terms,' ')),plainto_tsquery('simple',$1))*2) AS lex,
 CASE WHEN $2::vector IS NOT NULL AND embedding_version=$3 AND embedding IS NOT NULL THEN 1-(embedding <=> $2::vector) ELSE 0 END AS sim
 FROM nodes) ranked WHERE lex > 0 OR sim > 0.45 ORDER BY (lex + CASE WHEN sim > 0.45 THEN sim ELSE 0 END) DESC,id LIMIT 1`, query, v, version)
	var n graph.Node
	var b []byte
	var lex, sim float64
	err := row.Scan(&n.ID, &n.Label, &n.Type, &n.Summary, pq.Array(&n.Terms), &n.Jurisdiction, &n.Applicability, &n.Verified, &b, &lex, &sim)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if err = json.Unmarshal(b, &n.Citations); err != nil {
		return nil, err
	}
	mode := "lexical fallback"
	if v != nil && sim > 0.45 {
		mode = "hybrid semantic + lexical"
	}
	return &Match{Node: n, Mode: mode}, nil
}
