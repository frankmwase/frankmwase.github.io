export default function Footer() {
  return (
    <footer className="border-t border-midnight-800 bg-midnight-950 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-terracotta-500 to-terracotta-600 flex items-center justify-center font-display font-bold text-white text-xs">
            PM
          </div>
          <span className="font-display font-semibold text-midnight-100">
            prince<span className="text-terracotta-400">mwase</span>
          </span>
        </div>

        <div className="text-midnight-400 text-sm text-center md:text-left">
          &copy; {new Date().getFullYear()} Prince Mwase. All rights reserved.
        </div>

        <div className="flex gap-6 text-sm font-medium">
          <a href="#home" className="text-midnight-400 hover:text-terracotta-400 transition-colors">
            Home
          </a>
          <a href="/blog/" className="text-midnight-400 hover:text-teal-400 transition-colors">
            Blog
          </a>
          <a href="/knowledge/" className="text-midnight-400 hover:text-gold-400 transition-colors">
            Knowledge Mesh
          </a>
        </div>
      </div>
    </footer>
  );
}
