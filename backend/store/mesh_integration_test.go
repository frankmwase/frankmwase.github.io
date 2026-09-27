package store

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/frankmwase/portfolio-api/embeddings"
	"github.com/frankmwase/portfolio-api/graph"
)

// Supply a disposable database named *_test. Never run the destructive fixture against production.
func TestFreshAndExistingDatabase(t *testing.T) {
	dsn := os.Getenv("MESH_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("set MESH_TEST_DATABASE_URL to a disposable *_test database")
	}
	s, err := NewPostgresStore(dsn)
	if err != nil {
		t.Fatal(err)
	}
	defer s.Close()
	var dbname string
	if err = s.db.QueryRow("SELECT current_database()").Scan(&dbname); err != nil {
		t.Fatal(err)
	}
	if !strings.HasSuffix(dbname, "_test") {
		t.Fatal("refusing to modify a database not ending in _test")
	}
	g, err := graph.Load(filepath.Join("..", "..", "src", "data", "knowledge-graph.json"))
	if err != nil {
		t.Fatal(err)
	}
	reset := func() {
		t.Helper()
		if _, err = s.db.Exec("DROP TABLE IF EXISTS edges; DROP TABLE IF EXISTS nodes"); err != nil {
			t.Fatal(err)
		}
	}
	t.Run("fresh", func(t *testing.T) {
		reset()
		if err := s.SyncGraph(g, nil, ""); err != nil {
			t.Fatal(err)
		}
		assertGraph(t, s, g)
	})
	t.Run("existing legacy", func(t *testing.T) {
		reset()
		for _, f := range []string{"001_init.sql", "002_more_data.sql"} {
			b, e := os.ReadFile(filepath.Join("..", "migrations", f))
			if e != nil {
				t.Fatal(e)
			}
			if _, e = s.db.Exec(string(b)); e != nil {
				t.Fatal(e)
			}
		}
		for i := 0; i < 2; i++ {
			if err := s.SyncGraph(g, nil, ""); err != nil {
				t.Fatal(err)
			}
		}
		assertGraph(t, s, g)
		var count int
		if err := s.db.QueryRow("SELECT count(*) FROM edges WHERE type='REQUIRES_COMPLIANCE'").Scan(&count); err != nil || count != 0 {
			t.Fatalf("legacy edges retained: %d %v", count, err)
		}
	})
	if modelPath, vocabPath := os.Getenv("MESH_TEST_MODEL_PATH"), os.Getenv("MESH_TEST_VOCAB_PATH"); modelPath != "" && vocabPath != "" {
		model, err := embeddings.NewModel(modelPath, vocabPath, os.Getenv("MESH_TEST_ONNX_LIBRARY"))
		if err != nil {
			t.Fatal(err)
		}
		defer model.Close()
		if err := s.SyncGraph(g, model.Embed, embeddings.Version); err != nil {
			t.Fatal(err)
		}
		var vectors int
		if err := s.db.QueryRow("SELECT count(*) FROM nodes WHERE embedding IS NOT NULL AND embedding_version=$1", embeddings.Version).Scan(&vectors); err != nil || vectors != len(g.Nodes) {
			t.Fatalf("missing real vectors: %d %v", vectors, err)
		}
		vec, err := model.Embed("digital wallet")
		if err != nil {
			t.Fatal(err)
		}
		match, err := s.Search("digital wallet", vec, embeddings.Version)
		if err != nil || match == nil || match.Mode != "hybrid semantic + lexical" {
			t.Fatalf("semantic search: %+v %v", match, err)
		}
	}
}
func assertGraph(t *testing.T, s *PostgresStore, want graph.Graph) {
	t.Helper()
	actual, err := s.Mesh()
	if err != nil {
		t.Fatal(err)
	}
	if len(actual.Nodes) != len(want.Nodes) || len(actual.Edges) != len(want.Edges) {
		t.Fatalf("graph count: %+v", actual)
	}
	match, err := s.Search("import", nil, "")
	if err != nil || match == nil || match.Node.ID != "mra_customs" && match.Node.ID != "ecommerce" {
		t.Fatalf("lexical search: %+v %v", match, err)
	}
	match, err = s.Search("zzzxqvvv_123456", nil, "")
	if err != nil || match != nil {
		t.Fatalf("no-match expected: %+v %v", match, err)
	}
	for _, n := range actual.Nodes {
		if n.ID == "payment_act" && len(n.Citations) == 0 {
			t.Fatal("citation missing")
		}
	}
	var count int
	err = s.db.QueryRow("SELECT count(*) FROM nodes WHERE verified=false").Scan(&count)
	if err != nil || count == 0 {
		t.Fatalf("draft exclusion fixture: %d %v", count, err)
	}
}
