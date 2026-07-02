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
              An interactive graph database mapping the relationships between technologies, 
              local laws, and regional standards in Malawi. Search for concepts to see 
              triggered compliance advisories.
            </p>
          </div>

          <KnowledgeMesh />
          
          <div className="mt-16 glass-card p-8 text-center max-w-3xl mx-auto">
            <h3 className="text-xl font-display font-semibold text-midnight-100 mb-4">
              How it works
            </h3>
            <p className="text-midnight-300 text-sm leading-relaxed mb-6">
              This is a Phase 1 client-side simulation. In Phase 2, this will be powered by a 
              Go API running a hybrid semantic search. It will convert your query into a vector 
              using <code className="text-terracotta-400 bg-midnight-900 px-1.5 py-0.5 rounded">all-MiniLM-L6-v2</code>, 
              perform a Cosine Similarity search in PostgreSQL via <code className="text-terracotta-400 bg-midnight-900 px-1.5 py-0.5 rounded">pgvector</code>, 
              and then execute a Breadth-First Search (BFS) graph traversal to pull related compliance laws.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
