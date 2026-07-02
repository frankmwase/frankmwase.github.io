import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { Calendar, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPostBySlug, getPostSlugs, BlogPostMeta } from '@/lib/mdx';
// Import highlight.js styles
import 'highlight.js/styles/atom-one-dark.css';

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug: slug.replace(/\.mdx?$/, ''),
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = getPostBySlug(params.slug);
    return {
      title: post.meta.title,
      description: post.meta.summary,
    };
  } catch (e) {
    return {
      title: 'Post Not Found',
    };
  }
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  let post: { slug: string, meta: BlogPostMeta, content: string };
  try {
    post = getPostBySlug(params.slug);
  } catch (e) {
    notFound();
  }

  const { meta, content } = post;

  const options = {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeHighlight],
    },
  };

  return (
    <main className="min-h-screen flex flex-col bg-midnight-950">
      <Navbar />
      
      <article className="flex-grow pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <Link 
            href="/blog/"
            className="inline-flex items-center gap-2 text-sm font-medium text-midnight-400 hover:text-teal-400 transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Link>

          <header className="mb-12 pb-8 border-b border-midnight-800">
            <h1 className="text-3xl md:text-5xl font-display font-bold text-midnight-100 mb-6 leading-tight">
              {meta.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-midnight-400">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-terracotta-400" />
                <time dateTime={meta.date}>
                  {new Date(meta.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {meta.tags.map((tag: string) => (
                  <span key={tag} className="flex items-center gap-1">
                    <Tag size={12} className="text-teal-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </header>

          <div className="prose-custom">
            <MDXRemote source={content} options={options as any} />
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
