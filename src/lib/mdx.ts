import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDir = path.join(process.cwd(), 'src/content/blog');

export interface BlogPostMeta {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  coverImage?: string;
  slug: string;
}

export function getPostSlugs() {
  if (!fs.existsSync(contentDir)) return [];
  return fs.readdirSync(contentDir)
    .filter(path => /\.mdx?$/.test(path));
}

export function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.mdx?$/, '');
  const fullPath = path.join(contentDir, `${realSlug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug: realSlug,
    meta: data as BlogPostMeta,
    content,
  };
}

export function getAllPosts(): BlogPostMeta[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .sort((post1, post2) => (post1.meta.date > post2.meta.date ? -1 : 1))
    .map(post => ({ ...post.meta, slug: post.slug }));
  return posts;
}
