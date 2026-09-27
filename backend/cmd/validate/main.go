package main

import (
	"fmt"
	"os"

	"github.com/frankmwase/portfolio-api/graph"
)

func main() {
	if len(os.Args) != 2 {
		fmt.Fprintln(os.Stderr, "usage: validate path/to/knowledge-graph.json")
		os.Exit(2)
	}
	g, err := graph.Load(os.Args[1])
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	fmt.Printf("validated %d nodes and %d edges\n", len(g.Nodes), len(g.Edges))
}
