import { ImageResponse } from 'next/og'
import { getStories, getStoryBySlug } from '@/lib/content'
import type { Accent, Atmosphere } from '@/lib/schemas/content'

/**
 * Per-story social card, generated at build time.
 *
 * This is what a recipient actually sees first when the link lands in
 * WhatsApp, Slack, LinkedIn or a mail client — so it is generated from the
 * story's own frontmatter rather than falling back to the site-wide
 * `/og-image.png`.
 *
 * ponytail: no custom font is loaded. Satori's bundled default renders the
 * German diacritics correctly and keeps the build offline-safe (a Docker
 * build must not depend on fetching Cormorant from Google). Load the brand
 * serif here only if the cards ever need to match the page exactly.
 */
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'OneEmergence'

export function generateStaticParams() {
  return getStories().map((s) => ({ slug: s.meta.slug }))
}

const FIELD: Record<Atmosphere, { base: string; from: string; to: string }> = {
  cosmic: { base: '#0A0F1F', from: 'rgba(124,92,255,0.42)', to: 'rgba(84,226,233,0.20)' },
  solarpunk: { base: '#101B2E', from: 'rgba(110,219,143,0.40)', to: 'rgba(246,196,83,0.20)' },
  transitional: { base: '#0A0F1F', from: 'rgba(124,92,255,0.38)', to: 'rgba(232,201,168,0.20)' },
  warm: { base: '#1A1610', from: 'rgba(232,201,168,0.38)', to: 'rgba(246,196,83,0.22)' },
}

const INK: Record<Accent, string> = {
  violet: '#7C5CFF',
  gold: '#F6C453',
  cyan: '#54E2E9',
  green: '#6EDB8F',
  sand: '#E8C9A8',
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const story = await getStoryBySlug(slug)

  const meta = story?.meta
  const field = FIELD[meta?.atmosphere ?? 'cosmic']
  const ink = INK[meta?.accent ?? 'violet']
  const title = meta?.title ?? 'OneEmergence'
  const kicker = meta?.eyebrow ?? 'OneEmergence'
  const deck = meta?.subtitle ?? meta?.description ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '76px 88px',
          backgroundColor: field.base,
          backgroundImage: `radial-gradient(1100px 620px at 78% -12%, ${field.from}, transparent 62%), radial-gradient(900px 560px at 6% 108%, ${field.to}, transparent 66%)`,
          color: '#F7F8FB',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 12,
              backgroundColor: ink,
            }}
          />
          <div
            style={{
              fontSize: 22,
              letterSpacing: 8,
              textTransform: 'uppercase',
              color: ink,
            }}
          >
            {kicker}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: title.length > 58 ? 62 : 82,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              // Satori has no line clamp; frontmatter titles are short by
              // convention and the schema description says so.
              display: 'flex',
            }}
          >
            {title}
          </div>
          {deck && (
            <div
              style={{
                marginTop: 26,
                fontSize: 30,
                lineHeight: 1.35,
                color: 'rgba(247,248,251,0.62)',
                display: 'flex',
              }}
            >
              {deck.length > 130 ? `${deck.slice(0, 127)}…` : deck}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 22,
            color: 'rgba(247,248,251,0.45)',
          }}
        >
          <div style={{ display: 'flex' }}>oneemergence.org</div>
          <div style={{ display: 'flex' }}>{meta?.author ?? 'OneEmergence'}</div>
        </div>
      </div>
    ),
    size,
  )
}
