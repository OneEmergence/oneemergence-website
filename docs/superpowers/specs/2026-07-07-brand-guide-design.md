# OneEmergence Brand Guide — Design Spec

Date: 2026-07-07
Status: Approved by Julius (interview + visual brainstorm, Direction A chosen)

## Purpose

A living HTML brand guide at `/brand`, built as a page in the Next.js app. It is
the single source of truth for anyone producing OneEmergence material:

- Internal devs and AI agents building the website
- External designers and creatives producing on-brand assets
- Marketing and social content creators

The page is public, in English, listed in the sitemap, and rendered from the
real design tokens in `src/app/globals.css` — the guide *is* proof the system
works.

## Brand Direction: "Kosmos-Kern" (Direction A)

The existing cosmic identity stays the core. Two new colors extend it so the
brand can express three coordinated mood worlds.

### Core narrative — Emergence as a journey inward

The brand is structured as **three depth layers**. The visual world shifts with
the user's proximity to their personal inner space:

| Depth | Name | Feeling | Where |
|---|---|---|---|
| Outer | **Cosmic** | Awe, stillness, threshold | Home/Living Portal, Manifesto, first contact, marketing |
| Middle | **Solarpunk** | Growth, aliveness, hope | Community, Events, Experiences, Library |
| Inner | **Human Warmth** | Intimacy, groundedness | Portal/Inner space: Journal, Practice, Guide, Map |

The inner layer stays **dark and intimate** (warm-toned dark, not light) —
darkness remains space at every depth; what changes is temperature and accent.

### Color system

Core palette (existing, unchanged):

| Token | Hex | Role |
|---|---|---|
| `oe-deep-space` | `#0A0F1F` | Primary background — the void |
| `oe-aurora-violet` | `#7C5CFF` | Primary accent — mystery, consciousness |
| `oe-solar-gold` | `#F6C453` | Secondary accent — light, emergence |
| `oe-spirit-cyan` | `#54E2E9` | Tertiary accent — clarity, spirit |
| `oe-pure-light` | `#F7F8FB` | Foreground on dark |

New extensions (added in this work):

| Token | Hex | Role |
|---|---|---|
| `oe-living-green` | `#6EDB8F` | Solarpunk layer accent — growth, nature |
| `oe-warm-sand` | `#E8C9A8` | Human-warmth layer accent — skin, earth, intimacy |
| `oe-depth-cosmic` | `#0A0F1F` | Outer layer surface (alias of deep space) |
| `oe-depth-solarpunk` | `#101B2E` | Middle layer surface — teal-shifted dark |
| `oe-depth-warm` | `#1A1610` | Inner layer surface — warm-shifted dark |

Layer accent mapping: Cosmic → violet + cyan. Solarpunk → green + gold.
Human Warmth → sand + gold. Gold is the connective thread through all layers.

### Typography (unchanged)

- Headers: **Cormorant** (serif) — via `--font-family-serif`
- Body: **Inter** (sans) — via `--font-family-sans`

### Logo

The cosmic yin-yang emblem. Files (in `public/images/`):

- `Gemini_OneEmergence.jpeg` — original with space background (1024×1024)
- `logo-cosmic-yinyang.png` — background removed, transparent (1024×1024)
- `logo-cosmic-yinyang-trimmed.png` — trimmed to emblem + 16px pad (803×815)

Meaning: the blue (cosmos/structure) and orange (life/warmth) halves mirror the
outer↔inner journey; each half carries the seed of the other. Guide documents:
clear space (½ emblem width), minimum size (48px digital), approved backgrounds
(deep space, depth surfaces, pure light), and don'ts (no recolor, no distortion,
no busy backgrounds, no drop shadows).

## The `/brand` page

Route: `src/app/(marketing)/brand/page.tsx` — server component, small
`'use client'` islands only for interactive motion demos. Added to sitemap
(priority 0.5) and footer nav. Sticky in-page jump navigation.

### Chapters

1. **Essence** — brand core in three sentences; the emergence principle;
   "darkness is space" philosophy.
2. **The Three Depths** — the layer model: palette mapping, feeling, usage
   rules, one mood preview per layer.
3. **Logo** — variants, meaning, clear space, minimum size, don'ts.
4. **Colors** — all tokens rendered live from CSS variables as swatches with
   hex + usage notes + WCAG AA contrast guidance (which combos are text-safe).
5. **Typography** — Cormorant + Inter specimens, the type scale in use,
   line-length guidance.
6. **Motion & Interaction** — the four motion levels (Micro / Flow / Sacred /
   Event) with live demos, durations/easings from tokens
   (`--oe-transition-*`), behavior per intensity mode (Still / Balanced /
   Immersive).
7. **Voice & Tone** — how OneEmergence speaks: calm, precise, invitational,
   grounded; never vague-esoteric, never salesy. Do/don't sentence pairs for
   web and social.
8. **Imagery & Assets** — rules for AI-generated artworks (cosmic poster
   style), photography guidance, asset downloads (logo files).

## Website adaptation (phase 2)

Apply the three-depths model across the existing site, artistically:

- **Marketing pages** (cosmic + solarpunk layers): Home/Living Portal and
  Manifesto stay deep-space cosmic; Community, Events, Experiences, Library
  shift toward the solarpunk layer (depth-solarpunk surface tints,
  living-green accents).
- **Portal/Inner pages** (warm layer): `(portal)/inner/*` shifts to the warm
  depth surface and sand accents — intimate, grounded.
- Motion levels and intensity modes respected everywhere; WCAG AA maintained.

## Out of scope (deliberate)

No CMS, no bilingual guide, no PDF export, no sub-routes — all can be added
later when a real need appears.
