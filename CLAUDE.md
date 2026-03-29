# Claude Agent Instructions

## Projekt: OneEmergence Website

Dieses Dokument dient als Einstiegspunkt für Claude (und andere Agents), um an der OneEmergence-Website zu arbeiten.

### Stack
- Next.js 15+ (App Router, Server Components first)
- React 19
- TypeScript (strict, no `any`)
- Tailwind CSS v4 + CSS custom properties
- Motion (Framer Motion), clsx, tailwind-merge, lucide-react
- Zustand (client state islands), Zod (validation), React Hook Form
- MDX for content, next-intl for i18n
- Sentry (monitoring), Playwright (E2E tests)
- Optional: React Three Fiber, Three.js, GSAP, Lenis, Tone.js

### Planning Documents
- **`VISION.md`** — Product vision, UX philosophy, content system, AI Guide, product staging
- **`ARCHITECTURE.md`** — Technical stack, coding paradigms, folder structure, migration path
- Always read both before starting significant feature work.

### Design System & Theme
- Farben sind in `tailwind.config.ts` und `src/app/globals.css` als Design-Tokens konfiguriert.
- Primärfarben:
  - Background: `--background` (Deep Space / Pure Light)
  - Foreground: `--foreground`
  - Brand: `oe-deep-space`, `oe-aurora-violet`, `oe-solar-gold`, `oe-spirit-cyan`, `oe-pure-light`
- Typografie:
  - Headers: Cormorant (serif)
  - Body: Inter (sans-serif)
- Darkness is space, not merely a dark theme. Light emerges intentionally from void.

### Dateistruktur (Current → Target)
Current:
- `src/app/`: Next.js App Router Pages
- `src/components/ui/`: UI-Komponenten
- `src/components/sections/`: Page-Sektionen
- `src/components/layout/`: Header, Footer, Wrapper
- `src/lib/`: Utils (cn, content)
- `src/content/`: Statische Inhalte (Markdown)

Target (see `ARCHITECTURE.md` for full structure):
- `src/components/motion/`: Motion components (ScrollReveal, ParallaxLayer, BreathingOrb)
- `src/components/scene/`: WebGL scenes
- `src/components/content/`: Sacred content type renderers
- `src/features/`: Feature modules (journal, guide, rituals, map, paths)
- `src/lib/actions/`, `schemas/`, `content/`, `analytics/`, `auth/`
- `src/stores/`: Zustand stores (intensity mode, audio, preferences)
- `src/i18n/`: next-intl messages

### Coding Paradigms
1. **Server-first**: Default to Server Components. Client Components are islands with `'use client'`.
2. **Server actions for mutations**: No API routes except for webhooks.
3. **Content as system**: Sacred content types (Teaching, Reflection, Practice, Transmission, Visual Essay, Sound Journey) are first-class entities with Zod schemas and dedicated renderers.
4. **Motion hierarchy**: Every animation declares its level (Micro / Flow / Sacred / Event). Sacred and Event only render in Balanced/Immersive intensity modes.
5. **Performance budget**: LCP < 2.5s, CLS < 0.1, INP < 200ms. WebGL is lazy-loaded.
6. **Accessibility-first mysticism**: WCAG AA baseline, `prefers-reduced-motion` respected, Still mode is a first-class experience.

### Aufgaben für Agents
1. **Komponentenbau**: Erstelle UI-Komponenten in `src/components/ui/` und nutze `cn()` aus `src/lib/utils.ts`.
2. **Seitenaufbau**: Folge `VISION.md` für Produkt-Vision und `ARCHITECTURE.md` für technische Entscheidungen.
3. **Styling**: Strikt Tailwind und die definierten Brand-Farben. Darkness as space.
4. **Motion**: Verwende Motion (Framer Motion) und deklariere die Motion-Ebene (Micro/Flow/Sacred/Event).
5. **Content**: Sacred Content System Typen respektieren. Zod-Schema für Frontmatter.
6. **Code-Style**: Striktes TypeScript, funktionale Komponenten, Server Components by default, Mobile-first.

### Aktueller Stand
Phase 1 (Foundation) ist vollständig abgeschlossen:
- Alle Core-Pages gebaut: Home, Manifesto, About, Content, Journal, Events, Community, Contact, Legal
- Layout-System: Navbar, Footer, SmoothScroll, AudioProvider, CustomCursor
- UI-Primitives: Button, MagneticButton, AmbientOrb, ScrollReveal, ParallaxImage, ContentGrid
- Content-System: Markdown + Frontmatter mit 3 Journal-Artikeln
- SEO: Per-Page Metadata, Sitemap, OG-Tags
- Responsive Design: Mobile & Tablet optimiert

### Nächste Schritte
Siehe `ARCHITECTURE.md` Section VII (Migration Path) für die nächsten strukturellen Änderungen vor neuem Feature-Bau. Dann `VISION.md` Section VIII (Product Staging) für MVP v1 Features.
