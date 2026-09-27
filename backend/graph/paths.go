package graph

// Path is an ordered route from a matched concept. Indirect links are context,
// never a claim that the final node imposes an obligation on the first.
type Path struct {
	Nodes          []Node `json:"nodes"`
	Edges          []Edge `json:"edges"`
	Recommendation bool   `json:"recommendation"`
}

func (g Graph) Paths(start string, maxDepth int) []Path {
	if maxDepth < 1 {
		return []Path{}
	}
	if maxDepth > 3 {
		maxDepth = 3
	}
	nodes := map[string]Node{}
	for _, n := range g.Nodes {
		nodes[n.ID] = n
	}
	if _, ok := nodes[start]; !ok {
		return []Path{}
	}
	result := []Path{}
	queue := []Path{{Nodes: []Node{nodes[start]}, Edges: []Edge{}}}
	seen := map[string]bool{start: true}
	for len(queue) > 0 {
		path := queue[0]
		queue = queue[1:]
		if len(path.Edges) >= maxDepth {
			continue
		}
		last := path.Nodes[len(path.Nodes)-1]
		for _, e := range g.Edges {
			if e.Source != last.ID || seen[e.Target] {
				continue
			}
			target := nodes[e.Target]
			seen[e.Target] = true
			next := Path{Nodes: append(append([]Node{}, path.Nodes...), target), Edges: append(append([]Edge{}, path.Edges...), e)}
			next.Recommendation = len(next.Edges) == 1 && e.Verified && target.Verified && target.Jurisdiction == "Malawi" && (target.Type == "law" || target.Type == "advisory") && e.Type == "MAY_BE_RELEVANT"
			result = append(result, next)
			queue = append(queue, next)
		}
	}
	return result
}
