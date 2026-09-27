package store

import (
	"database/sql"

	_ "github.com/lib/pq"
)

type PostgresStore struct{ db *sql.DB }

func NewPostgresStore(connStr string) (*PostgresStore, error) {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}
	if err = db.Ping(); err != nil {
		db.Close()
		return nil, err
	}
	return &PostgresStore{db: db}, nil
}
func (s *PostgresStore) Close() error { return s.db.Close() }
