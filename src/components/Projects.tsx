'use client';

import { useState, useEffect } from 'react';
import { Star, GitBranch, ExternalLink, Github } from 'lucide-react';

interface Repo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  language: string;
  owner: {
    login: string;
  };
}

// Fallback data in case of API rate limits
const fallbackProjects: Repo[] = [
  {
    id: 1,
    name: 'malawi-pay-standard',
    description: 'A unified standard for fintech interoperability in Malawi (MW-JSON).',
    html_url: 'https://github.com/frankmwase/malawi-pay-standard',
    homepage: null,
    stargazers_count: 8,
    language: 'Go',
    owner: { login: 'frankmwase' }
  },
  {
    id: 2,
    name: 'quick-ticket',
    description: 'Go-based Ticketing Backend-as-a-Service (BaaS) with an immersive tactical Web UI.',
    html_url: 'https://github.com/frankmwase/quick-ticket',
    homepage: null,
    stargazers_count: 5,
    language: 'Go',
    owner: { login: 'frankmwase' }
  },
  {
    id: 3,
    name: 'malawi-postal-codes',
    description: 'Professional, multi-language SDK for Malawi postal codes with inverse lookup capabilities.',
    html_url: 'https://github.com/frankmwase/malawi-postal-codes',
    homepage: 'https://www.npmjs.com/package/malawi-postal-codes',
    stargazers_count: 4,
    language: 'TypeScript',
    owner: { login: 'frankmwase' }
  },
  {
    id: 4,
    name: 'skillrise-africa',
    description: 'Platform infrastructure and backend services for SkillRise.',
    html_url: 'https://github.com/frankmwase/skillrise-africa',
    homepage: null,
    stargazers_count: 3,
    language: 'TypeScript',
    owner: { login: 'frankmwase' }
  },
  {
    id: 5,
    name: 'store-backend',
    description: 'Backend development repository for a highly scalable online store.',
    html_url: 'https://github.com/PrinceMwase/store-backend',
    homepage: null,
    stargazers_count: 2,
    language: 'PHP',
    owner: { login: 'PrinceMwase' }
  },
  {
    id: 6,
    name: 'ncapFrontend',
    description: 'Mobile Scaffolding for project ncap.',
    html_url: 'https://github.com/PrinceMwase/ncapFrontend',
    homepage: null,
    stargazers_count: 1,
    language: 'TypeScript',
    owner: { login: 'PrinceMwase' }
  }
];

const languageColors: Record<string, string> = {
  Go: 'bg-cyan-400',
  TypeScript: 'bg-blue-400',
  JavaScript: 'bg-yellow-400',
  Python: 'bg-green-400',
  PHP: 'bg-purple-400',
  Vue: 'bg-emerald-400',
};

export default function Projects() {
  const [projects, setProjects] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const [frankRes, princeRes] = await Promise.all([
          fetch('https://api.github.com/users/frankmwase/repos?sort=updated&per_page=10'),
          fetch('https://api.github.com/users/princemwase/repos?sort=updated&per_page=10')
        ]);
        
        if (!frankRes.ok || !princeRes.ok) {
          throw new Error('API rate limit exceeded');
        }

        const frankData: Repo[] = await frankRes.json();
        const princeData: Repo[] = await princeRes.json();
        
        // Combine, filter out forks, and sort by stars
        const combined = [...frankData, ...princeData]
          .filter(repo => !repo.name.toLowerCase().includes('github.io')) // exclude portfolio
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 6); // Take top 6
          
        if (combined.length > 0) {
          setProjects(combined);
        } else {
          setProjects(fallbackProjects);
        }
      } catch (error) {
        console.warn('Using fallback project data', error);
        setProjects(fallbackProjects);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return (
    <section id="projects" className="py-24 px-6 bg-midnight-950/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-mono font-semibold tracking-[0.3em] uppercase text-teal-400 mb-3">
            Open Source
          </span>
          <h2 className="section-heading gradient-text-teal">Featured Projects</h2>
          <p className="section-subheading mx-auto">
            Tools, standards, and platforms I've built for the community.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card h-64 animate-pulse bg-midnight-800/20" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((repo, idx) => (
              <div
                key={repo.id}
                className="glass-card p-6 flex flex-col h-full opacity-0 animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Github size={20} className="text-midnight-300" />
                    <span className="text-xs font-mono text-midnight-400">@{repo.owner.login}</span>
                  </div>
                  <div className="flex gap-3">
                    {repo.homepage && (
                      <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="text-midnight-400 hover:text-terracotta-400 transition-colors">
                        <ExternalLink size={18} />
                      </a>
                    )}
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-midnight-400 hover:text-teal-400 transition-colors">
                      <GitBranch size={18} />
                    </a>
                  </div>
                </div>

                <h3 className="font-display font-semibold text-xl text-midnight-100 mb-3 group-hover:text-teal-300 transition-colors line-clamp-1">
                  {repo.name}
                </h3>
                
                <p className="text-midnight-300 text-sm mb-6 flex-grow line-clamp-3">
                  {repo.description || 'A software engineering project built to solve complex distributed problems.'}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-midnight-700/30">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${languageColors[repo.language] || 'bg-midnight-400'}`} />
                    <span className="text-xs font-mono text-midnight-300">{repo.language || 'Unknown'}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-midnight-300">
                    <Star size={14} className={repo.stargazers_count > 0 ? 'text-gold-400 fill-gold-400/20' : ''} />
                    <span className="text-xs font-mono">{repo.stargazers_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center animate-fade-in stagger-6">
          <a
            href="https://github.com/frankmwase"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            <Github size={18} />
            View All on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
