package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/frankmwase/portfolio-api/embeddings"
	"github.com/frankmwase/portfolio-api/graph"
	"github.com/frankmwase/portfolio-api/store"
)

type SearchStore interface {
	Mesh() (graph.Graph, error)
	Search(string, []float32, string) (*store.Match, error)
}
type Embedder interface {
	Embed(string) ([]float32, error)
}
type Handler struct {
	store    SearchStore
	embedder Embedder
}

func NewHandler(s SearchStore, e Embedder) *Handler { return &Handler{store: s, embedder: e} }

type SearchResponse struct {
	PrimaryMatch *graph.Node  `json:"primary_match"`
	Paths        []graph.Path `json:"paths"`
	Mode         string       `json:"mode"`
}

func (h *Handler) HandleGraph(w http.ResponseWriter, r *http.Request) {
	g, err := h.store.Mesh()
	if err != nil {
		http.Error(w, "Graph unavailable", 500)
		return
	}
	respondJSON(w, 200, g)
}
func (h *Handler) HandleSearch(w http.ResponseWriter, r *http.Request) {
	q := strings.TrimSpace(r.URL.Query().Get("q"))
	if q == "" || len(q) > 200 {
		http.Error(w, "Query must be between 1 and 200 characters", 400)
		return
	}
	var vec []float32
	if h.embedder != nil {
		var err error
		vec, err = h.embedder.Embed(q)
		if err != nil {
			log.Printf("semantic inference failed; lexical fallback: %v", err)
		}
	}
	match, err := h.store.Search(q, vec, embeddings.Version)
	if err != nil {
		log.Printf("search error: %v", err)
		http.Error(w, "Search unavailable", 500)
		return
	}
	resp := SearchResponse{Paths: []graph.Path{}, Mode: "lexical fallback"}
	if match != nil {
		g, err := h.store.Mesh()
		if err != nil {
			http.Error(w, "Graph unavailable", 500)
			return
		}
		resp.PrimaryMatch = &match.Node
		resp.Paths = g.Paths(match.Node.ID, 3)
		resp.Mode = match.Mode
	}
	respondJSON(w, 200, resp)
}
func respondJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
