'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ShieldAlert, Network, ArrowRight, BookOpen, Scale, Info, PlayCircle } from 'lucide-react';
import * as d3 from 'd3';

import graphData from '@/data/knowledge-graph.json';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  terms: string[];
  summary: string;
  audio_url?: string;
}

interface Edge extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  type: string;
}

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
  const [activeConcept, setActiveConcept] = useState<Node | null>(null);
  const [activeAdvisories, setActiveAdvisories] = useState<Node[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Search logic (Server-side Semantic Search + BFS)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setActiveConcept(null);
      setActiveAdvisories([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/portfolio-api/mesh/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setActiveConcept(data.primary_match || null);
          setActiveAdvisories(data.advisories || []);
        }
      } catch (err) {
        console.error("Search API error", err);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // D3 Visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // Deep copy data for D3 to mutate safely
    const nodes: Node[] = JSON.parse(JSON.stringify(graphData.nodes));
    const links: Edge[] = JSON.parse(JSON.stringify(graphData.edges));

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
          const isActiveEdge = (sourceId === activeConcept.id && activeAdvisories.some(a => a.id === targetId)) ||
                               (targetId === activeConcept.id && activeAdvisories.some(a => a.id === sourceId));
          return isActiveEdge ? "#1a9fab" : "#394562";
        }
        return "#394562";
      })
      .attr("stroke-width", d => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        
        if (activeConcept) {
          const isActiveEdge = (sourceId === activeConcept.id && activeAdvisories.some(a => a.id === targetId)) ||
                               (targetId === activeConcept.id && activeAdvisories.some(a => a.id === sourceId));
          return isActiveEdge ? 3 : 1;
        }
        return 1;
      })
      .attr("stroke-opacity", 0.6)
      .attr("stroke-dasharray", d => {
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        if (activeConcept) {
          const isActiveEdge = (sourceId === activeConcept.id && activeAdvisories.some(a => a.id === targetId)) ||
                               (targetId === activeConcept.id && activeAdvisories.some(a => a.id === sourceId));
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

    return () => {
      simulation.stop();
    };
  }, [activeConcept, activeAdvisories]);

  // Audio player stub
  const playAudio = (url: string | undefined) => {
    if (!url) return;
    console.log("Playing audio reference:", url);
    // In Phase 2, this will link to R2 object storage URL
    alert("Audio playback will connect to R2 storage in Phase 2.");
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 h-[700px]">
      
      {/* Left: Graph Canvas */}
      <div className="flex-grow glass-card relative overflow-hidden flex flex-col">
        <div className="absolute top-6 left-6 right-6 z-10 flex flex-col gap-4">
          <h2 className="text-sm font-bold tracking-wider text-midnight-400 uppercase flex items-center gap-2">
            <Network size={16} /> Mesh Visualization
          </h2>
          
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Try: 'hospital', 'importing', 'fintech'..."
              className="w-full px-5 py-3 pl-11 rounded-xl bg-midnight-950/80 border border-midnight-700/50 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 text-midnight-100 outline-none transition-all duration-300 backdrop-blur-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-midnight-400" size={18} />
          </div>
        </div>
        
        <svg ref={svgRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />
        
        {/* Graph Legend */}
        <div className="absolute bottom-6 left-6 z-10 flex gap-4 text-xs font-mono bg-midnight-950/80 backdrop-blur-md p-3 rounded-lg border border-midnight-800">
          <div className="flex items-center gap-1.5 text-teal-300"><span className="w-3 h-3 rounded-full bg-teal-500/20 border border-teal-500"/> Concept</div>
          <div className="flex items-center gap-1.5 text-red-300"><span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500"/> Advisory</div>
          <div className="flex items-center gap-1.5 text-gold-400"><span className="w-3 h-3 rounded-full bg-gold-400/20 border border-gold-400"/> Law</div>
        </div>
      </div>

      {/* Right: Results Panel */}
      <div className="w-full lg:w-96 glass-card p-6 flex flex-col overflow-y-auto custom-scrollbar">
        <h2 className="text-xl font-display font-bold text-midnight-100 mb-6 border-b border-midnight-800 pb-4">
          Execution Path
        </h2>
        
        {activeConcept ? (
          <div className="mb-8 animate-slide-in-right">
            <span className="text-xs font-mono font-semibold tracking-wider text-teal-500 uppercase mb-2 block">Primary Match</span>
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-teal-300">
                  <BookOpen size={18} />
                  {activeConcept.label}
                </div>
                {activeConcept.audio_url && (
                  <button onClick={() => playAudio(activeConcept.audio_url)} className="text-teal-400 hover:text-teal-300 transition-colors">
                    <PlayCircle size={18} />
                  </button>
                )}
              </div>
              <p className="text-sm text-teal-100/80 mb-3">{activeConcept.summary}</p>
              <div className="flex flex-wrap gap-1">
                {activeConcept.terms.slice(0, 3).map(term => (
                  <span key={term} className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-200 uppercase">{term}</span>
                ))}
              </div>
            </div>
          </div>
        ) : searchQuery.trim() ? (
           <div className="text-sm text-midnight-400 italic mb-8 p-4 bg-midnight-900/50 rounded-xl border border-midnight-800">
             Analyzing semantic vectors for "{searchQuery}"...
           </div>
        ) : (
           <div className="text-sm text-midnight-400 italic mb-8 p-4 bg-midnight-900/50 rounded-xl border border-midnight-800">
             Awaiting search query to begin traversal...
           </div>
        )}

        {activeAdvisories.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <span className="text-xs font-mono font-semibold tracking-wider text-terracotta-400 uppercase mb-3 flex items-center gap-1.5">
              <ArrowRight size={14} /> Triggered Advisories
            </span>
            <div className="flex flex-col gap-4 mt-2">
              {activeAdvisories.map(adv => {
                const Icon = typeIcons[adv.type] || Info;
                const colors = typeColors[adv.type] || typeColors.fact;
                
                return (
                  <div key={adv.id} className="p-4 rounded-xl border flex gap-3 items-start transition-all" style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
                     <Icon className="shrink-0 mt-0.5" size={18} color={colors.border} />
                     <div className="flex-grow">
                       <div className="flex items-center justify-between mb-1">
                         <div className="font-bold text-sm" style={{ color: colors.text }}>{adv.label}</div>
                         {adv.audio_url && (
                           <button onClick={() => playAudio(adv.audio_url)} className="hover:opacity-80 transition-opacity" style={{ color: colors.border }}>
                             <PlayCircle size={14} />
                           </button>
                         )}
                       </div>
                       <p className="text-xs opacity-90 leading-relaxed" style={{ color: colors.text }}>{adv.summary}</p>
                     </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
