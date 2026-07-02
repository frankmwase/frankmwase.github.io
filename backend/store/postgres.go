package store

import (
	"database/sql"
	"strings"

	_ "github.com/lib/pq"
	"github.com/pgvector/pgvector-go"
)

type Node struct {
	ID       string   `json:"id"`
	Label    string   `json:"label"`
	Type     string   `json:"type"`
	Summary  string   `json:"summary"`
	Terms    []string `json:"terms"`
	AudioURL string   `json:"audio_url,omitempty"`
}

type Edge struct {
	Source string `json:"source"`
	Target string `json:"target"`
	Type   string `json:"type"`
}

type PostgresStore struct {
	db *sql.DB
}

func NewPostgresStore(connStr string) (*PostgresStore, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	return &PostgresStore{db: db}, nil
}

func (s *PostgresStore) Close() error {
	return s.db.Close()
}

// SearchNodes fallback to text search if vector is not provided
func (s *PostgresStore) SearchNodesText(query string) (*Node, error) {
	// Simple ILIKE search for demonstration. In production, use tsvector.
	q := "%" + strings.ToLower(query) + "%"
	row := s.db.QueryRow(`
		SELECT id, label, type, summary
		FROM nodes
		WHERE LOWER(label) LIKE $1 OR LOWER(summary) LIKE $1 OR $2 = ANY(terms)
		LIMIT 1
	`, q, strings.ToLower(query))

	var n Node
	err := row.Scan(&n.ID, &n.Label, &n.Type, &n.Summary)
	if err != nil {
		return nil, err
	}
	return &n, nil
}

// SearchNodesVector performs a cosine similarity search
func (s *PostgresStore) SearchNodesVector(embedding []float32) (*Node, error) {
	row := s.db.QueryRow(`
		SELECT id, label, type, summary
		FROM nodes
		ORDER BY embedding <=> $1
		LIMIT 1
	`, pgvector.NewVector(embedding))

	var n Node
	err := row.Scan(&n.ID, &n.Label, &n.Type, &n.Summary)
	if err != nil {
		return nil, err
	}
	return &n, nil
}

// GetConnectedAdvisories performs a simple BFS traversal for a depth of 1 to find related advisories/laws
func (s *PostgresStore) GetConnectedAdvisories(nodeID string) ([]Node, error) {
	rows, err := s.db.Query(`
		SELECT DISTINCT n.id, n.label, n.type, n.summary
		FROM nodes n
		JOIN edges e ON (n.id = e.target OR n.id = e.source)
		WHERE (e.source = $1 OR e.target = $1)
		  AND n.id != $1
		  AND n.type != 'concept'
	`, nodeID)
	
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var nodes []Node
	for rows.Next() {
		var n Node
		if err := rows.Scan(&n.ID, &n.Label, &n.Type, &n.Summary); err != nil {
			return nil, err
		}
		nodes = append(nodes, n)
	}
	return nodes, nil
}
