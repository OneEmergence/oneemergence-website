# OneEmergence Website — Meisterwerk Masterplan

Dieses Dokument dient als zentrale Orchestrierungs-Roadmap für die parallelen Agent-Entwicklungen, um die OneEmergence-App von einer "guten Basis" zu einem absoluten, immersiven Meisterwerk (technisch & visuell) hochzuziehen.

## Phase 1: Die Architektur-Lücken schließen (Content & Backend)
*Derzeit fehlt uns das gesamte CMS/MDX Fundament für Artikel, Readings und Events.*

- [x] **Abhängigkeiten installieren:** `gray-matter`, `marked` (oder `next-mdx-remote`) für lokales Markdown-Parsing, `lenis` für Smooth-Scrolling.
- [ ] **MDX/Markdown Engine bauen (`src/lib/content.ts`):** 
  - Funktion `getPosts()` und `getPostBySlug()`
  - Definition des Typs `Post` (Title, Date, Cover, Excerpt, Content)
- [ ] **Content Hub & Journal Pages implementieren:**
  - `src/app/content/page.tsx` (Übersicht als schickes Masonry oder CSS Grid)
  - `src/app/journal/[slug]/page.tsx` (Detail-Ansicht mit großem Header, feiner Typo, Lesezeit-Kalkulation)
  - Anlage von 2-3 Seed-Dateien (Dummy-Posts) in `src/content/journal/` zum Testen.

## Phase 2: Visuelle & Immersive Exzellenz (Das "Kunst-Gefühl")
*Die Website soll sich anfühlen wie ein lebendiges Spielfeld, nicht wie eine statische Dokumentation.*

- [ ] **Smooth Scroll (Lenis):** 
  - Integration von Studio Freight's `lenis` im Root-Layout für butterweiches Scrollen.
- [ ] **Magnetische Buttons & Cursor (Motion):**
  - Ein globaler, custom Cursor (kleiner Dot), der sich invertiert, wenn er über Links hovert.
  - "Magnetic" Hover-Effekt für die Navbar-Links und den Primary Button (ziehen sich leicht zum Cursor).
- [ ] **Scroll-Triggered Animations (Parallax & Reveal):**
  - Parallax-Effekt für Hintergrundbilder in Content-Cards.
  - Großformatige Text-Enthüllungen (Character-by-Character Fade-In für Philosophie-Zitate beim Runterscrollen).

## Phase 3: Fehlende IA-Seiten & Feature-Komplettierung
*Laut PLAN.md gibt es noch mehrere unvollendete Platzhalter.*

- [ ] **`/about` (Team/Ursprung):** 
  - Storytelling-Layout mit wechselnden Text/Bild-Blöcken.
- [ ] **`/events` (Live & Digital):**
  - Timeline/Listen-Ansicht für kommende Gatherings/Readings mit "Add to Calendar" / "Join" CTAs.
- [ ] **`/community` (Mitmachen):**
  - Erklärung der Onboarding-Schritte, Link zu Discord/Telegram.
- [ ] **Formulare & Kontakt (`/contact`):**
  - Wunderschönes, minimales Kontaktformular. Visuelles Feedback (Success-State) ohne Reload.
- [ ] **Legal (`/legal/imprint`, `/legal/privacy`):**
  - Minimalistisches Markdown-Rendering für rechtliche Pflichttexte.

## Phase 4: SEO, Performance & Polish
- [ ] **Dynamische Meta-Tags (SEO):** OpenGraph Images, Twitter Cards, kanonische URLs.
- [ ] **Sitemap & Robots.txt:** Automatische Generierung via Next.js `sitemap.ts`.
- [ ] **Responsive Audit:** Pixel-perfecting auf Mobile & Tablet.
