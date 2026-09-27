package api

import (
	"encoding/json"
	"net/http/httptest"
	"testing"

	"github.com/frankmwase/portfolio-api/graph"
	"github.com/frankmwase/portfolio-api/store"
)

type fakeStore struct {
	g     graph.Graph
	match *store.Match
	err   error
}

func (s fakeStore) Mesh() (graph.Graph, error) { return s.g, s.err }
func (s fakeStore) Search(_ string, _ []float32, _ string) (*store.Match, error) {
	return s.match, s.err
}

type fakeEmbed struct{}

func (fakeEmbed) Embed(string) ([]float32, error) { return make([]float32, 384), nil }
func TestSearchResponses(t *testing.T) {
	g := graph.Graph{Nodes: []graph.Node{{ID: "fintech", Label: "Payments"}}, Edges: []graph.Edge{}}
	for _, tc := range []struct {
		name      string
		match     *store.Match
		wantPaths int
	}{{"no match", nil, 0}, {"match", &store.Match{Node: g.Nodes[0], Mode: "hybrid semantic + lexical"}, 0}} {
		t.Run(tc.name, func(t *testing.T) {
			h := NewHandler(fakeStore{g: g, match: tc.match}, fakeEmbed{})
			w := httptest.NewRecorder()
			h.HandleSearch(w, httptest.NewRequest("GET", "/api/mesh/search?q=wallet", nil))
			if w.Code != 200 {
				t.Fatal(w.Code)
			}
			var response SearchResponse
			if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
				t.Fatal(err)
			}
			if tc.match == nil && response.PrimaryMatch != nil {
				t.Fatal("unexpected match")
			}
			if len(response.Paths) != tc.wantPaths {
				t.Fatal("wrong path count")
			}
		})
	}
	h := NewHandler(fakeStore{}, nil)
	w := httptest.NewRecorder()
	h.HandleSearch(w, httptest.NewRequest("GET", "/api/mesh/search?q=", nil))
	if w.Code != 400 {
		t.Fatalf("expected bad query, got %d", w.Code)
	}
}
func TestGraphEndpoint(t *testing.T) {
	h := NewHandler(fakeStore{g: graph.Graph{Nodes: []graph.Node{}, Edges: []graph.Edge{}}}, nil)
	w := httptest.NewRecorder()
	h.HandleGraph(w, httptest.NewRequest("GET", "/api/mesh/graph", nil))
	if w.Code != 200 {
		t.Fatal(w.Code)
	}
}
