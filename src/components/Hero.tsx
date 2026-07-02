'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Github, Twitter, MapPin } from 'lucide-react';

const roles = [
  'Full Stack Engineer',
  'Distributed Systems Architect',
  'Open Source Contributor',
  'Fintech Innovator',
];

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect
  useEffect(() => {
    const currentRole = roles[roleIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayText.length < currentRole.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentRole.slice(0, displayText.length + 1));
        }, 80);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 40);
      } else {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, roleIndex]);

  // Mesh particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      const count = Math.min(80, Math.floor(window.innerWidth / 15));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.15;
            ctx.strokeStyle = `rgba(26, 159, 171, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 90, 58, ${p.opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        aria-hidden="true"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-midnight-950/60 via-transparent to-midnight-950 z-[1]" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
     

        {/* Name */}
        <h1 className="font-display font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight mb-6 animate-fade-in">
          <span className="text-midnight-100">Prince</span>{' '}
          <span className="gradient-text">Mwase</span>
        </h1>

        {/* Typewriter role */}
        <div className="h-10 md:h-12 flex items-center justify-center mb-8">
          <span className="font-mono text-lg md:text-xl text-teal-400 tracking-wide">
            {'> '}
            <span>{displayText}</span>
            <span className="inline-block w-0.5 h-5 md:h-6 bg-terracotta-400 ml-1 animate-blink align-middle" />
          </span>
        </div>

        {/* Description */}
        <p className="text-midnight-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in stagger-2">
          Building high-performance distributed systems and open-source tools
          that power fintech, education, and civic infrastructure across Africa.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in stagger-3">
          <a href="#projects" className="btn-primary">
            View My Work
            <ArrowDown size={16} />
          </a>
          <a href="/knowledge/" className="btn-ghost">
            Explore Knowledge Mesh
          </a>
        </div>

        {/* Social links */}
        <div className="flex items-center justify-center gap-4 animate-fade-in stagger-4">
          <a
            href="https://github.com/princemwase"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-midnight-800/40 border border-midnight-600/20 text-midnight-400 hover:text-terracotta-400 hover:border-terracotta-500/30 transition-all duration-300"
            aria-label="GitHub (princemwase)"
          >
            <Github size={20} />
          </a>
          <a
            href="https://github.com/frankmwase"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-midnight-800/40 border border-midnight-600/20 text-midnight-400 hover:text-terracotta-400 hover:border-terracotta-500/30 transition-all duration-300"
            aria-label="GitHub (frankmwase)"
          >
            <Github size={20} />
          </a>
          <a
            href="https://twitter.com/MwaseSparrow"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-midnight-800/40 border border-midnight-600/20 text-midnight-400 hover:text-terracotta-400 hover:border-terracotta-500/30 transition-all duration-300"
            aria-label="Twitter"
          >
            <Twitter size={20} />
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float">
        <ArrowDown size={20} className="text-midnight-500" />
      </div>
    </section>
  );
}
