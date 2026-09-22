# Agent 01 — Architecture Migration

> Restructure the codebase from Phase 1 flat layout to the target architecture defined in ARCHITECTURE.md.

**Status: COMPLETED** (2026-03-29)

---

## Mission

Transform the existing working codebase into the target folder structure without breaking any functionality. This is a pure structural refactor — no new features, no new UI, no new dependencies beyond what's needed for route groups.

## Execution Summary

### Phase 1: Route Group Migration — DONE
- [x] Created `src/app/(marketing)/` route group
- [x] Moved 8 page routes: home, manifesto, about, content, community, contact, events, journal
- [x] Kept root `layout.tsx`, `template.tsx`, `globals.css`, `sitemap.ts` at `src/app/`
- [x] Kept `legal/` outside route groups
- [x] Verified all URLs unchanged (route groups are transparent)
- [x] `next build` passes — all 16 pages generated
- **Commit:** `2472ba2` — `feat(arch): wrap public pages in (marketing) route group`

### Phase 2: Component Reorganization — DONE
- [x] Created `components/motion/`, `components/scene/`, `components/content/`
- [x] Moved `ScrollReveal.tsx`, `ParallaxImage.tsx`, `ambient-orb.tsx`, `CustomCursor.tsx` → `components/motion/`
- [x] Updated 4 import paths (layout.tsx, manifesto/page.tsx, page.tsx, ContentGrid.tsx)
- [x] Kept `button.tsx`, `MagneticButton.tsx` in `ui/` (they are UI primitives, not pure motion components)
- [x] `next build` passes
- **Commit:** `8dcad9b` — `refactor(arch): split components into ui/, motion/, scene/, content/`

### Phase 3: Library Structure Expansion — DONE
- [x] Moved `lib/content.ts` → `lib/content/index.ts` (imports resolve unchanged via Node module resolution)
- [x] Created `lib/schemas/`, `lib/actions/`, `lib/analytics/`, `lib/auth/`
- [x] `next build` passes
- **Commit:** `75c7c8d` — `refactor(arch): expand lib/ with sub-module structure`

### Phase 4: Content Folder Reorganization — DONE
- [x] Created `content/teachings/`, `content/reflections/`, `content/practices/`, `content/transmissions/`, `content/essays/`, `content/journeys/`
- [x] Existing `content/journal/` and `content/pages/` unchanged
- **Commit:** `0972e68` — `refactor(arch): create sacred content type directories`

### Phase 5: Scaffolding Directories — DONE
- [x] Created `features/` and `types/`
- [x] `stores/` and `hooks/` already existed from Agent 2
- **Commit:** `829a51a` — `refactor(arch): create features/ and types/ scaffolding directories`

### Phase 6: Final Verification — DONE
- [x] `next build` passes — all 16 pages, same routes as before
- [x] `npm run lint` — no new issues (pre-existing: 2 errors in CustomCursor/useReducedMotion about setState in effect, 1 warning about unused var)
- [x] TypeScript type-check passes

## Deviations from Original Plan

1. **No `(marketing)` layout.tsx created** — The root layout.tsx already wraps all pages with Navbar/Footer/AudioProvider/SmoothScroll. A marketing-specific layout wasn't needed at this stage. It can be added later when `(portal)` route group is introduced and layout differentiation is needed.

2. **`stores/` and `hooks/` already existed** — Agent 2 (Design System & Motion) had already created these with intensity mode store and hooks. Only `features/` and `types/` needed creation.

3. **Pre-existing Sentry type errors fixed** — Agent 8's `IntensityProvider.tsx` had implicit `any` types that broke the build. Applied minimal type annotation fix to unblock build verification.

4. **`components/providers/` exists** — Agent 2 created this for IntensityProvider. Not in the original ARCHITECTURE.md target structure but it's a reasonable location for client provider wrappers.

## Handoff Outputs

The repo now has:
```
src/
├── app/
│   ├── (marketing)/       # Public pages (home, manifesto, about, content, etc.)
│   ├── legal/             # Legal pages (imprint, privacy)
│   ├── layout.tsx         # Root layout
│   ├── template.tsx       # Page transition wrapper
│   ├── globals.css        # Global styles
│   └── sitemap.ts         # Sitemap generator
├── components/
│   ├── ui/                # Button, MagneticButton
│   ├── motion/            # ScrollReveal, ParallaxImage, ambient-orb, CustomCursor
│   ├── scene/             # Empty (future WebGL scenes)
│   ├── content/           # Empty (future content renderers)
│   ├── layout/            # Navbar, Footer, AudioProvider, SmoothScroll
│   ├── sections/          # ContentGrid
│   └── providers/         # IntensityProvider (from Agent 2)
├── features/              # Empty (future feature modules)
├── stores/                # intensity.ts (from Agent 2)
├── hooks/                 # useIntensityMode, useMotionLevel, useReducedMotion (from Agent 2)
├── types/                 # Empty (future shared types)
├── lib/
│   ├── content/           # Content loader (index.ts)
│   ├── schemas/           # Empty (future Zod schemas)
│   ├── actions/           # Empty (future server actions)
│   ├── analytics/         # Empty (future Sentry setup)
│   ├── auth/              # Empty (future auth config)
│   └── utils.ts           # cn() utility
└── content/
    ├── journal/           # Existing journal articles (3 posts)
    ├── pages/             # Existing legal content
    ├── teachings/         # Empty (sacred content type)
    ├── reflections/       # Empty (sacred content type)
    ├── practices/         # Empty (sacred content type)
    ├── transmissions/     # Empty (sacred content type)
    ├── essays/            # Empty (sacred content type)
    └── journeys/          # Empty (sacred content type)
```

All downstream agents can now proceed:
- **Agent 2** can finalize motion infrastructure in `components/motion/`
- **Agent 3** can build MDX pipeline in `lib/content/` and populate content type dirs
- **Agent 4** can build public experience in `(marketing)` route group
- **Agent 5** can add `(portal)` route group when ready
- **Agent 8** can set up Sentry in `lib/analytics/`
