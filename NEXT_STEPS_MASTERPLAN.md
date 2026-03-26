# OneEmergence Website — Meisterwerk Masterplan

Dieses Dokument dient als zentrale Orchestrierungs-Roadmap für die parallelen Agent-Entwicklungen, um die OneEmergence-App von einer "guten Basis" zu einem absoluten, immersiven Meisterwerk (technisch & visuell) hochzuziehen.

## Phase 1: Die Architektur-Lücken schließen (Content & Backend)
*Derzeit fehlt uns das gesamte CMS/MDX Fundament für Artikel, Readings und Events.*

- [x] **Abhängigkeiten installieren:** `gray-matter`, `marked` (oder `next-mdx-remote`) für lokales Markdown-Parsing, `lenis` für Smooth-Scrolling.
- [x] **MDX/Markdown Engine bauen (`src/lib/content.ts`):**
  - Funktion `getPosts()`, `getPostBySlug()`, `getAdjacentPosts()`
  - Typ `Post` (Title, Date, Cover, Tags, Excerpt, Content, ReadingTime)
  - `marked.parse()` für korrekte v17-API, `gray-matter` für Frontmatter
- [x] **Content Hub & Journal Pages implementieren:**
  - `src/app/content/page.tsx` — CSS Grid mit Featured-First-Layout, Cover-Images, Tags
  - `src/app/journal/[slug]/page.tsx` — Hero-Cover, Prose-Typo, Prev/Next-Navigation, CTA
  - 3 Seed-Dateien in `src/content/journal/` angelegt
  - `public/images/journal/` Verzeichnis für Cover-Bilder vorbereitet

## Phase 2: Visuelle & Immersive Exzellenz (Das "Kunst-Gefühl")
*Die Website soll sich anfühlen wie ein lebendiges Spielfeld, nicht wie eine statische Dokumentation.*

- [x] **Smooth Scroll (Lenis):**
  - Integration von Studio Freight's `lenis` im Root-Layout für butterweiches Scrollen.
- [x] **Magnetische Buttons & Cursor (Motion):**
  - Ein globaler, custom Cursor (kleiner Dot), der sich invertiert, wenn er über Links hovert.
  - "Magnetic" Hover-Effekt für die Navbar-Links und den Primary Button (ziehen sich leicht zum Cursor).
- [x] **Scroll-Triggered Animations (Parallax & Reveal):**
  - Parallax-Effekt für Hintergrundbilder in Content-Cards.
  - Großformatige Text-Enthüllungen (Character-by-Character Fade-In für Philosophie-Zitate beim Runterscrollen).

## Phase 3: Fehlende IA-Seiten & Feature-Komplettierung
*Laut PLAN.md gibt es noch mehrere unvollendete Platzhalter.*

- [x] **`/about` (Team/Ursprung):**
  - Storytelling-Layout mit wechselnden Text/Bild-Blöcken.
- [x] **`/events` (Live & Digital):**
  - Timeline/Listen-Ansicht für kommende Gatherings/Readings mit "Add to Calendar" / "Join" CTAs.
- [x] **`/community` (Mitmachen):**
  - Erklärung der Onboarding-Schritte, Link zu Discord/Telegram.
- [x] **Formulare & Kontakt (`/contact`):**
  - Wunderschönes, minimales Kontaktformular. Visuelles Feedback (Success-State) ohne Reload.
- [x] **Legal (`/legal/imprint`, `/legal/privacy`):**
  - Minimalistisches Markdown-Rendering für rechtliche Pflichttexte.
  - Inhalte als Markdown in `src/content/pages/` — Server Components mit `@tailwindcss/typography` prose styling.
  - `getPage()` Funktion in `src/lib/content.ts` ergänzt.

## Phase 4: SEO, Performance & Polish
- [x] **Dynamische Meta-Tags (SEO):** OpenGraph Images, Twitter Cards, kanonische URLs.
  - Per-Seite Metadata via transparente `layout.tsx` Server Components in allen Route-Segmenten.
  - `/contact`, `/manifesto`, `/about`, `/events`, `/community`, `/journal` — alle mit vollständigen OG/Twitter-Tags.
  - Legal-Seiten direkt mit `export const metadata` im Server Component.
- [x] **Sitemap & Robots.txt:** Automatische Generierung via Next.js `sitemap.ts`.
  - Alle statischen Routen inkl. `/content` und `/journal`.
  - Journal-Posts dynamisch aus `getPosts()` generiert.
- [x] **Responsive Audit:** Pixel-perfecting auf Mobile & Tablet.
  - Navbar: functional mobile menu (hamburger → animated drawer) mit AnimatePresence.
  - Home/About/Events/Community/Contact/Content/Manifesto/Legal: `sm:` breakpoints, konsistente Hero-Heights, Card-Padding auf Mobile.
  - Contact-Form: submit row wraps sauber auf kleinen Screens, form-padding progressiv.
  - Footer: gap-Scaling auf Mobile.
  - ParallaxImage: parallax disabled für coarse-pointer (touch) und `prefers-reduced-motion`.
