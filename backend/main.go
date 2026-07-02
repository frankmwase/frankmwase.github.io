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
	"github.com/frankmwase/portfolio-api/store"
)

func main() {
	log.Println("Starting Portfolio API...")

	// 1. Initialize Database
	dbURL := getEnv("DATABASE_URL", "postgres://portfolio_user:portfolio_password@db:5432/portfolio_db?sslmode=disable")
	
	pgStore, err := store.NewPostgresStore(dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer pgStore.Close()

	// 2. Initialize Embedder
	// embedder, err := embeddings.NewONNXEmbedder("/app/models/all-MiniLM-L6-v2.onnx")
	// if err != nil {
	// 	log.Printf("Warning: Failed to initialize ONNX embedder: %v. Falling back to mock embeddings.", err)
	// }
	// We will use a mock embedder for now to ensure the API builds and runs smoothly
	// without needing complex tokenization dictionaries locally.
	
	// 3. Initialize Handlers
	handler := api.NewHandler(pgStore)

	// 4. Setup Router
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://princemwase.me", "https://frankmwase.github.io", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})
	
	r.Route("/api", func(r chi.Router) {
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
