package graph

import (
	"path/filepath"
	"testing"
)

func fixture(t *testing.T) Graph {
	t.Helper()
	g, err := Load(filepath.Join("..", "..", "src", "data", "knowledge-graph.json"))
	if err != nil {
		t.Fatal(err)
	}
	return g
}
func TestReviewedGraph(t *testing.T) {
	g := fixture(t)
	for _, e := range g.Edges {
		if e.Source == "healthcare" && e.Target == "hipaa" && e.Type == "REQUIRES_COMPLIANCE" {
			t.Fatal("US law must not be presented as Malawi compliance")
		}
	}
	for _, n := range g.Nodes {
		if (n.Type == "law" || n.Type == "advisory") && n.Verified && len(n.Citations) == 0 {
			t.Fatalf("%s missing citation", n.ID)
		}
	}
}
func TestValidation(t *testing.T) {
	g := fixture(t)
	g.Edges = append(g.Edges, Edge{Source: "absent", Target: "fintech", Type: "BACKGROUND", Reason: "test"})
	if g.Validate() == nil {
		t.Fatal("expected broken edge rejection")
	}
	g = fixture(t)
	for i := range g.Nodes {
		if g.Nodes[i].ID == "data_act" {
			g.Nodes[i].Verified = true
		}
	}
	if g.Validate() == nil {
		t.Fatal("expected unsourced verified claim rejection")
	}
}
func TestPaths(t *testing.T) {
	g := fixture(t)
	paths := g.Paths("ecommerce", 3)
	foundMulti, foundDraft := false, false
	for _, p := range paths {
		if len(p.Edges) > 3 {
			t.Fatal("unbounded path")
		}
		last := p.Nodes[len(p.Nodes)-1]
		if len(p.Edges) > 1 {
			foundMulti = true
			if p.Recommendation {
				t.Fatal("indirect connection cannot imply obligation")
			}
		}
		if last.ID == "eta" {
			foundDraft = true
			if p.Recommendation {
				t.Fatal("draft cannot be recommended")
			}
		}
	}
	if !foundMulti || !foundDraft {
		t.Fatalf("expected multi-hop and draft paths: %+v", paths)
	}
}
