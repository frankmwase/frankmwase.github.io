'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Network, BookOpen, Home, User, Briefcase, Mail } from 'lucide-react';

const navLinks = [
  { href: '#home', label: 'Home', icon: Home },
  { href: '#about', label: 'About', icon: User },
  { href: '#projects', label: 'Projects', icon: Briefcase },
  { href: '/blog/', label: 'Blog', icon: BookOpen },
  { href: '/knowledge/', label: 'Knowledge Mesh', icon: Network },
  { href: '#contact', label: 'Contact', icon: Mail },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-midnight-950/80 backdrop-blur-xl border-b border-midnight-700/30 shadow-2xl shadow-midnight-950/50'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-terracotta-500 to-terracotta-600 flex items-center justify-center font-display font-bold text-white text-sm group-hover:scale-110 transition-transform duration-300">
            PM
          </div>
          <span className="font-display font-semibold text-midnight-100 hidden sm:block">
            prince<span className="text-terracotta-400">mwase</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-lg text-sm font-medium text-midnight-300 hover:text-terracotta-300 hover:bg-midnight-800/50 transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          id="mobile-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg text-midnight-300 hover:text-terracotta-400 hover:bg-midnight-800/50 transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-6 space-y-1 bg-midnight-950/95 backdrop-blur-xl border-b border-midnight-700/30">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-midnight-300 hover:text-terracotta-300 hover:bg-midnight-800/40 transition-all duration-200"
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
