package graph

import (
	"encoding/json"
	"fmt"
	"net/url"
	"os"
	"regexp"
	"strings"
)

type Citation struct {
	Title string `json:"title"`
	URL   string `json:"url"`
}
type Node struct {
	ID            string     `json:"id"`
	Label         string     `json:"label"`
	Type          string     `json:"type"`
	Terms         []string   `json:"terms"`
	Summary       string     `json:"summary"`
	Jurisdiction  string     `json:"jurisdiction"`
	Applicability string     `json:"applicability"`
	Verified      bool       `json:"verified"`
	Citations     []Citation `json:"citations"`
}
type Edge struct {
	Source   string `json:"source"`
	Target   string `json:"target"`
	Type     string `json:"type"`
	Reason   string `json:"reason"`
	Verified bool   `json:"verified"`
}
type Graph struct {
	Nodes []Node `json:"nodes"`
	Edges []Edge `json:"edges"`
}

var idPattern = regexp.MustCompile(`^[a-z][a-z0-9_]{1,49}$`)

func Load(path string) (Graph, error) {
	var g Graph
	b, err := os.ReadFile(path)
	if err != nil {
		return g, err
	}
	if err = json.Unmarshal(b, &g); err != nil {
		return g, err
	}
	return g, g.Validate()
}

func (g Graph) Validate() error {
	if len(g.Nodes) == 0 {
		return fmt.Errorf("graph has no nodes")
	}
	ids := map[string]bool{}
	for _, n := range g.Nodes {
		if !idPattern.MatchString(n.ID) || ids[n.ID] {
			return fmt.Errorf("invalid or duplicate node id %q", n.ID)
		}
		ids[n.ID] = true
		if n.Type != "concept" && n.Type != "law" && n.Type != "advisory" && n.Type != "fact" {
			return fmt.Errorf("invalid type for %s", n.ID)
		}
		if strings.TrimSpace(n.Label) == "" || strings.TrimSpace(n.Summary) == "" || strings.TrimSpace(n.Jurisdiction) == "" || strings.TrimSpace(n.Applicability) == "" || len(n.Terms) == 0 || n.Citations == nil {
			return fmt.Errorf("missing fields on %s", n.ID)
		}
		if n.Verified && n.Type != "concept" && len(n.Citations) == 0 {
			return fmt.Errorf("verified claim %s requires a source", n.ID)
		}
		for _, c := range n.Citations {
			u, e := url.Parse(c.URL)
			if e != nil || u.Scheme != "https" || u.Host == "" || strings.TrimSpace(c.Title) == "" {
				return fmt.Errorf("invalid citation on %s", n.ID)
			}
		}
	}
	edges := map[string]bool{}
	for _, e := range g.Edges {
		key := e.Source + "/" + e.Target + "/" + e.Type
		if !ids[e.Source] || !ids[e.Target] || e.Source == e.Target || edges[key] || strings.TrimSpace(e.Type) == "" || strings.TrimSpace(e.Reason) == "" {
			return fmt.Errorf("invalid edge %s", key)
		}
		edges[key] = true
		for _, n := range g.Nodes {
			if (n.ID == e.Source || n.ID == e.Target) && !n.Verified && e.Verified {
				return fmt.Errorf("verified edge %s touches draft", key)
			}
		}
	}
	return nil
}
