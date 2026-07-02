'use client';

import { Mail, MapPin, Send, Github, Twitter } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-mono font-semibold tracking-[0.3em] uppercase text-terracotta-400 mb-3">
            Get In Touch
          </span>
          <h2 className="section-heading gradient-text">Let's Connect</h2>
          <p className="section-subheading mx-auto">
            Open for collaborations, consulting, or just a chat about distributed systems.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contact Info */}
          <div className="space-y-8 animate-slide-in-right">
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl" />
              
              <h3 className="text-2xl font-display font-bold text-midnight-100 mb-6">
                Contact Information
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-midnight-800/50 flex items-center justify-center shrink-0 border border-midnight-700/30">
                    <Mail className="text-terracotta-400" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-midnight-400 mb-1">Email</p>
                    <a href="mailto:princefranklinemwase@gmail.com" className="text-lg font-medium text-midnight-100 hover:text-terracotta-400 transition-colors">
                      princefranklinemwase@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-midnight-800/50 flex items-center justify-center shrink-0 border border-midnight-700/30">
                    <MapPin className="text-teal-400" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-midnight-400 mb-1">Location</p>
                    <p className="text-lg font-medium text-midnight-100">
                      Malawi, Africa
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-midnight-700/30">
                <p className="text-sm text-midnight-400 mb-4">Follow my work</p>
                <div className="flex items-center gap-4">
                  <a
                    href="https://github.com/princemwase"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-midnight-800/40 border border-midnight-600/20 text-midnight-300 hover:text-white hover:border-midnight-500 hover:bg-midnight-700 transition-all duration-300"
                    aria-label="GitHub @princemwase"
                  >
                    <Github size={20} />
                  </a>
                  <a
                    href="https://github.com/frankmwase"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-midnight-800/40 border border-midnight-600/20 text-midnight-300 hover:text-white hover:border-midnight-500 hover:bg-midnight-700 transition-all duration-300"
                    aria-label="GitHub @frankmwase"
                  >
                    <Github size={20} />
                  </a>
                  <a
                    href="https://twitter.com/MwaseSparrow"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-midnight-800/40 border border-midnight-600/20 text-midnight-300 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/10 transition-all duration-300"
                    aria-label="Twitter"
                  >
                    <Twitter size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card p-8 opacity-0 animate-slide-up stagger-2">
            <form className="space-y-6" action="mailto:princefranklinemwase@gmail.com" method="POST" encType="text/plain">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-midnight-300 ml-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-5 py-3 rounded-xl bg-midnight-900/50 border border-midnight-700/50 focus:border-terracotta-500/50 focus:ring-2 focus:ring-terracotta-500/20 text-midnight-100 outline-none transition-all duration-300"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-midnight-300 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-5 py-3 rounded-xl bg-midnight-900/50 border border-midnight-700/50 focus:border-terracotta-500/50 focus:ring-2 focus:ring-terracotta-500/20 text-midnight-100 outline-none transition-all duration-300"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-midnight-300 ml-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full px-5 py-3 rounded-xl bg-midnight-900/50 border border-midnight-700/50 focus:border-terracotta-500/50 focus:ring-2 focus:ring-terracotta-500/20 text-midnight-100 outline-none transition-all duration-300 resize-none"
                  placeholder="Hello Prince, I'd like to talk about..."
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary justify-center group"
              >
                Send Message
                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
