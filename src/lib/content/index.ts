import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import {
  JournalMeta,
  StoryMeta,
  ContentType,
  CONTENT_TYPE_DIRS,
  getSchemaForType,
  type ContentMeta,
  type AnyContentMeta,
} from '@/lib/schemas/content'
import { compileMdx } from './mdx'

// ─── Paths ──────────────────────────────────────────────────────────────────

const CONTENT_ROOT = path.join(process.cwd(), 'src/content')
const JOURNAL_DIR = path.join(CONTENT_ROOT, 'journal')
const PAGES_DIR = path.join(CONTENT_ROOT, 'pages')
const STORIES_DIR = path.join(CONTENT_ROOT, 'stories')

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

// ─── Stories ────────────────────────────────────────────────────────────────
//
// One `.mdx` file in src/content/stories/ ⇒ one shareable page at /s/<slug>.
// Everything about presentation (atmosphere, accent, hero, CTA) is frontmatter;
// the body is MDX using the kit in components/content/mdx-kit.

export type StoryEntry = { meta: StoryMeta; readingTime: number }

function readStory(file: string): StoryEntry {
  const slug = slugFromFilename(file)
  const raw = fs.readFileSync(path.join(STORIES_DIR, file), 'utf-8')
  const { data, content } = matter(raw)
  return {
    meta: StoryMeta.parse({ ...data, slug }),
    readingTime: calcReadingTime(content),
  }
}

/**
 * All published stories, newest first.
 *
 * `listed: false` stories are still returned — they are real pages that must
 * be statically generated. Filter with `.filter(s => s.meta.listed)` for the
 * index and the sitemap; a direct link keeps working either way.
 */
export function getStories(): StoryEntry[] {
  return listContentFiles(STORIES_DIR)
    .map(readStory)
    .filter((s) => s.meta.published)
    .sort((a, b) => (a.meta.date < b.meta.date ? 1 : -1))
}

export async function getStoryBySlug(
  slug: string,
): Promise<{ meta: StoryMeta; content: React.ReactElement; readingTime: number } | null> {
  const mdxPath = path.join(STORIES_DIR, `${slug}.mdx`)
  const mdPath = path.join(STORIES_DIR, `${slug}.md`)
  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null
  if (!filePath) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { content: rawContent } = matter(raw)
  const { content, frontmatter } = await compileMdx<Record<string, unknown>>(raw)
  const meta = StoryMeta.parse({ ...frontmatter, slug })
  if (!meta.published) return null

  return { meta, content, readingTime: calcReadingTime(rawContent) }
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
): Promise<{ meta: AnyContentMeta; content: React.ReactElement } | null> {
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

// ─── Library (unified view across journal + sacred content) ────────────────

export type LibraryItem = {
  slug: string
  title: string
  date: string
  excerpt: string
  cover?: string
  tags: string[]
  readingTime: number
  /** 'journal' for legacy journal posts, or a sacred ContentType */
  libraryType: 'journal' | ContentType
}

/**
 * Returns a unified, date-sorted list of all published content for the library.
 * Combines journal posts and sacred content into a single shape.
 */
export function getLibraryItems(): LibraryItem[] {
  const items: LibraryItem[] = []

  // Journal posts
  for (const post of getPosts()) {
    items.push({
      slug: post.slug,
      title: post.title,
      date: post.date,
      excerpt: post.excerpt,
      cover: post.cover,
      tags: post.tags ?? [],
      readingTime: post.readingTime,
      libraryType: 'journal',
    })
  }

  // Sacred content types
  const sacredTypes = Object.keys(CONTENT_TYPE_DIRS) as ContentType[]
  for (const type of sacredTypes) {
    const dir = contentDir(type)
    const files = listContentFiles(dir)
    const schema = getSchemaForType(type)

    for (const file of files) {
      const slug = slugFromFilename(file)
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      const { data, content: rawContent } = matter(raw)

      try {
        const meta = schema.parse({ ...data, slug, type })
        if (!meta.published) continue
        items.push({
          slug: meta.slug,
          title: meta.title,
          date: meta.date,
          excerpt: meta.excerpt,
          cover: meta.cover,
          tags: meta.tags,
          readingTime: meta.duration ?? calcReadingTime(rawContent),
          libraryType: type,
        })
      } catch (err) {
        console.error(`[library] Invalid frontmatter in ${type}/${file}:`, err)
      }
    }
  }

  return items.sort((a, b) => (a.date < b.date ? 1 : -1))
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
