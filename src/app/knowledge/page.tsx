import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import KnowledgeMesh from '@/components/KnowledgeMesh';

export const metadata = {
  title: 'Malawi Knowledge Mesh',
  description: 'An interactive semantic search engine and compliance advisor for the Malawi tech ecosystem.',
};

export default function KnowledgePage() {
  return (
    <main className="min-h-screen flex flex-col bg-midnight-950">
      <Navbar />
      
      <div className="flex-grow pt-32 pb-24 px-6 relative">
        {/* Ambient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-terracotta-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-midnight-100 mb-6">
              Malawi <span className="gradient-text-teal">Knowledge Mesh</span>
            </h1>
            <p className="text-lg text-midnight-300 max-w-3xl mx-auto leading-relaxed">
              Explore reviewed sources connecting technologies and guidance relevant to Malawi.
              Draft entries are labeled; relationships are research leads, not legal advice.
            </p>
          </div>

          <KnowledgeMesh />

          <div className="mt-16 glass-card p-8 text-center max-w-3xl mx-auto">
            <h3 className="text-xl font-display font-semibold text-midnight-100 mb-4">How it works</h3>
            <p className="text-midnight-300 text-sm leading-relaxed mb-6">
              The graph and search results come from the same reviewed dataset. Search combines
              local MiniLM similarity with ranked text matching when available and labels lexical
              fallback explicitly. Ordered paths show how entries are related, not automatic obligations.
              Verify applicability with the linked primary sources before acting.
            </p>
            <a href="https://github.com/frankmwase/frankmwase.github.io/issues/new/choose" target="_blank" rel="noopener noreferrer" className="text-teal-300 underline">Propose a sourced addition</a>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
