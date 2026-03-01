# OneEmergence Website — Epic Next.js Konzept & Umsetzungsplan

## 1) Vision

**OneEmergence** wird als digitale Heimat gebaut: eine immersive, ruhige und zugleich kraftvolle Plattform, die Menschen in eine Erfahrung von **Einheit, Freiheit und Liebe** einlädt — ohne Dogma, mit Klarheit, Integrität und Ästhetik.

Die Website soll nicht nur informieren, sondern transformativ wirken:
- emotional berühren,
- intellektuell orientieren,
- praktische nächste Schritte ermöglichen (Community, Inhalte, Events, Newsletter, Kollaboration).

---

## 2) Produktziele (12 Monate)

1. **Markenkern etablieren**
   - Konsistenter visueller und sprachlicher Ausdruck von OneEmergence.
2. **Content-Hub aufbauen**
   - Video-/Artikel-/Manifest-Inhalte auffindbar und teilbar.
3. **Community-Wachstum ermöglichen**
   - Newsletter-Funnel, Event-Landingpages, klare CTAs.
4. **Operative Basis schaffen**
   - CMS-gestützte Inhalte, SEO, Analytics, Performance, Accessibility.

### Erfolgsmetriken (KPIs)
- Conversion-Rate auf primären CTA (Newsletter / Community Join)
- Organic Traffic (SEO)
- Returning Visitors
- Avg. Time on Site / Engagement Depth
- Performance: Core Web Vitals (LCP < 2.5s, CLS < 0.1, INP < 200ms)

---

## 3) Zielgruppen

1. **Suchende / Explorers**
   - Interesse an Bewusstsein, Spiritualität, persönlicher Entwicklung.
2. **Builder / Creators**
   - Menschen, die Inhalte, Events, Kunst, Tech in den Raum bringen wollen.
3. **Partners / Collaborators**
   - potenzielle Kooperationspartner, Medien, Projekte.

### Nutzerintentionen
- „Worum geht es hier wirklich?“
- „Wie kann ich mitmachen?“
- „Welche Inhalte sind für mich relevant?“
- „Ist das seriös, sicher und integer?“

---

## 4) Experience-Prinzipien

1. **Sacred Simplicity**
   - Weniger, aber bedeutungsvoller; klare Wege statt Informationsrauschen.
2. **Embodied Interaction**
   - Weiche Motion, tiefe Lesbarkeit, beruhigende Übergänge.
3. **Trust by Design**
   - Transparenz, klare Sprache, Community-/Sicherheitsprinzipien.
4. **Actionable Inspiration**
   - Jede Seite endet mit sinnvoller nächster Aktion.

---

## 5) Seitenarchitektur (IA)

## Core
- `/` — Home (Mission + Hero + Einstiegspfade)
- `/manifesto` — North Star, Werte, Prinzipien
- `/about` — Team, Ursprung, Haltung
- `/content` — Hub für Videos, Essays, Podcast, Notes
- `/events` — Events, Sessions, Journeys
- `/community` — Mitmachen, Rollen, Guidelines
- `/journal` — Tiefere Artikel/Reflexionen
- `/contact` — Kontakt, Kooperationen, Presse

## Utility
- `/legal/imprint`
- `/legal/privacy`
- `/legal/terms`
- `/sitemap.xml` (generated)
- `/robots.txt` (generated)

## Future
- `/academy`
- `/labs`
- `/donate`
- `/app` (Community Portal / Memberspace)

---

## 6) Next.js Tech-Stack (Empfehlung)

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + CSS variables + design tokens
- **UI primitives:** shadcn/ui + Radix
- **Animation:** Framer Motion + ggf. GSAP (sparsam)
- **Content:** Headless CMS (Sanity *oder* Contentlayer/MDX als Start)
- **Forms:** React Hook Form + Zod + Server Actions
- **Auth (später):** Better Auth / Clerk (falls Member-Bereich)
- **Analytics:** Plausible (privacy-first) + optional PostHog
- **SEO:** next-seo patterns + metadata API
- **Infra:** Vercel (MVP), später optional EU-hosted setup
- **Monitoring:** Sentry + Uptime checks

---

## 7) Informationsmodell (Content Types)

1. **Page**
   - title, slug, seoTitle, seoDescription, hero, blocks[]
2. **Post (Journal)**
   - title, excerpt, author, date, tags, body(MDX), cover
3. **Media Entry**
   - type(video/audio/reel), platform link, summary, transcript optional
4. **Event**
   - title, start/end, location/online, registrationLink, details
5. **Principle**
   - name, summary, explanation, practical application

---

## 8) Visual & Brand System

### Mood
- Kosmisch, ruhig, organisch, hochwertig, minimal.

### Farbwelt (v1)
- Deep Space: `#0A0F1F`
- Aurora Violet: `#7C5CFF`
- Solar Gold: `#F6C453`
- Spirit Cyan: `#54E2E9`
- Pure Light: `#F7F8FB`

### Typografie
- Display: elegante Serif/Semi-Serif (z. B. Cormorant/Canela-like)
- Body: moderne Sans (z. B. Inter/Manrope)

### Motion Guidelines
- Duration: 180–420ms
- Easing: smooth, non-bouncy
- Fokus auf subtile Reveal-Animationen
- Respect `prefers-reduced-motion`

---

## 9) Feature-Backlog (priorisiert)

### Phase 1 — Foundation (MVP)
- [ ] Next.js App Setup (TS, ESLint, Prettier, Tailwind)
- [ ] Design Tokens + Theme System (light/dark optional)
- [ ] Layout + Navigation + Footer
- [ ] Home v1 (Hero, Mission, CTA, Content-Preview)
- [ ] Manifesto Page v1
- [ ] Content Hub v1
- [ ] Contact + Newsletter Form (double opt-in ready)
- [ ] SEO defaults + OG images
- [ ] Legal pages placeholder

### Phase 2 — Growth
- [ ] CMS Integration
- [ ] Journal with MDX/CMS
- [ ] Event Pages + registration flow
- [ ] Analytics Dashboard events
- [ ] Reusable block-based page builder

### Phase 3 — Immersion
- [ ] Immersive visuals (WebGL canvas sections optional)
- [ ] Audio-reactive or ambient mode (experimental)
- [ ] Memberspace MVP

---

## 10) Entwicklungsplan (8 Wochen)

## Woche 1: Discovery & Foundation
- Product framing, user journeys, IA freeze
- Repository standards + CI skeleton
- Design token baseline

## Woche 2: Design System + Layout
- Component primitives
- Navigation, footer, responsive scaffolding

## Woche 3: Home + Manifesto
- Hero storytelling
- Core values/principles sections
- CTA funnels

## Woche 4: Content Hub + Journal v1
- Cards, filters, detail templates
- Initial seed content

## Woche 5: Community + Events
- Event listing and detail pages
- Join flow and lead capture

## Woche 6: CMS + Editorial Workflow
- Content models, preview mode, publish flow

## Woche 7: SEO, Performance, Accessibility
- Lighthouse pass, a11y pass, metadata hardening

## Woche 8: Launch Prep
- QA, copy polish, monitoring, release checklist

---

## 11) Teamrollen (lean)

- **Product/Creative Lead** — Vision, voice, priorities
- **Design Engineer** — UI/UX, motion, component system
- **Full-Stack Engineer** — Next.js, CMS, API, deployment
- **Content Lead** — Storyline, editorial plan, publishing

(MVP kann von 1–2 Personen umgesetzt werden, wenn Scope diszipliniert bleibt.)

---

## 12) Qualitätsstandards

### Engineering
- Strict TypeScript
- PR reviews mandatory
- CI checks: lint, typecheck, test, build

### UX
- Mobile-first
- Accessibility AA baseline
- Readability and performance first

### Content Integrity
- Kein übertriebener Heilsanspruch
- Klare Grenzen, klare Sprache, transparente Intention

---

## 13) Risks & Mitigation

1. **Scope Creep**
   - Mitigation: Weekly scope gate, MVP-only policy.
2. **Overdesign before validation**
   - Mitigation: Ship lean, test resonance with real users.
3. **Low conversion despite high aesthetics**
   - Mitigation: CTA clarity, copy iteration, analytics feedback loops.

---

## 14) Repo-Struktur (Startvorschlag)

```txt
oneemergence-website/
  app/
    (marketing)/
      page.tsx
      manifesto/page.tsx
      about/page.tsx
      content/page.tsx
      events/page.tsx
      community/page.tsx
      contact/page.tsx
    legal/
      imprint/page.tsx
      privacy/page.tsx
      terms/page.tsx
    api/
      newsletter/route.ts
  components/
    ui/
    sections/
    layout/
  lib/
    seo/
    analytics/
    content/
    utils/
  styles/
  public/
    images/
    icons/
  content/
    journal/
    pages/
  docs/
    brand/
    architecture/
  PLAN.md
  README.md
```

---

## 15) Definition of Done (MVP)

- Live deploy on production URL
- Home, Manifesto, Content, Contact verfügbar
- Newsletter funnel tested
- Legal minimum live
- Basic analytics events firing
- Lighthouse (mobile): Performance > 85, Accessibility > 90, SEO > 90

---

## 16) Nächste konkrete Schritte (sofort)

1. Repo bootstrap mit Next.js + Tailwind + TS
2. `README.md` mit Setup/Conventions ergänzen
3. Home + Manifesto als erste sichtbare Version bauen
4. Vercel Preview Deployment aktivieren
5. Feedbackzyklus mit 3 Testpersonen starten

---

**Kurzfassung:**
Dieses Konzept liefert eine klare, skalierbare Grundlage für eine starke OneEmergence-Präsenz: emotional resonant, technisch sauber, SEO- und growth-fähig, mit klarer Roadmap von MVP bis immersive Plattform.
