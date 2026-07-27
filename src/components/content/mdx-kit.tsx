import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Accent, Atmosphere } from '@/lib/schemas/content'

/**
 * The MDX authoring kit.
 *
 * Every component here is a Server Component — the kit ships **zero client
 * JavaScript**. Scroll choreography runs on CSS `animation-timeline: view()`
 * and native `<details>`, both gated by `html[data-intensity]`. They are
 * registered globally in `lib/content/mdx.tsx`, so any `.mdx` file under
 * `src/content/` can use them without importing anything.
 *
 * Layout contract: the article root carries `.oe-prose`, a full-bleed grid
 * with three named columns — `text` (default), `wide`, `full`. Components that
 * need to escape the reading column set `oe-wide` / `oe-full`; see
 * `globals.css` § "Story layout".
 */

// ─── Accent tokens ──────────────────────────────────────────────────────────

// NOTE: every class below must appear as a literal string — Tailwind v4 scans
// source text, so `hover:${s.border}` would silently produce no CSS. That is
// why `hover` is its own field instead of a variant applied at the call site.
type AccentStyle = {
  text: string
  border: string
  bg: string
  hover: string
  solid: string
  rule: string
  glow: string
}

export const ACCENTS: Record<Accent, AccentStyle> = {
  violet: {
    text: 'text-oe-aurora-violet',
    border: 'border-oe-aurora-violet/25',
    bg: 'bg-oe-aurora-violet/[0.06]',
    hover: 'hover:border-oe-aurora-violet/40 hover:bg-oe-aurora-violet/[0.07]',
    solid: 'bg-oe-aurora-violet text-white',
    rule: 'from-oe-aurora-violet/50 via-oe-spirit-cyan/25',
    glow: 'text-glow-violet',
  },
  gold: {
    text: 'text-oe-solar-gold',
    border: 'border-oe-solar-gold/25',
    bg: 'bg-oe-solar-gold/[0.06]',
    hover: 'hover:border-oe-solar-gold/40 hover:bg-oe-solar-gold/[0.07]',
    solid: 'bg-oe-solar-gold text-oe-deep-space',
    rule: 'from-oe-solar-gold/50 via-oe-warm-sand/25',
    glow: 'text-glow-gold',
  },
  cyan: {
    text: 'text-oe-spirit-cyan',
    border: 'border-oe-spirit-cyan/25',
    bg: 'bg-oe-spirit-cyan/[0.06]',
    hover: 'hover:border-oe-spirit-cyan/40 hover:bg-oe-spirit-cyan/[0.07]',
    solid: 'bg-oe-spirit-cyan text-oe-deep-space',
    rule: 'from-oe-spirit-cyan/50 via-oe-aurora-violet/25',
    glow: 'text-glow-cyan',
  },
  green: {
    text: 'text-oe-living-green',
    border: 'border-oe-living-green/25',
    bg: 'bg-oe-living-green/[0.06]',
    hover: 'hover:border-oe-living-green/40 hover:bg-oe-living-green/[0.07]',
    solid: 'bg-oe-living-green text-oe-deep-space',
    rule: 'from-oe-living-green/50 via-oe-solar-gold/25',
    glow: 'text-glow-green',
  },
  sand: {
    text: 'text-oe-warm-sand',
    border: 'border-oe-warm-sand/25',
    bg: 'bg-oe-warm-sand/[0.06]',
    hover: 'hover:border-oe-warm-sand/40 hover:bg-oe-warm-sand/[0.07]',
    solid: 'bg-oe-warm-sand text-oe-deep-space',
    rule: 'from-oe-warm-sand/50 via-oe-solar-gold/25',
    glow: 'text-glow-sand',
  },
}

function accent(name: string | undefined): AccentStyle {
  return ACCENTS[(name as Accent) ?? 'violet'] ?? ACCENTS.violet
}

// ─── Structure ──────────────────────────────────────────────────────────────

/**
 * A full-bleed scroll chapter with its own background that fades in as the
 * section enters the viewport and out as it leaves — the "scroll background".
 *
 * Driven entirely by CSS `animation-timeline: view()`: no scroll listener, no
 * JS, compositor-only (opacity + transform). Falls back to a static background
 * where the timeline is unsupported, and to a flat wash in Still mode.
 *
 * Motion level: Flow (drift is Event — immersive only).
 */
export function Stage({
  children,
  atmosphere = 'cosmic',
  image,
  align = 'text',
  className,
}: {
  children: React.ReactNode
  /** Colour field for this chapter. Independent of the page atmosphere. */
  atmosphere?: Atmosphere
  /** Optional photographic layer, e.g. "/images/backgrounds/depth-warm.webp". */
  image?: string
  /** `text` keeps the reading column, `wide` widens it for galleries. */
  align?: 'text' | 'wide'
  className?: string
}) {
  return (
    <section
      className={cn('oe-full oe-stage', className)}
      data-atmosphere={atmosphere}
      data-motion-level="flow"
    >
      <div className="oe-stage__bg" aria-hidden="true">
        <div className="oe-stage__layer">
          <div className="oe-stage__wash" />
          {image && (
            <div
              className="oe-stage__image"
              style={{ '--oe-stage-image': `url("${image}")` } as React.CSSProperties}
            />
          )}
        </div>
      </div>
      <div className={cn('oe-stage__body', align === 'wide' && 'oe-stage__body--wide')}>
        {children}
      </div>
    </section>
  )
}

/** Breaks out of the reading column into the wider band. */
export function Wide({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('oe-wide', className)}>{children}</div>
}

/** Edge-to-edge. Use sparingly — one or two per page. */
export function Full({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('oe-full', className)}>{children}</div>
}

/** Two balanced columns on desktop, stacked on mobile. */
export function Columns({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('oe-wide my-12 grid gap-8 sm:gap-10 md:grid-cols-2', className)}>
      {children}
    </div>
  )
}

/** Gradient hairline. `space` adds breathing room around it. */
export function Divider({ accent: a, space = 'md' }: { accent?: string; space?: 'sm' | 'md' | 'lg' }) {
  const gap = { sm: 'my-8', md: 'my-14', lg: 'my-24' }[space]
  return (
    <div
      role="presentation"
      className={cn('h-px bg-gradient-to-r to-transparent', accent(a).rule, gap)}
    />
  )
}

// ─── Editorial ──────────────────────────────────────────────────────────────

// NOTE: components whose children come from markdown render a `<div>`, never
// a `<p>`. MDX wraps multi-line children in their own paragraph, and a nested
// `<p>` is invalid HTML that surfaces as a hydration mismatch at runtime.

/** Oversized opening paragraph. One per page, right after the hero. */
export function Lead({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-8 font-serif text-xl leading-relaxed text-oe-pure-light/85 sm:text-2xl sm:leading-relaxed">
      {children}
    </div>
  )
}

/** Small uppercase label. Marks a section without spending a heading level. */
export function Eyebrow({ children, accent: a }: { children: React.ReactNode; accent?: string }) {
  return (
    <div
      className={cn(
        'not-prose mt-16 mb-3 font-mono text-xs tracking-[0.3em] uppercase',
        accent(a).text,
      )}
    >
      {children}
    </div>
  )
}

export function PullQuote({
  children,
  author,
  role,
  accent: a,
}: {
  children: React.ReactNode
  author?: string
  role?: string
  accent?: string
}) {
  return (
    <figure className="oe-wide not-prose my-16">
      <blockquote
        className={cn(
          'font-serif text-2xl leading-snug text-balance text-oe-pure-light/90 sm:text-4xl',
        )}
      >
        {children}
      </blockquote>
      {author && (
        <figcaption className="mt-6 text-sm text-oe-pure-light/45">
          <span className={accent(a).text}>{author}</span>
          {role && <span> — {role}</span>}
        </figcaption>
      )}
    </figure>
  )
}

/** Row of headline numbers. Wrap 2–4 `<Stat>` children. */
export function Stats({ children }: { children: React.ReactNode }) {
  return (
    <div className="oe-wide not-prose my-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
      {children}
    </div>
  )
}

export function Stat({
  value,
  label,
  note,
  accent: a,
}: {
  value: string
  label: string
  note?: string
  accent?: string
}) {
  const s = accent(a)
  return (
    <div className={cn('rounded-2xl border p-6', s.border, s.bg)}>
      <p className={cn('font-serif text-4xl leading-none sm:text-5xl', s.text)}>{value}</p>
      <p className="mt-3 text-sm text-oe-pure-light/70">{label}</p>
      {note && <p className="mt-1 text-xs text-oe-pure-light/40">{note}</p>}
    </div>
  )
}

/** Grid of soft cards. Wrap 2–6 `<Card>` children. */
export function Cards({ children }: { children: React.ReactNode }) {
  return (
    <div className="oe-wide not-prose my-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  )
}

export function Card({
  title,
  children,
  href,
  accent: a,
}: {
  title: string
  children?: React.ReactNode
  href?: string
  accent?: string
}) {
  const s = accent(a)
  const body = (
    <>
      <p className="font-serif text-xl text-oe-pure-light">{title}</p>
      {children && <div className="mt-2 text-sm leading-relaxed text-oe-pure-light/60">{children}</div>}
    </>
  )
  const shell = cn(
    'block h-full rounded-2xl border border-oe-pure-light/8 bg-oe-pure-light/[0.03] p-6 transition-colors duration-300',
    href && s.hover,
  )
  return href ? (
    <Link href={href} data-cursor-hover className={cn(shell, 'group')}>
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  )
}

/**
 * Image with caption. Defaults to the wide band and a 16:9 frame; pass
 * `ratio="4/3" | "1/1" | "21/9"` or `full` for edge-to-edge.
 */
export function Figure({
  src,
  alt,
  caption,
  ratio = '16/9',
  full = false,
  priority = false,
}: {
  src: string
  alt: string
  caption?: string
  ratio?: string
  full?: boolean
  priority?: boolean
}) {
  return (
    <figure className={cn('not-prose my-14', full ? 'oe-full' : 'oe-wide')}>
      <div
        className={cn('relative overflow-hidden', full ? '' : 'rounded-2xl')}
        style={{ aspectRatio: ratio }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={full ? '100vw' : '(max-width: 768px) 100vw, 60rem'}
          className="object-cover"
        />
      </div>
      {caption && (
        <figcaption className="mx-auto mt-3 max-w-2xl px-4 text-center text-sm text-oe-pure-light/40">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

/** Numbered process. Wrap `<Step title="...">` children. */
export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="oe-wide not-prose my-14 grid gap-4 [counter-reset:oe-step]">{children}</ol>
}

export function Step({
  title,
  children,
  accent: a,
}: {
  title: string
  children?: React.ReactNode
  accent?: string
}) {
  const s = accent(a)
  return (
    <li className="oe-step grid grid-cols-[auto_1fr] items-start gap-5 rounded-2xl border border-oe-pure-light/8 bg-oe-pure-light/[0.03] p-6">
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 grid h-9 w-9 place-items-center rounded-full border font-mono text-sm',
          s.border,
          s.text,
        )}
      >
        <span className="oe-step__num" />
      </span>
      <div>
        <p className="font-serif text-xl text-oe-pure-light">{title}</p>
        {children && (
          <div className="mt-2 text-sm leading-relaxed text-oe-pure-light/65">{children}</div>
        )}
      </div>
    </li>
  )
}

/** Accordion built on native `<details>` — keyboard and screen-reader native. */
export function FAQ({ children }: { children: React.ReactNode }) {
  return <div className="oe-wide not-prose my-14 grid gap-3">{children}</div>
}

export function QA({
  q,
  children,
  accent: a,
}: {
  q: string
  children: React.ReactNode
  accent?: string
}) {
  return (
    <details className="group rounded-2xl border border-oe-pure-light/8 bg-oe-pure-light/[0.03] px-6 open:bg-oe-pure-light/[0.05]">
      <summary
        data-cursor-hover
        className={cn(
          'flex min-h-[3.25rem] cursor-pointer list-none items-center justify-between gap-4 py-4 font-serif text-lg text-oe-pure-light marker:content-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oe-solar-gold',
        )}
      >
        {q}
        <span
          aria-hidden="true"
          className={cn('text-xl leading-none transition-transform duration-300 group-open:rotate-45', accent(a).text)}
        >
          +
        </span>
      </summary>
      <div className="pb-6 text-sm leading-relaxed text-oe-pure-light/65">{children}</div>
    </details>
  )
}

/** Closing (or mid-page) call to action. */
export function CTA({
  title,
  children,
  label,
  href,
  accent: a,
}: {
  title?: string
  children?: React.ReactNode
  label: string
  href: string
  accent?: string
}) {
  const s = accent(a)
  const external = href.startsWith('http') || href.startsWith('mailto:')
  const button = cn(
    'mt-6 inline-block rounded-full px-7 py-3 text-sm font-medium transition-opacity duration-200 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oe-solar-gold',
    s.solid,
  )

  return (
    <aside className={cn('oe-wide not-prose my-16 rounded-3xl border p-8 text-center sm:p-12', s.border, s.bg)}>
      {title && <p className="font-serif text-2xl text-balance text-oe-pure-light sm:text-3xl">{title}</p>}
      {children && <div className="mx-auto mt-3 max-w-xl text-sm text-oe-pure-light/60">{children}</div>}
      {external ? (
        <a href={href} data-cursor-hover className={button}>
          {label}
        </a>
      ) : (
        <Link href={href} data-cursor-hover className={button}>
          {label}
        </Link>
      )}
    </aside>
  )
}

/** The component map handed to MDX. `ACCENTS` is a token table, not a
 *  component, so it stays out of it — MDXComponents rejects non-components. */
export const mdxKit = {
  Stage,
  Wide,
  Full,
  Columns,
  Divider,
  Lead,
  Eyebrow,
  PullQuote,
  Stats,
  Stat,
  Cards,
  Card,
  Figure,
  Steps,
  Step,
  FAQ,
  QA,
  CTA,
  Reveal,
}

/**
 * Fades and lifts its children as they scroll into view.
 *
 * No client JS: pure CSS `animation-timeline: view()`, gated to balanced +
 * immersive. Without timeline support (or in Still mode) children are simply
 * visible — there is no invisible-content failure mode.
 *
 * Motion level: Flow.
 */
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('oe-reveal', className)} data-motion-level="flow">
      {children}
    </div>
  )
}
