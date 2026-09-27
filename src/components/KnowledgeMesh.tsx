'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ShieldAlert, Network, ArrowRight, BookOpen, Scale, Info } from 'lucide-react';
import * as d3 from 'd3';

interface Citation { title: string; url: string }
interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  terms: string[];
  summary: string;
  jurisdiction: string;
  applicability: string;
  verified: boolean;
  citations: Citation[];
}
interface Edge extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  type: string;
  reason: string;
  verified: boolean;
}
interface Path { nodes: Node[]; edges: Edge[]; recommendation: boolean }
interface Graph { nodes: Node[]; edges: Edge[] }
const apiBase = process.env.NEXT_PUBLIC_MESH_API_URL?.replace(/\/$/, '');

const typeIcons: Record<string, React.ElementType> = {
  concept: BookOpen,
  advisory: ShieldAlert,
  law: Scale,
  fact: Info,
};

const typeColors: Record<string, { bg: string; border: string; text: string }> = {
  concept: { bg: '#1a9fab20', border: '#1a9fab', text: '#70dade' }, // Teal
  advisory: { bg: '#ef444420', border: '#ef4444', text: '#fca5a5' }, // Red
  law: { bg: '#f0c04020', border: '#f0c040', text: '#fde047' },     // Gold
  fact: { bg: '#a7b2c820', border: '#7889aa', text: '#d0d6e2' },    // Midnight
};

export default function KnowledgeMesh() {
  const [searchQuery, setSearchQuery] = useState('');
  const [graph, setGraph] = useState<Graph | null>(null);
  const [activeConcept, setActiveConcept] = useState<Node | null>(null);
  const [paths, setPaths] = useState<Path[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [mode, setMode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'graph' | 'list'>('graph');
  const [graphWidth, setGraphWidth] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const activeAdvisories = paths.filter(p => p.recommendation).map(p => p.nodes[p.nodes.length - 1]);

  useEffect(() => {
    if (!svgRef.current || view !== 'graph') return;
    const observer = new ResizeObserver(entries => setGraphWidth(entries[0].contentRect.width));
    observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, [view]);

  useEffect(() => {
    if (!apiBase) { setError('Search is not configured yet. Please try again later.'); return; }
    const controller = new AbortController();
    fetch(`${apiBase}/api/mesh/graph`, { signal: controller.signal })
      .then(async res => { if (!res.ok) throw new Error('Graph service unavailable'); return res.json(); })
      .then((data: Graph) => { if (!controller.signal.aborted) { setGraph(data); setError(''); } })
      .catch(() => { if (!controller.signal.aborted) setError('Could not load the graph. Please retry later.'); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!apiBase || !searchQuery.trim()) { setActiveConcept(null); setPaths([]); setMode(''); setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true); setError(''); setActiveConcept(null); setPaths([]); setSelectedNode(null);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${apiBase}/api/mesh/search?q=${encodeURIComponent(searchQuery.trim())}`, { signal: controller.signal });
        if (!res.ok) throw new Error('Search service unavailable');
        const data: { primary_match: Node | null; paths: Path[]; mode: string } = await res.json();
        if (!controller.signal.aborted) { setActiveConcept(data.primary_match); setPaths(data.paths); setMode(data.mode); }
      } catch {
        if (!controller.signal.aborted) setError('Search failed. Please try again.');
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [searchQuery]);

  // D3 visualization of the same reviewed dataset returned by the API.
  useEffect(() => {
    if (!svgRef.current || !graph || view !== 'graph') return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes: Node[] = JSON.parse(JSON.stringify(graph.nodes));
    const links: Edge[] = JSON.parse(JSON.stringify(graph.edges));

    const simulation = d3.forceSimulation<Node>(nodes)
      .force("link", d3.forceLink<Node, Edge>(links).id(d => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40));

    // Draw edges
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", d => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        
        // Highlight active edges
        if (activeConcept) {
          const isActiveEdge = paths.some(p => p.edges.some(e => e.source === sourceId && e.target === targetId));
          return isActiveEdge ? "#1a9fab" : "#394562";
        }
        return "#394562";
      })
      .attr("stroke-width", d => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        
        if (activeConcept) {
          const isActiveEdge = paths.some(p => p.edges.some(e => e.source === sourceId && e.target === targetId));
          return isActiveEdge ? 3 : 1;
        }
        return 1;
      })
      .attr("stroke-opacity", 0.6)
      .attr("stroke-dasharray", d => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        if (activeConcept) {
          const isActiveEdge = paths.some(p => p.edges.some(e => e.source === sourceId && e.target === targetId));
          return isActiveEdge ? "5,5" : "none";
        }
        return "none";
      });

    // Draw nodes
    const node = svg.append("g")
      .selectAll<SVGGElement, Node>("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .on('click', (_event, datum) => setSelectedNode(datum))
      .call(d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Node circles
    node.append("circle")
      .attr("r", d => d.type === 'concept' ? 24 : 18)
      .attr("fill", d => {
        const isPrimary = activeConcept?.id === d.id;
        const isAdvisory = activeAdvisories.some(a => a.id === d.id);
        
        if (isPrimary) return typeColors[d.type].bg;
        if (isAdvisory) return typeColors[d.type].bg;
        return "#0f1219"; // default bg
      })
      .attr("stroke", d => {
        const isPrimary = activeConcept?.id === d.id;
        const isAdvisory = activeAdvisories.some(a => a.id === d.id);
        
        if (isPrimary || isAdvisory) return typeColors[d.type].border;
        return "#394562"; // default border
      })
      .attr("stroke-width", d => {
        const isPrimary = activeConcept?.id === d.id;
        const isAdvisory = activeAdvisories.some(a => a.id === d.id);
        return (isPrimary || isAdvisory) ? 3 : 1.5;
      });

    // Node labels
    node.append("text")
      .text(d => d.label)
      .attr("x", 0)
      .attr("y", d => d.type === 'concept' ? 36 : 30)
      .attr("text-anchor", "middle")
      .attr("fill", d => {
        const isPrimary = activeConcept?.id === d.id;
        const isAdvisory = activeAdvisories.some(a => a.id === d.id);
        
        if (isPrimary || isAdvisory) return typeColors[d.type].text;
        return "#a7b2c8";
      })
      .attr("font-size", d => d.type === 'concept' ? "12px" : "10px")
      .attr("font-weight", d => (activeConcept?.id === d.id || activeAdvisories.some(a => a.id === d.id)) ? "600" : "400")
      .style("pointer-events", "none");

    // Simulation tick updates
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as Node).x!)
        .attr("y1", d => (d.source as Node).y!)
        .attr("x2", d => (d.target as Node).x!)
        .attr("y2", d => (d.target as Node).y!);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Drag handlers
    function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => { simulation.stop(); };
  }, [graph, view, graphWidth, activeConcept, paths]);

  const details = selectedNode || activeConcept;
  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 min-h-[700px]">
      <div className="flex-1 glass-card relative overflow-hidden flex flex-col min-h-[550px]">
        <div className="relative z-10 p-5 flex flex-col gap-3 bg-midnight-950/80">
          <h2 className="text-sm font-bold tracking-wider text-midnight-300 uppercase flex items-center gap-2"><Network size={16} /> Explore the mesh</h2>
          <label htmlFor="mesh-search" className="sr-only">Search the knowledge mesh</label>
          <div className="relative max-w-md">
            <input id="mesh-search" type="search" maxLength={200} placeholder="Try: mobile money, importing, health..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 pl-11 rounded-xl bg-midnight-950 border border-midnight-700 focus:ring-2 focus:ring-teal-500 text-midnight-100 outline-none" />
            <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-midnight-400" size={18} />
          </div>
          <div className="flex gap-2" role="group" aria-label="Graph display mode">
            {(['graph', 'list'] as const).map(item => <button key={item} type="button" aria-pressed={view === item} onClick={() => setView(item)}
              className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${view === item ? 'bg-teal-700 text-white' : 'bg-midnight-800 text-midnight-100'}`}>{item === 'graph' ? 'Graph' : 'Accessible list'}</button>)}
          </div>
          <div role="status" aria-live="polite" className="text-sm text-midnight-200">{error || (loading ? 'Searching…' : mode ? `Search mode: ${mode}` : graph ? `${graph.nodes.length} reviewed and draft entries loaded` : 'Loading graph…')}</div>
        </div>
        <svg ref={svgRef} aria-hidden="true" className={view === 'graph' ? 'flex-1 w-full min-h-[380px] cursor-grab active:cursor-grabbing' : 'hidden'} />
        {view === 'list' && <ul className="overflow-y-auto flex-1 p-5" aria-label="Knowledge entries">
          {graph?.nodes.map(n => <li key={n.id}><button type="button" onClick={() => setSelectedNode(n)}
            className="block w-full text-left mb-2 p-3 rounded-lg border border-midnight-700 text-midnight-100 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <span className="font-semibold">{n.label}</span> — {n.type} · {n.verified ? 'Reviewed' : 'Unverified draft'}
          </button></li>)}
        </ul>}
      </div>
      <section className="w-full lg:w-[28rem] glass-card p-6 overflow-y-auto max-h-[800px]" aria-label="Search and exploration details">
        <h2 className="text-xl font-display font-bold text-midnight-100 mb-4">Execution paths</h2>
        <p className="text-xs text-midnight-300 mb-4">Paths show relationships, not legal conclusions. Indirect links never imply compliance duties. Check primary sources and applicability.</p>
        {details ? <article className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 mb-4 text-midnight-100">
          <h3 className="font-bold flex items-center gap-2"><BookOpen size={18} />{details.label}</h3>
          <p className="text-sm mt-2">{details.summary}</p>
          <p className="text-xs mt-2">{details.jurisdiction} · {details.applicability} · {details.verified ? 'Reviewed' : 'Unverified draft — not a recommendation'}</p>
          {details.citations.map(c => <a key={c.url} className="block text-teal-300 underline text-sm mt-2" href={c.url} target="_blank" rel="noopener noreferrer">Source: {c.title}</a>)}
        </article> : <p className="text-sm text-midnight-300 mb-5">{loading ? 'Searching…' : searchQuery ? 'No result found. Try another term.' : 'Search or select an entry to explore.'}</p>}
        {paths.length > 0 && <ol className="space-y-4 text-midnight-100">{paths.map(p => {
          const target = p.nodes[p.nodes.length - 1]; const Icon = typeIcons[target.type] || Info;
          return <li key={target.id} className="rounded-xl border border-midnight-700 p-4">
            <h3 className="font-semibold flex gap-2 items-center"><Icon size={16} />{target.label}</h3>
            <p className="text-xs text-midnight-300 mt-1">{p.recommendation ? 'Potentially relevant — verify applicability' : target.verified ? 'Context only — not a compliance requirement' : 'Unverified draft — not a recommendation'}</p>
            <ol className="mt-3 text-sm space-y-1">{p.edges.map((edge, i) => <li key={`${edge.source}-${edge.target}`}><ArrowRight aria-hidden="true" size={14} className="inline mr-1" />{p.nodes[i].label} → {p.nodes[i + 1].label}: {edge.reason}</li>)}</ol>
            <p className="text-sm mt-2">{target.summary}</p>
            {target.citations.map(c => <a key={c.url} className="block text-teal-300 underline text-sm mt-2" href={c.url} target="_blank" rel="noopener noreferrer">Source: {c.title}</a>)}
          </li>;
        })}</ol>}
      </section>
    </div>
  );
}
