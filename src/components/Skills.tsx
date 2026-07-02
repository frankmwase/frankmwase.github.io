'use client';

import { Code2, Server, Database, Globe, Shield, Cpu, Layers, GitBranch } from 'lucide-react';

const skills = [
  {
    category: 'Languages',
    items: [
      { name: 'Go', level: 95 },
      { name: 'TypeScript', level: 92 },
      { name: 'JavaScript', level: 95 },
      { name: 'Python', level: 80 },
      { name: 'PHP', level: 75 },
    ],
    icon: Code2,
    color: 'from-teal-400 to-teal-600',
  },
  {
    category: 'Frontend',
    items: [
      { name: 'React / Next.js', level: 92 },
      { name: 'Vue.js', level: 78 },
      { name: 'React Native', level: 80 },
      { name: 'Tailwind CSS', level: 90 },
      { name: 'D3.js', level: 70 },
    ],
    icon: Globe,
    color: 'from-terracotta-400 to-terracotta-600',
  },
  {
    category: 'Backend & Systems',
    items: [
      { name: 'Distributed Systems', level: 90 },
      { name: 'REST / gRPC APIs', level: 92 },
      { name: 'Microservices', level: 88 },
      { name: 'Event-Driven Architecture', level: 85 },
      { name: 'Docker / Kubernetes', level: 82 },
    ],
    icon: Server,
    color: 'from-blue-400 to-blue-600',
  },
  {
    category: 'Data & Storage',
    items: [
      { name: 'PostgreSQL', level: 90 },
      { name: 'MySQL', level: 85 },
      { name: 'Redis', level: 82 },
      { name: 'MongoDB', level: 75 },
      { name: 'Graph Databases', level: 70 },
    ],
    icon: Database,
    color: 'from-gold-400 to-gold-500',
  },
];

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-mono font-semibold tracking-[0.3em] uppercase text-terracotta-400 mb-3">
            Technical Arsenal
          </span>
          <h2 className="section-heading gradient-text">Skills & Expertise</h2>
          <p className="section-subheading mx-auto">
            8+ years of building production systems across the full stack
          </p>
        </div>

        {/* Skill cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((category, idx) => {
            const Icon = category.icon;
            return (
              <div
                key={category.category}
                className="glass-card p-6 opacity-0 animate-slide-up"
                style={{ animationDelay: `${idx * 0.15}s`, animationFillMode: 'forwards' }}
              >
                {/* Category header */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-midnight-100">
                    {category.category}
                  </h3>
                </div>

                {/* Skill bars */}
                <div className="space-y-4">
                  {category.items.map((skill) => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-midnight-300 font-medium">
                          {skill.name}
                        </span>
                        <span className="text-xs text-midnight-500 font-mono">
                          {skill.level}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-midnight-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${category.color} transition-all duration-1000 ease-out`}
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional tech badges */}
        <div className="mt-12 text-center">
          <p className="text-sm text-midnight-500 mb-4 font-mono">
            Also experienced with
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              'Nginx',
              'Linux',
              'CI/CD',
              'GitHub Actions',
              'Django',
              'Celery',
              'WebSockets',
              'OAuth 2.0',
              'JWT',
              'ONNX Runtime',
              'pgvector',
              'S3/R2',
            ].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-lg bg-midnight-800/50 border border-midnight-700/30 text-xs text-midnight-400 font-mono hover:border-terracotta-500/30 hover:text-terracotta-400 transition-colors cursor-default"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
