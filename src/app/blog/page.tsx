import Link from 'next/link';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllPosts, BlogPostMeta } from '@/lib/mdx';

export const metadata = {
  title: 'Blog',
  description: 'Articles on distributed systems, fintech, and open-source development.',
};

export default function BlogList() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen flex flex-col bg-midnight-950">
      <Navbar />
      
      <div className="flex-grow pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-midnight-100 mb-6">
              Engineering <span className="gradient-text-teal">Thoughts</span>
            </h1>
            <p className="text-lg text-midnight-300 max-w-2xl mx-auto">
              Writing about architecture, Go, TypeScript, and building scalable systems for the African context.
            </p>
          </div>

          <div className="space-y-8">
            {posts.map((post: BlogPostMeta, idx: number) => (
              <article 
                key={post.slug}
                className="glass-card p-8 group hover:border-teal-500/30 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex items-center gap-4 text-xs font-mono text-midnight-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-teal-400" />
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <Link href={`/blog/${post.slug}/`}>
                  <h2 className="text-2xl font-display font-bold text-midnight-100 mb-3 group-hover:text-teal-300 transition-colors">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-midnight-300 leading-relaxed mb-6">
                  {post.summary}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag: string) => (
                      <span key={tag} className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-midnight-800/50 text-midnight-300 border border-midnight-700/30">
                        <Tag size={10} className="text-terracotta-400" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link 
                    href={`/blog/${post.slug}/`}
                    className="flex items-center gap-2 text-sm font-semibold text-teal-400 group-hover:text-teal-300 transition-colors"
                  >
                    Read Article
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
