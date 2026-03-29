import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import {
  JournalMeta,
  ContentType,
  CONTENT_TYPE_DIRS,
  getSchemaForType,
  type ContentMeta,
} from '@/lib/schemas/content'
import { compileMdx } from './mdx'

// ─── Paths ──────────────────────────────────────────────────────────────────

const CONTENT_ROOT = path.join(process.cwd(), 'src/content')
const JOURNAL_DIR = path.join(CONTENT_ROOT, 'journal')
const PAGES_DIR = path.join(CONTENT_ROOT, 'pages')

function contentDir(type: ContentType): string {
  return path.join(CONTENT_ROOT, CONTENT_TYPE_DIRS[type])
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function calcReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function listContentFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
}

function slugFromFilename(filename: string): string {
  return filename.replace(/\.mdx?$/, '')
}

// ─── Legacy Post type (for backward compat with ContentGrid etc.) ───────────

export type Post = {
  slug: string
  title: string
  date: string
  excerpt: string
  cover?: string
  tags?: string[]
  readingTime: number
  content: string
}

// ─── Journal Content ────────────────────────────────────────────────────────

export function getPosts(): Omit<Post, 'content'>[] {
  const files = listContentFiles(JOURNAL_DIR)

  return files
    .map((file) => {
      const slug = slugFromFilename(file)
      const raw = fs.readFileSync(path.join(JOURNAL_DIR, file), 'utf-8')
      const { data, content } = matter(raw)

      const meta = JournalMeta.parse({ ...data, slug })

      return {
        slug: meta.slug,
        title: meta.title,
        date: meta.date,
        excerpt: meta.excerpt,
        cover: meta.cover,
        tags: meta.tags.length > 0 ? meta.tags : undefined,
        readingTime: calcReadingTime(content),
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getPostBySlug(
  slug: string,
): Promise<{ meta: JournalMeta; content: React.ReactElement; readingTime: number } | null> {
  // Try .mdx first, fall back to .md
  const mdxPath = path.join(JOURNAL_DIR, `${slug}.mdx`)
  const mdPath = path.join(JOURNAL_DIR, `${slug}.md`)
  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null
  if (!filePath) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { content: rawContent } = matter(raw)
  const { content, frontmatter } = await compileMdx<Record<string, unknown>>(raw)
  const meta = JournalMeta.parse({ ...frontmatter, slug })

  return {
    meta,
    content,
    readingTime: calcReadingTime(rawContent),
  }
}

export function getAllJournalArticles(): JournalMeta[] {
  const files = listContentFiles(JOURNAL_DIR)

  return files
    .map((file) => {
      const slug = slugFromFilename(file)
      const raw = fs.readFileSync(path.join(JOURNAL_DIR, file), 'utf-8')
      const { data } = matter(raw)
      return JournalMeta.parse({ ...data, slug })
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getAdjacentPosts(
  slug: string,
): { prev: Omit<Post, 'content'> | null; next: Omit<Post, 'content'> | null } {
  const posts = getPosts()
  const index = posts.findIndex((p) => p.slug === slug)
  if (index === -1) return { prev: null, next: null }
  return {
    prev: index < posts.length - 1 ? posts[index + 1] : null,
    next: index > 0 ? posts[index - 1] : null,
  }
}

// ─── Sacred Content ─────────────────────────────────────────────────────────

export function getAllContent(type?: ContentType): ContentMeta[] {
  const types = type ? [type] : (Object.keys(CONTENT_TYPE_DIRS) as ContentType[])

  const all: ContentMeta[] = []

  for (const t of types) {
    const dir = contentDir(t)
    const files = listContentFiles(dir)
    const schema = getSchemaForType(t)

    for (const file of files) {
      const slug = slugFromFilename(file)
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      const { data } = matter(raw)

      try {
        const meta = schema.parse({ ...data, slug, type: t })
        all.push(meta)
      } catch (err) {
        console.error(`[content] Invalid frontmatter in ${t}/${file}:`, err)
        throw err // fail fast
      }
    }
  }

  return all.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getContentBySlug(
  type: ContentType,
  slug: string,
): Promise<{ meta: ContentMeta; content: React.ReactElement } | null> {
  const dir = contentDir(type)
  const mdxPath = path.join(dir, `${slug}.mdx`)
  const mdPath = path.join(dir, `${slug}.md`)
  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null
  if (!filePath) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const schema = getSchemaForType(type)
  const { content, frontmatter } = await compileMdx<Record<string, unknown>>(raw)
  const meta = schema.parse({ ...frontmatter, slug, type })

  return { meta, content }
}

export function getContentByTheme(theme: string): ContentMeta[] {
  return getAllContent().filter((c) => c.themes.includes(theme))
}

export function getContentByTag(tag: string): ContentMeta[] {
  return getAllContent().filter((c) => c.tags.includes(tag))
}

// ─── Pages (legal etc. — keep simple, no MDX needed) ───────────────────────

export async function getPage(slug: string): Promise<{ content: React.ReactElement } | null> {
  const mdPath = path.join(PAGES_DIR, `${slug}.md`)
  const mdxPath = path.join(PAGES_DIR, `${slug}.mdx`)
  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null
  if (!filePath) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { content } = await compileMdx(raw)
  return { content }
}
