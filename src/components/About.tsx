'use client';

import { Terminal, Code2, Globe2 } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-24 px-6 relative bg-midnight-950/30">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Image/Visual side */}
          <div className="relative animate-slide-up">
            <div className="aspect-square max-w-md mx-auto relative">
              {/* Abstract code block representation instead of photo for now */}
              <div className="absolute inset-0 bg-gradient-to-tr from-terracotta-500/20 to-teal-500/20 rounded-3xl transform -rotate-6 scale-105 blur-xl opacity-50" />
              <div className="absolute inset-0 bg-midnight-900 rounded-3xl border border-midnight-700/50 shadow-2xl overflow-hidden flex flex-col">
                <div className="h-10 bg-midnight-950 border-b border-midnight-800 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="p-6 font-mono text-sm text-midnight-300 flex-1 overflow-hidden relative">
                  <div className="text-teal-400 mb-2">package main</div>
                  <div className="mb-2">
                    <span className="text-terracotta-400">import</span> (
                    <br />
                    <span className="text-gold-400 pl-4">"fmt"</span>
                    <br />
                    <span className="text-gold-400 pl-4">"github.com/princemwase/core"</span>
                    <br />
                    )
                  </div>
                  <div className="mb-2">
                    <span className="text-teal-400">func</span> <span className="text-blue-400">main</span>() {'{'}
                  </div>
                  <div className="pl-4 mb-2">
                    engineer := core.<span className="text-blue-400">NewEngineer</span>(
                    <br />
                    <span className="pl-4">Name: <span className="text-gold-400">"Prince Mwase"</span>,</span>
                    <br />
                    <span className="pl-4">Role: <span className="text-gold-400">"Full Stack / Distributed Systems"</span>,</span>
                    <br />
                    <span className="pl-4">Base: <span className="text-gold-400">"Malawi"</span>,</span>
                    <br />
                    )
                  </div>
                  <div className="pl-4">
                    fmt.<span className="text-blue-400">Println</span>(engineer.<span className="text-blue-400">BuildSystems</span>())
                  </div>
                  <div>{'}'}</div>
                  
                  {/* Overlay to fade out bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-midnight-900 to-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Content side */}
          <div className="animate-slide-in-right stagger-2">
            <span className="inline-block text-xs font-mono font-semibold tracking-[0.3em] uppercase text-terracotta-400 mb-3">
              About Me
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-midnight-100 mb-6">
              Engineering solutions for the <span className="gradient-text">African context</span>.
            </h2>
            
            <div className="space-y-4 text-midnight-300 leading-relaxed mb-8">
              <p>
                I'm a Full Stack Engineer based in Malawi with over 8 years of experience building 
                distributed systems, scalable backends, and intuitive user interfaces.
              </p>
              <p>
                My work focuses on creating robust infrastructure for fintech interoperability 
                and digital platforms across Africa. I believe in open-source standards, 
                clean architecture, and systems that perform reliably under constraints.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                  <Terminal className="text-teal-400" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-midnight-100 mb-1">Backend First</h3>
                  <p className="text-sm text-midnight-400">Specialized in Go, Node.js, and complex API design.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-terracotta-500/10 flex items-center justify-center shrink-0">
                  <Globe2 className="text-terracotta-400" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-midnight-100 mb-1">Ecosystem Builder</h3>
                  <p className="text-sm text-midnight-400">Creator of MW-JSON and Malawi Postal Codes.</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
