---
name: frontend-workflow
description: THE routing skill for all frontend work in oneemergence-website — building or changing pages, sections, components, styling, motion/animation, design critique, polish, accessibility, data-viz, or UI testing. Read this FIRST before invoking any other frontend/design skill (impeccable, ui-ux-pro-max, frontend-design, accessibility, dataviz, etc.); it says which skill to use for which task and which to skip, plus the project constraints every skill's advice must be filtered through.
---

# Frontend Workflow (OneEmergence)

The repo has several overlapping frontend/design skills. This file is the router.
`AGENTS.md` (repo root) stays the source of truth for stack and paradigms; read
`docs/ROADMAP.md` for current phase. This skill only decides *which design skill
to load when*, and pins the constraints that override any skill's generic advice.

## Project constraints — these override every skill below

1. **Motion = framer-motion v12, imported from `"framer-motion"`.** 42 files do
   this. Do NOT use GSAP (planned, not installed). Do NOT import from
   `"motion/react"` — the `motion` package is not installed and that import will
   not resolve, even though it is the library's current name and your own
   instinct will reach for it. Ignore the GSAP snippets from
   `ui-ux-pro-max --motion`.
2. **Every animation declares a motion level** — Micro / Flow / Sacred / Event —
   and gates itself via `useMotionLevel(level)` from `src/hooks/useMotionLevel.ts`
   (still = micro only; balanced adds flow + sacred; immersive adds event).
   `IntensityProvider` mirrors the effective mode to `html[data-intensity]` for
   CSS gating. **Never add the blanket
   `@media (prefers-reduced-motion) { * { animation-duration: 0.01ms } }` nuke**
   (the `accessibility` skill suggests it) — reduced motion already resolves to
   `still` mode through the store; the blanket rule would also kill the micro
   feedback animations Still mode deliberately keeps.
3. **The brand is committed, not a default to "fix".** Dark cosmic base
   (Deep Space), `oe-aurora-violet` / `oe-solar-gold` / `oe-spirit-cyan` accents,
   Cormorant (serif) headers + Inter body, "three depths" (cosmic → solarpunk →
   warm). `frontend-design` calibrates *against* "near-black background with a
   single bright accent" as an AI tell — that ban targets *defaults*, and its own
   rule says the brief wins. AGENTS.md is the brief. Do not de-violet or de-serif
   this site; do not let `ui-ux-pro-max --design-system` or `impeccable`
   `palette.mjs` generate a competing palette.
4. **Tokens live in `@theme` in `src/app/globals.css`** (Tailwind v4 CSS-first)
   plus `tailwind.config.ts`. Extend those; no raw hex in components.
5. **App Router, server-first.** Client components are islands with
   `'use client'`; motion/scroll/pointer code is always a client leaf.
6. **i18n from the first line**: new UI strings go through
   `useTranslations()`/`getTranslations()` into `src/i18n/messages/{de,en}.json`.
   Never hardcode user-facing strings.
7. Icons: `lucide-react` (already a dependency).
8. Perf budget: LCP < 2.5s, CLS < 0.1, INP < 200ms; WebGL lazy-loaded.

## Routing table

| Task | Use, in order | Skip |
|---|---|---|
| **New page / section** | 1. `frontend-design` (direction: subject, type, signature element — filtered through constraint 3) → 2. build per AGENTS.md + constraints above → 3. `impeccable critique` then `polish` on the result | `ui-ux-pro-max --design-system` |
| **New component** (`src/components/ui/`, feature components) | 1. `vercel-composition-patterns` (API shape: no boolean-prop piles, compound components, React 19 no-forwardRef) → 2. build → 3. `impeccable polish` if it has visual surface | — |
| **Design critique / polish pass** | `impeccable` (`critique` → `polish`; `bolder`/`quieter`/`typeset`/`layout` for targeted fixes; `live` for in-browser iteration when dev server runs) | — |
| **A11y pass** | 1. `accessibility` (WCAG 2.2 reference — best source for 2.2 criteria: focus-not-obscured, 24px targets, redundant entry, accessible auth) → 2. `impeccable audit` for the mechanical sweep. Test all three intensity modes; reduced-motion via constraint 2's mechanism, not CSS nukes | — |
| **Motion work** | The repo itself is the reference: `src/components/motion/*` + `useMotionLevel`. Pick the level first (micro/flow/sacred/event), gate with the hook, `data-motion-level` attribute on the element. `impeccable animate` for choreography ideas — translate its output to framer-motion | All GSAP material |
| **Data-viz** (D3, consciousness map, dashboards) | 1. `dataviz` (global — form heuristic, color formula, mark specs) → 2. brand tokens for series colors. Optional lookup: `ui-ux-pro-max --domain chart` | — |
| **Testing / verification** | Repo Playwright TS suite (`tests/`, pnpm scripts); Playwright MCP tools or `agent-browser` for interactive verification and screenshots | — |
| **Perf pass** | 1. `vercel-react-best-practices` (waterfalls, bundle, RSC serialization) → 2. `impeccable optimize` for UI jank | — |
| **UX pattern lookup** (forms, nav, empty states, onboarding) | `ui-ux-pro-max` as a read-only database: `python .agents/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain ux` — always the `.agents/` path, it is the git-tracked one that survives a fresh clone (`.claude/skills/` is gitignored) | its `--design-system`, `--persist`, `--motion` modes |
| **Complex generics / type utilities** | `typescript-advanced-types` — only when actually building type-level machinery | — |

## Skill-specific notes

- **impeccable**: no `PRODUCT.md`/`DESIGN.md` exists yet, so `context.mjs`
  reports `NO_PRODUCT_MD`. Scoped commands (`critique`, `audit`, `polish`, ...)
  proceed anyway — do not let it divert into `init` for a scoped request. Skip
  its `palette.mjs` (step 6): committed brand colors exist, identity
  preservation wins per its own rule. Its "one theme per page" instinct must
  tolerate the deliberate cosmic→warm depth transitions (e.g. Portal Entry).
- **ui-ux-pro-max**: never let it write `design-system/` folders into this repo
  (`--persist`), and never take its GSAP presets. Search database only.
- **Removed on purpose (2026-07-16) — do not re-add**: `design-taste-frontend`
  (mandated `motion/react` + GSAP, breaks this stack), `web-design-guidelines`
  (subset of `impeccable audit`, needed a network fetch per run),
  `nextjs-app-router-patterns` (generic Next 14 tutorial; this repo is Next 16),
  `webapp-testing` (Python Playwright; this repo is pnpm/TS).
- `frontend-design` exists both here and as a global plugin with byte-identical
  content. The local copy is the tracked one — keep it; the repo must not depend
  on a user-level plugin.
