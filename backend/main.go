package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/frankmwase/portfolio-api/api"
	"github.com/frankmwase/portfolio-api/embeddings"
	"github.com/frankmwase/portfolio-api/graph"
	"github.com/frankmwase/portfolio-api/store"
)

func main() {
	log.Println("Starting Portfolio API...")
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is required")
	}
	pgStore, err := store.NewPostgresStore(dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer pgStore.Close()

	g, err := graph.Load(getEnv("GRAPH_PATH", "../src/data/knowledge-graph.json"))
	if err != nil {
		log.Fatalf("Graph validation failed: %v", err)
	}
	var model *embeddings.Model
	model, err = embeddings.NewModel(getEnv("MODEL_PATH", "/app/models/model.onnx"), getEnv("VOCAB_PATH", "/app/models/vocab.txt"), getEnv("ONNX_LIBRARY", "/usr/lib/libonnxruntime.so"))
	if err != nil {
		log.Printf("MiniLM unavailable: %v; serving labeled lexical fallback", err)
	} else {
		defer model.Close()
	}
	var embed func(string) ([]float32, error)
	version := ""
	if model != nil {
		embed = model.Embed
		version = embeddings.Version
	}
	if err = pgStore.SyncGraph(g, embed, version); err != nil {
		log.Fatalf("Graph sync failed: %v", err)
	}
	handler := api.NewHandler(pgStore, model)

	// 4. Setup Router
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{getEnv("SITE_ORIGIN", "https://princemwase.me")},
		AllowedMethods: []string{"GET", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Content-Type"},
		MaxAge:         300,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("OK")) })
	r.Route("/api", func(r chi.Router) {
		r.Get("/mesh/graph", handler.HandleGraph)
		r.Get("/mesh/search", handler.HandleSearch)
	})

	// 5. Start Server
	port := getEnv("API_PORT", "3001")
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		log.Printf("Server listening on port %s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Listen error: %s\n", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
