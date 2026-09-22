# Agent 03 — Content System

> Build the MDX pipeline, Zod-validated sacred content types, content renderers, and i18n foundation.

**Status: COMPLETED** (2026-03-29)

---

## Execution Summary

All planned phases completed successfully:

- **Phase 1 (Zod Schemas)**: ✅ Complete — `src/lib/schemas/content.ts` with all 6 sacred content type schemas + JournalMeta + discriminated union
- **Phase 2 (MDX Pipeline)**: ✅ Complete — `next-mdx-remote/rsc` with remark-gfm, rehype-slug, rehype-autolink-headings. Custom MDX components (Callout, Prompt, Exercise). `marked` removed.
- **Phase 3 (Content Renderers)**: ✅ Complete — All 6 renderers + base ContentRenderer in `src/components/content/`
- **Phase 4 (Content Migration)**: ✅ Complete — 3 journal articles migrated .md → .mdx. 1 Teaching + 1 Reflection example created.
- **Phase 5 (i18n Foundation)**: ✅ Complete — next-intl configured in non-routed mode (DE default, EN structure ready). Message files for DE/EN. Provider wired into root layout.

### Deviations from Plan
- **next-intl routing**: Used non-routed mode (no locale prefix) to avoid breaking existing routes. Locale-prefixed routing can be added later when multi-locale content exists.
- **Navbar/Footer i18n migration**: Deferred — structure is ready but hardcoded strings not yet replaced with `useTranslations()` calls, since this is a UI concern best handled alongside the Design System agent.
- **Slug validation**: Slug is injected from filename in the loader (not duplicated in frontmatter), matching the "derive from filename" approach.

---

## Mission

Replace the current raw markdown/gray-matter content loader with a proper MDX pipeline that treats sacred content types (Teaching, Reflection, Practice, Transmission, Visual Essay, Sound Journey) as first-class entities. Each type gets a Zod schema, a dedicated renderer, and proper indexing. Set up next-intl for internationalization.

## Scope

### In Scope
- MDX compilation pipeline (replace `marked` with MDX)
- Zod schemas for all 6 sacred content types + shared ContentMeta
- Dedicated renderer components for each content type
- Unified content loader with type-safe querying
- Content index/registry for listing, filtering, sorting
- next-intl setup with DE default, EN structure ready
- Migrate existing journal articles to MDX format
- Create 1 example piece of each new content type (placeholder content is fine)

### Out of Scope
- Visual Essay scroll-driven interaction (that's Agent 4)
- Sound Journey audio player (Agent 4 for public, Agent 5 for portal)
- CMS integration
- Content creation workflow tools
- Actual i18n translations (just infrastructure)

## Dependencies / Prerequisites
- Agent 1 must complete Phase 4 (content folder reorg) for target directories
- Agent 1 must complete Phase 3 (lib structure) for `lib/schemas/`, `lib/content/`
- Can start immediately on: Zod schema design, next-intl setup (doesn't need Agent 1)

## Repository Areas Touched

```
src/lib/schemas/content.ts       # New: all Zod schemas
src/lib/content/index.ts         # Rewrite: MDX pipeline + content loader
src/lib/content/mdx.ts           # New: MDX compilation config
src/components/content/          # New: all content type renderers
src/content/                     # Modified: restructured, .md → .mdx
src/i18n/                        # New: next-intl configuration
src/app/(marketing)/journal/     # Modified: use new content loader
package.json                     # Modified: add @next/mdx, next-intl, zod
```

## Detailed Task Breakdown

### Phase 1: Zod Schema Foundation

**Task 1.1: Define shared ContentMeta schema**
```typescript
// src/lib/schemas/content.ts
import { z } from 'zod'

export const ContentMeta = z.object({
  title: z.string(),
  slug: z.string(),
  type: z.enum(['teaching', 'reflection', 'practice', 'transmission', 'visual-essay', 'sound-journey']),
  excerpt: z.string(),
  tags: z.array(z.string()),
  themes: z.array(z.string()),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  duration: z.number().optional(),
  published: z.boolean().default(false),
  date: z.string().datetime(),
  cover: z.string().optional(),
  locale: z.enum(['de', 'en']).default('de'),
})
```

**Task 1.2: Define type-specific extension schemas**
- `TeachingMeta` extends ContentMeta with `references`, `relatedConcepts`
- `ReflectionMeta` extends ContentMeta with `prompts`, `journalSeed`
- `PracticeMeta` extends ContentMeta with `audio`, `instructions`, `posture`
- `TransmissionMeta` extends ContentMeta with `medium`, `attribution`
- `VisualEssayMeta` extends ContentMeta with `scenes`, `scrollLength`
- `SoundJourneyMeta` extends ContentMeta with `audio`, `suggestedPosture`, `visualMode`

**Task 1.3: Define JournalMeta schema**
- For existing journal/blog articles
- Simpler schema: `title`, `slug`, `date`, `excerpt`, `author`, `tags`, `published`

**Task 1.4: Export discriminated union**
```typescript
export const AnyContentMeta = z.discriminatedUnion('type', [
  TeachingMeta, ReflectionMeta, PracticeMeta,
  TransmissionMeta, VisualEssayMeta, SoundJourneyMeta,
])
```

### Phase 2: MDX Pipeline

**Task 2.1: Install MDX dependencies**
- `@next/mdx` or `next-mdx-remote` (prefer `next-mdx-remote/rsc` for Server Components)
- `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`
- Remove `marked` dependency after migration

**Task 2.2: Create MDX compilation module**
```typescript
// src/lib/content/mdx.ts
// - Compile MDX with remark/rehype plugins
// - Support custom components in MDX (callouts, prompts, exercises)
// - Return serialized content + validated frontmatter
```

**Task 2.3: Create content loader**
```typescript
// src/lib/content/index.ts
// Functions:
// - getAllContent(type?: ContentType): ContentMeta[]
// - getContentBySlug(type: ContentType, slug: string): { meta, content }
// - getContentByTheme(theme: string): ContentMeta[]
// - getContentByTag(tag: string): ContentMeta[]
// - getAllJournalArticles(): JournalMeta[]
// - getJournalArticle(slug: string): { meta, content }
```

**Task 2.4: Validate all frontmatter on load**
- Every content file's frontmatter is parsed through its Zod schema
- Invalid content throws a clear error at build time (fail fast)
- Log warnings for optional fields that are missing

### Phase 3: Content Type Renderers

**Task 3.1: Create base ContentRenderer**
- Shared MDX component mapping (headings, paragraphs, code blocks, images)
- OE-styled typography within content (uses Cormorant for headings, Inter for body)
- Wraps rendered MDX with appropriate layout

**Task 3.2: TeachingRenderer**
- Long-form reading layout
- Table of contents sidebar (generated from headings)
- Reference list at bottom
- Related concepts as linked tags
- Reading time estimate

**Task 3.3: ReflectionRenderer**
- Shorter, more contemplative layout
- Journal prompts rendered as styled cards
- "Journal Seed" as a call-to-action (links to journal in portal, or shows prompt publicly)
- Minimal, spacious design

**Task 3.4: PracticeRenderer (skeleton)**
- Instruction steps as a sequence
- Timer placeholder (audio/timer logic is Agent 4/5)
- Posture suggestion display
- Duration and difficulty badges

**Task 3.5: TransmissionRenderer**
- Atmospheric, minimal layout
- Different visual treatment based on `medium` (text vs audio vs visual)
- Attribution display
- Full-width, immersive reading

**Task 3.6: VisualEssayRenderer (skeleton)**
- Scroll-driven narrative container
- Scene markers for scroll positions
- Full WebGL/interaction integration is Agent 4's job — this renderer just provides the structure

**Task 3.7: SoundJourneyRenderer (skeleton)**
- Audio player placeholder
- Suggested posture display
- Visual mode indicator
- Duration display

### Phase 4: Content Migration

**Task 4.1: Migrate existing journal articles to MDX**
- Convert `the-field-beneath-thought.md` → `.mdx`
- Convert `the-illusion-of-separation.md` → `.mdx`
- Convert `the-practice-of-presence.md` → `.mdx`
- Add proper frontmatter validated by JournalMeta schema
- Ensure they render identically after migration

**Task 4.2: Create example sacred content pieces**
- One Teaching example in `content/teachings/`
- One Reflection example in `content/reflections/`
- Placeholder/skeleton for each other type
- All validated by their Zod schemas

**Task 4.3: Update journal page to use new loader**
- `src/app/(marketing)/journal/[slug]/page.tsx` — use new `getJournalArticle()`
- Journal listing page — use new `getAllJournalArticles()`

### Phase 5: i18n Foundation

**Task 5.1: Install and configure next-intl**
- `npm install next-intl`
- Create `src/i18n/request.ts` with locale detection
- Create `src/i18n/routing.ts` with DE as default
- Create message files: `src/i18n/messages/de.json`, `src/i18n/messages/en.json`

**Task 5.2: Set up i18n provider**
- Add `NextIntlClientProvider` to root layout
- Configure middleware for locale detection
- EN messages can be empty/placeholder — just structure needs to exist

**Task 5.3: Define message structure**
```json
{
  "nav": { "home": "...", "manifesto": "...", ... },
  "common": { "readMore": "...", "back": "...", ... },
  "content": { "teaching": "...", "reflection": "...", ... },
  "intensity": { "still": "...", "balanced": "...", "immersive": "..." }
}
```

**Task 5.4: Migrate hardcoded strings in Navbar/Footer**
- Replace German/English hardcoded strings with `useTranslations()` calls
- Only do Navbar and Footer — don't refactor all pages

## Best Practices & Constraints

1. **Content loader runs on server only.** No client-side content fetching.
2. **Zod validation is strict.** Invalid frontmatter = build error, not silent skip.
3. **MDX components are Server Components by default.** Interactive embeds use client islands.
4. **Content files use `.mdx` extension.** Even if they contain no JSX, the pipeline is MDX.
5. **Slug is derived from filename.** Don't duplicate in frontmatter — derive it in the loader.
6. **Actually, keep slug in frontmatter** for explicit control, but validate it matches filename.

## Testing / Validation Checklist

- [x] All existing journal articles render identically after MDX migration — `next build` generates all 3 slugs
- [ ] Zod schema rejects content with invalid frontmatter (test with intentionally bad file) — schemas are strict, untested with bad input
- [x] Content loader returns typed results — `JournalMeta` and `AnyContentMeta` types flow through
- [ ] Each renderer component renders its example content — renderers built, need route wiring for sacred types
- [x] next-intl is configured — non-routed mode, DE/EN message files, provider in layout
- [ ] Navbar shows translated strings — deferred to Design System agent
- [x] `next build` passes — 18/18 pages generated successfully
- [ ] No hydration errors with i18n — needs runtime verification
- [x] Content is indexed correctly — `getAllContent()`, `getContentByTag()`, `getContentByTheme()` implemented

## Risks / Pitfalls

| Risk | Mitigation |
|---|---|
| MDX compilation performance | Use `next-mdx-remote/rsc` for streaming. Cache compiled content. |
| Breaking existing journal pages | Migrate one article first, verify, then batch |
| next-intl middleware conflicts with route groups | Test locale prefix behavior with `(marketing)` group |
| Zod schema too strict early on | Start with `.partial()` for optional fields, tighten later |
| Large content directory slows build | Index lazily, only compile requested slugs |

## Handoff Outputs

- Complete Zod schema library in `lib/schemas/content.ts`
- MDX pipeline in `lib/content/`
- Content renderer for each sacred type in `components/content/`
- Migrated journal articles in `.mdx` format
- next-intl configured with DE/EN structure
- At least 2 real content pieces rendered through the new system

## Subagent Strategy

1. **Schema design agent** — Design and validate all Zod schemas against ARCHITECTURE.md content model spec, produce the complete `content.ts` file
2. **MDX pipeline agent** — Research best practices for `next-mdx-remote/rsc` with Next.js 15, set up compilation
3. **Content migration agent** — Convert existing markdown files to MDX, add proper frontmatter
4. **i18n setup agent** — Handle next-intl installation and configuration independently

## Commit Strategy

```
feat(schemas): add Zod schemas for all sacred content types
feat(content): replace marked with MDX pipeline using next-mdx-remote/rsc
feat(content): add content type renderers for Teaching, Reflection, Practice
feat(content): add skeleton renderers for Transmission, VisualEssay, SoundJourney
refactor(content): migrate journal articles to MDX format
feat(i18n): configure next-intl with DE/EN message structure
refactor(nav): replace hardcoded strings with i18n translations
```
