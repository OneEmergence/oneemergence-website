import { CONTENT_TYPE_DIRS, type ContentType } from '@/lib/schemas/content'
import type { LibraryItem } from './index'

/**
 * The single source of truth for how a library entry presents itself.
 *
 * Before this existed, the index and the detail page each carried their own
 * map: the index knew only `teaching` and `reflection` and labelled the other
 * four sacred types "Journal" with a green dot, while the detail page showed
 * the correct label and a different dot colour for the very same item.
 */
export type LibraryType = 'journal' | ContentType

export type LibraryTypeMeta = {
  label: string
  /** Text token for the eyebrow on the detail page. */
  color: string
  /** Background token for the index card's type dot. */
  dotColor: string
}

export const LIBRARY_TYPE_META: Record<LibraryType, LibraryTypeMeta> = {
  journal: {
    label: 'Journal',
    color: 'text-oe-aurora-violet',
    dotColor: 'bg-oe-aurora-violet',
  },
  teaching: {
    label: 'Lehre',
    color: 'text-oe-solar-gold',
    dotColor: 'bg-oe-solar-gold',
  },
  reflection: {
    label: 'Reflexion',
    color: 'text-oe-spirit-cyan',
    dotColor: 'bg-oe-spirit-cyan',
  },
  practice: {
    label: 'Praxis',
    color: 'text-oe-living-green',
    dotColor: 'bg-oe-living-green',
  },
  transmission: {
    label: 'Transmission',
    color: 'text-oe-aurora-violet',
    dotColor: 'bg-oe-aurora-violet',
  },
  'visual-essay': {
    label: 'Visueller Essay',
    color: 'text-oe-spirit-cyan',
    dotColor: 'bg-oe-spirit-cyan',
  },
  'sound-journey': {
    label: 'Klangreise',
    color: 'text-oe-warm-sand',
    dotColor: 'bg-oe-warm-sand',
  },
}

export const LIBRARY_TYPES = Object.keys(LIBRARY_TYPE_META) as LibraryType[]

export function libraryTypeMeta(type: string): LibraryTypeMeta {
  return LIBRARY_TYPE_META[type as LibraryType] ?? LIBRARY_TYPE_META.journal
}

/**
 * Canonical URL for a library entry.
 *
 * Journal posts live at `/journal/<slug>`; `/library/journal/<slug>`
 * permanently redirects there (next.config.ts). Sacred content lives under
 * `/library/<type>/<slug>`.
 */
export function libraryItemHref(item: Pick<LibraryItem, 'libraryType' | 'slug'>): string {
  return item.libraryType === 'journal'
    ? `/journal/${item.slug}`
    : `/library/${item.libraryType}/${item.slug}`
}

/** Route segments the `/library/[type]/[slug]` route accepts. */
export const VALID_LIBRARY_TYPES = new Set<string>([
  'journal',
  ...(Object.keys(CONTENT_TYPE_DIRS) as ContentType[]),
])
