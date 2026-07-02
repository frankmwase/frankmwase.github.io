package api

import (
	"encoding/json"
	"net/http"

	"github.com/frankmwase/portfolio-api/store"
)

type Handler struct {
	store *store.PostgresStore
}

func NewHandler(s *store.PostgresStore) *Handler {
	return &Handler{
		store: s,
	}
}

type SearchResponse struct {
	PrimaryMatch *store.Node  `json:"primary_match"`
	Advisories   []store.Node `json:"advisories"`
}

func (h *Handler) HandleSearch(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	if query == "" {
		http.Error(w, "Missing query parameter 'q'", http.StatusBadRequest)
		return
	}

	// In a real implementation with onnxruntime_go, we would:
	// 1. Embed query: vec, err := embedder.Embed(query)
	// 2. primaryNode, err := h.store.SearchNodesVector(vec)
	
	// For now, use the text fallback
	primaryNode, err := h.store.SearchNodesText(query)
	if err != nil {
		// If no primary node is found, return empty result gracefully
		respondJSON(w, http.StatusOK, SearchResponse{
			PrimaryMatch: nil,
			Advisories:   []store.Node{},
		})
		return
	}

	// BFS traversal for advisories
	advisories, err := h.store.GetConnectedAdvisories(primaryNode.ID)
	if err != nil {
		http.Error(w, "Failed to traverse graph", http.StatusInternalServerError)
		return
	}

	resp := SearchResponse{
		PrimaryMatch: primaryNode,
		Advisories:   advisories,
	}

	respondJSON(w, http.StatusOK, resp)
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}
