# OneEmergence

A digital consciousness portal built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4.

> Einheit. Freiheit. Liebe.

## Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 + design tokens
- **Animation:** Framer Motion
- **Content:** Markdown + frontmatter
- **Icons:** Lucide React

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/           → Pages (App Router)
  components/
    ui/          → Reusable primitives (Button, ScrollReveal, etc.)
    sections/    → Page sections (ContentGrid, etc.)
    layout/      → Navbar, Footer, AudioProvider, SmoothScroll
  content/       → Markdown content (journal articles, legal pages)
  lib/           → Utilities (cn, content helpers)
  styles/        → Global styles
```

## Pages

| Route | Status |
|---|---|
| `/` | Home — Living Portal with AmbientOrb |
| `/manifesto` | Vision, values, principles |
| `/about` | Origin story, team |
| `/content` | Content hub — journal articles |
| `/journal/[slug]` | Individual articles |
| `/events` | Gatherings, retreats, sessions |
| `/community` | Onboarding, values, join flow |
| `/contact` | Contact form |
| `/legal/imprint` | Impressum |
| `/legal/privacy` | Datenschutz |

## Planning

- [VISION.md](./VISION.md) — Product vision, UX philosophy, AI Guide, content system, product staging
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical stack, coding paradigms, folder structure, migration path

## Design Tokens

| Token | Hex | Role |
|---|---|---|
| `oe-deep-space` | `#0A0F1F` | Background |
| `oe-aurora-violet` | `#7C5CFF` | Accent |
| `oe-solar-gold` | `#F6C453` | Headlines |
| `oe-spirit-cyan` | `#54E2E9` | Secondary accent |
| `oe-pure-light` | `#F7F8FB` | Text |

## Deploy

Hosted on [Vercel](https://vercel.com). Push to `main` triggers production deployment.
