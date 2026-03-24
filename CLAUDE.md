# Claude Agent Instructions

## Projekt: OneEmergence Website

Dieses Dokument dient als Einstiegspunkt für Claude (und andere Agents), um an der OneEmergence-Website zu arbeiten.

### Stack
- Next.js 15+ (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion, clsx, tailwind-merge, lucide-react

### Design System & Theme
- Farben sind in `tailwind.config.ts` und `src/app/globals.css` als Design-Tokens konfiguriert.
- Primärfarben:
  - Background: `--background` (Deep Space / Pure Light)
  - Foreground: `--foreground`
  - Brand: `oe-deep-space`, `oe-aurora-violet`, `oe-solar-gold`, `oe-spirit-cyan`, `oe-pure-light`
- Typografie:
  - Headers: Cormorant (serif)
  - Body: Inter (sans-serif)

### Dateistruktur
- `src/app/`: Next.js App Router Pages
- `src/components/ui/`: Wiederverwendbare Basis-Komponenten (shadcn/ui style)
- `src/components/sections/`: Größere Page-Sektionen (z.B. Hero, FAQ)
- `src/components/layout/`: Header, Footer, Wrapper
- `src/lib/`: Utils (cn, etc.)
- `src/content/`: Statische Inhalte (MDX, JSON)

### Aufgaben für Agents
1. **Komponentenbau**: Erstelle UI-Komponenten in `src/components/ui/` und nutze `cn()` aus `src/lib/utils.ts` für Tailwind-Klassen.
2. **Seitenaufbau**: Folge dem `PLAN.md` für die Seitenarchitektur (`/manifesto`, `/about`, etc.).
3. **Styling**: Nutze strikt Tailwind und die definierten Brand-Farben.
4. **Motion**: Verwende Framer Motion für subtile, hochwertige Animationen (siehe Principles in `PLAN.md`).
5. **Code-Style**: Striktes TypeScript, funktionale React-Komponenten, Mobile-first CSS.

### Aktueller Stand
- Basic Next.js Setup mit Tailwind v4 ist erfolgt.
- Root Layout mit Fonts und grundlegenden Metadaten ist erstellt.
- Eine erste Landingpage-Hero-Section (v1) ist in `src/app/page.tsx` aktiv.

### Nächste Schritte laut PLAN.md
- [ ] Manifesto-Seite (`/manifesto/page.tsx`) bauen.
- [ ] Navbar & Footer Komponenten in `src/components/layout/` erstellen und in `layout.tsx` einbinden.
- [ ] Buttons als wiederverwendbare UI-Komponente extrahieren.
