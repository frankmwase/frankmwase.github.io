'use client';

import { Briefcase, Calendar, CheckCircle2 } from 'lucide-react';

const experiences = [
  {
    id: 1,
    role: 'Full Stack Engineer & Distributed Systems Architect',
    company: 'Northedge / Open Source / Founding SKill Rise',
    period: '2025 - Present',
    description: 'Focusing on building high-performance, distributed systems and standards for the African tech ecosystem.',
    achievements: [
      'Authored the MW-JSON Standard, a unified protocol for fintech interoperability in Malawi.',
      'Developed Quick-Ticket, a Go-based Backend-as-a-Service for ticketing systems.',
      'Created the Malawi Postal Codes SDK supporting TypeScript and Python.',
      'Built SkillRise Africa infrastructure to support tech education.',
    ],
  },
  {
    id: 2,
    role: 'Senior Software Engineer',
    company: 'Various Tech Companies',
    period: '2021 - 2025',
    description: 'Led development of scalable backend services and modern frontend applications.',
    achievements: [
      'Lead Developer at sitbec limited',
      'Software Engineer at QubedCare',
      'Technical LEad at NorthEdge Analytics',
      'Architected microservices using Go and Node.js to handle high-throughput transactions.',
      'Mentored junior engineers and established CI/CD pipelines and testing standards.',
      'Optimized database queries and implemented caching strategies with Redis.',
    ],
  },
  {
    id: 3,
    role: 'Software Engineer',
    company: 'Coming Up',
    period: '2016 - 2019',
    description: 'Full stack development focusing on MVP delivery and rapid iteration.',
    achievements: [
      'Focused on building interactive web applications using React and Vue.js.',
      'Developed RESTful APIs using Python, PHP, and Node.js.',
      'Developed Cross platform applications using Electron and ionic',
      'Developed ML tools for chichewa parts of speech tagger'
    ],
  },
];

export default function Experience() {
  return (
    <section id="experience" className="py-24 px-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-mono font-semibold tracking-[0.3em] uppercase text-terracotta-400 mb-3">
            Career Journey
          </span>
          <h2 className="section-heading gradient-text">Experience</h2>
          <p className="section-subheading mx-auto">
            8 years of translating complex business requirements into robust technical solutions.
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-midnight-700/50 -translate-x-1/2 hidden md:block" />

          <div className="space-y-12">
            {experiences.map((exp, idx) => (
              <div 
                key={exp.id}
                className={`relative flex flex-col md:flex-row gap-8 ${
                  idx % 2 === 0 ? 'md:flex-row-reverse' : ''
                } opacity-0 animate-slide-up`}
                style={{ animationDelay: `${idx * 0.2}s`, animationFillMode: 'forwards' }}
              >
                {/* Center dot for desktop */}
                <div className="absolute left-0 md:left-1/2 top-0 w-8 h-8 -translate-x-1/2 rounded-full border-4 border-midnight-900 bg-terracotta-500 hidden md:flex items-center justify-center z-10 shadow-[0_0_15px_rgba(200,90,58,0.5)]">
                  <Briefcase size={14} className="text-white" />
                </div>

                {/* Content */}
                <div className={`md:w-1/2 ${idx % 2 === 0 ? 'md:pl-12' : 'md:pr-12'}`}>
                  <div className="glass-card p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-terracotta-500/10 to-transparent rounded-bl-full pointer-events-none transition-all duration-500 group-hover:scale-150" />
                    
                    <div className="flex items-center gap-2 text-terracotta-400 mb-3 font-mono text-sm">
                      <Calendar size={16} />
                      <span>{exp.period}</span>
                    </div>

                    <h3 className="text-xl font-display font-bold text-midnight-100 mb-1">
                      {exp.role}
                    </h3>
                    <h4 className="text-midnight-300 font-medium mb-4">
                      {exp.company}
                    </h4>
                    
                    <p className="text-midnight-400 text-sm leading-relaxed mb-6">
                      {exp.description}
                    </p>

                    <ul className="space-y-3">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-midnight-300">
                          <CheckCircle2 size={16} className="text-teal-400 shrink-0 mt-0.5" />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
