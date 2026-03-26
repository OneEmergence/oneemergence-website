import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

export type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  cover?: string;
  tags?: string[];
  readingTime: number;
  content: string;
};

const JOURNAL_DIR = path.join(process.cwd(), "src/content/journal");

function calcReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function getPosts(): Omit<Post, "content">[] {
  const files = fs.readdirSync(JOURNAL_DIR).filter((f) => f.endsWith(".md"));

  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(JOURNAL_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? "",
        excerpt: data.excerpt ?? "",
        cover: data.cover,
        tags: Array.isArray(data.tags) ? data.tags : undefined,
        readingTime: calcReadingTime(content),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(JOURNAL_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    excerpt: data.excerpt ?? "",
    cover: data.cover,
    tags: Array.isArray(data.tags) ? data.tags : undefined,
    readingTime: calcReadingTime(content),
    content: marked.parse(content) as string,
  };
}

export function getAdjacentPosts(
  slug: string
): { prev: Omit<Post, "content"> | null; next: Omit<Post, "content"> | null } {
  const posts = getPosts();
  const index = posts.findIndex((p) => p.slug === slug);

  if (index === -1) return { prev: null, next: null };

  return {
    prev: index < posts.length - 1 ? posts[index + 1] : null,
    next: index > 0 ? posts[index - 1] : null,
  };
}
