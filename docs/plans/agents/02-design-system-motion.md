# Agent 02 — Design System & Motion Infrastructure

> Build the UI primitive layer, intensity mode system, and motion infrastructure that every other agent depends on.

---

## Execution Status (2026-03-29)

### ✅ Completed (Safe Subset)
- **Zustand intensity mode store** (`src/stores/intensity.ts`) — three-mode system with localStorage persistence, `prefers-reduced-motion` override, `effectiveMode` resolver
- **useReducedMotion hook** (`src/hooks/useReducedMotion.ts`) — media query listener with cleanup
- **useIntensityMode hook** (`src/hooks/useIntensityMode.ts`) — convenience wrapper for store access
- **useMotionLevel hook** (`src/hooks/useMotionLevel.ts`) — motion hierarchy gate (micro/flow/sacred/event)
- **IntensityProvider** (`src/components/providers/IntensityProvider.tsx`) — client island that syncs reduced-motion, sets `data-intensity` on `<html>`
- **Design tokens** (`src/app/globals.css`) — added glow utilities, transition tokens, radius tokens, shadow tokens, intensity-mode CSS gates, reduced-motion global safety net, text-glow utilities
- **Zustand installed** as project dependency (v5)

### ⏸ Blocked
- **shadcn/ui initialization** — blocked by Agent 1 (architecture migration in progress, potential conflicts with component restructuring)
- **Motion component upgrades** (ScrollReveal, ParallaxImage, AmbientOrb) — blocked by Agent 1; files already moved to `components/motion/` but committed imports still point to `components/ui/`, causing build failures
- **New motion primitives** (BreathingOrb, ParallaxLayer) — blocked by Agent 1; target `components/motion/` folder exists but import paths are broken
- **IntensityToggle UI component** — blocked by stable layout; Agent 1 still restructuring Navbar
- **IntensityProvider wiring into root layout** — blocked by Agent 1; layout.tsx has broken import for CustomCursor

### ⚠ Pre-existing Build Failures (Not Caused by Agent 02)
Agent 1 partially migrated: moved component files from `ui/` to `motion/` but left committed import paths pointing to `ui/`. The `(marketing)` route group pages also reference the old import paths. Build fails with 4 `Module not found` errors. Agent 02 changes type-check cleanly and do not contribute to these failures.

---

## Mission

Establish a complete design system with shadcn/ui primitives, the three-mode intensity system (Still/Balanced/Immersive), and motion components that respect the motion hierarchy. This agent creates the shared visual and interaction vocabulary for the entire application.

## Scope

### In Scope
- Initialize shadcn/ui and adopt core primitives
- Create Zustand intensity mode store with localStorage persistence
- Wire `prefers-reduced-motion` to intensity system
- Upgrade existing motion components (ScrollReveal, ParallaxImage, AmbientOrb) to read intensity mode
- Create new motion primitives (BreathingOrb, ParallaxLayer)
- Define CSS custom properties / design tokens for all brand colors, spacing, typography
- Ensure Cormorant (serif headers) and Inter (sans-serif body) are properly configured
- Create IntensityToggle UI component
- Create motion utility hooks (`useIntensityMode`, `useReducedMotion`, `useMotionLevel`)

### Out of Scope
- WebGL scenes (that's Agent 4)
- Content renderers (Agent 3)
- Page-level layouts (Agent 4)
- Audio system beyond skeleton AudioProvider
- Form components beyond shadcn/ui defaults

## Dependencies / Prerequisites
- Agent 1 must complete Phase 2 (component reorg) before motion components can be built in their target locations
- Can start immediately on: Zustand store, shadcn/ui init, design token work, hooks

## Repository Areas Touched

```
src/stores/intensity.ts          # New: Zustand store
src/hooks/useIntensityMode.ts    # New: convenience hook
src/hooks/useReducedMotion.ts    # New: media query hook
src/hooks/useMotionLevel.ts      # New: motion hierarchy gate
src/components/ui/               # Modified: shadcn/ui primitives
src/components/motion/           # Modified + new motion components
src/components/layout/           # Modified: IntensityToggle in nav
src/app/globals.css              # Modified: design tokens
tailwind.config.ts               # Modified: theme extensions
package.json                     # Modified: new deps
```

## Detailed Task Breakdown

### Phase 1: Zustand Intensity Store (no dependencies)

**Task 1.1: Create intensity mode store**
```typescript
// src/stores/intensity.ts
type IntensityMode = 'still' | 'balanced' | 'immersive'

interface IntensityStore {
  mode: IntensityMode
  setMode: (mode: IntensityMode) => void
  prefersReducedMotion: boolean
  effectiveMode: IntensityMode // resolves to 'still' if reduced motion
}
```
- Persist to localStorage via Zustand's `persist` middleware
- Read `prefers-reduced-motion` media query on mount, override to 'still' when active
- Export `useIntensityMode` convenience hook

**Task 1.2: Create motion utility hooks**
- `useReducedMotion()` — returns boolean, listens to media query changes
- `useMotionLevel(level: 'micro' | 'flow' | 'sacred' | 'event')` — returns boolean indicating if current intensity mode allows this motion level
  - Still: only micro
  - Balanced: micro + flow + sacred
  - Immersive: all levels

**Task 1.3: Create IntensityProvider**
- Client component that initializes the store from localStorage/cookie
- Wraps the app to provide hydration-safe intensity state
- Adds `data-intensity` attribute to `<html>` for CSS-based intensity gating

### Phase 2: shadcn/ui Initialization

**Task 2.1: Install and configure shadcn/ui**
- Run `npx shadcn@latest init` (or manual setup if CLI conflicts with existing config)
- Configure to use existing Tailwind setup and CSS custom properties
- Set up `components.json` with correct paths

**Task 2.2: Adopt core primitives**
- Install these shadcn/ui components: `button`, `input`, `textarea`, `dialog`, `dropdown-menu`, `navigation-menu`, `card`, `badge`, `separator`, `tooltip`, `toggle`
- Ensure they use OE brand colors via CSS custom properties
- Migrate existing `button.tsx` to use shadcn/ui Button as base (preserve OE styling)

**Task 2.3: Theme CSS custom properties**
- Ensure `globals.css` has complete set of design tokens:
  - Colors: background, foreground, brand palette (deep-space, aurora-violet, solar-gold, spirit-cyan, pure-light)
  - Radius: border-radius tokens
  - Shadows: subtle glow effects for dark theme
  - Transitions: default duration, easing curves

### Phase 3: Design Token Audit & Typography

**Task 3.1: Audit existing design tokens**
- Read `globals.css` and `tailwind.config.ts`
- Verify all brand colors from CLAUDE.md are defined
- Add any missing tokens

**Task 3.2: Typography system**
- Verify Cormorant is loaded for headings (serif)
- Verify Inter is loaded for body (sans-serif)
- Define typographic scale: heading sizes, body sizes, caption sizes
- Ensure proper font-display and loading strategy

**Task 3.3: Dark theme foundation**
- "Darkness is space" — verify background is truly deep space dark
- Ensure foreground text has AAA contrast
- Define glow/luminance utility classes for "light emerging from void" effect
- Create utility classes: `glow-violet`, `glow-gold`, `glow-cyan` for brand accent glows

### Phase 4: Motion Component Upgrades

**Task 4.1: Upgrade ScrollReveal**
- Read intensity mode from store
- In 'still' mode: render children immediately, no animation
- In 'balanced': subtle fade-in on scroll
- In 'immersive': full reveal animation with parallax hints
- Add `motionLevel` prop defaulting to 'flow'

**Task 4.2: Upgrade ParallaxImage**
- Gate parallax effect on intensity mode
- 'still': static image, no parallax
- 'balanced': subtle parallax
- 'immersive': full parallax depth

**Task 4.3: Upgrade AmbientOrb**
- Gate breathing animation on intensity mode
- 'still': static orb with subtle gradient
- 'balanced': slow breathing
- 'immersive': full breathing with glow
- This is a 'sacred' level motion — only active in balanced/immersive

**Task 4.4: Create BreathingOrb component**
- New motion component in `components/motion/`
- Configurable: size, color, breathRate, glowIntensity
- Reads intensity mode
- Motion level: sacred

**Task 4.5: Create ParallaxLayer component**
- Generic parallax wrapper for scroll-driven depth effects
- Props: `depth` (0-1, how much parallax), `direction` ('up' | 'down')
- Reads intensity mode

### Phase 5: IntensityToggle UI

**Task 5.1: Create IntensityToggle component**
- Three-state toggle: Still / Balanced / Immersive
- Elegant, minimal design consistent with brand
- Shows current state with subtle icon or label
- Accessible: keyboard navigable, aria-labels
- Place in Navbar or as floating control

**Task 5.2: Wire into layout**
- Add IntensityProvider to root layout
- Add IntensityToggle to Navbar
- Test mode switching live in dev

## Best Practices & Constraints

1. **All client components must be islands.** The intensity store is client-only. Server components should receive intensity hints via cookie, not import the store.
2. **Every motion component declares its level.** Use a TypeScript type or prop to enforce this.
3. **No motion without reduced-motion handling.** Every animated component must have a still fallback.
4. **Design tokens in CSS custom properties, not Tailwind config values.** This allows runtime theme switching.
5. **shadcn/ui components are owned source.** Copy into repo, don't use as npm dependency.

## Testing / Validation Checklist

- [ ] Intensity mode persists across page reloads (localStorage)
- [ ] `prefers-reduced-motion: reduce` forces 'still' mode
- [ ] All motion components render correctly in all three modes
- [ ] shadcn/ui components render with OE brand colors
- [ ] IntensityToggle is keyboard accessible
- [ ] No layout shift when switching intensity modes
- [ ] Typography: Cormorant renders for h1-h6, Inter for body
- [ ] `next build` passes
- [ ] No hydration mismatches with intensity state

## Risks / Pitfalls

| Risk | Mitigation |
|---|---|
| Hydration mismatch with localStorage state | Use `useEffect` for client-only initialization, render 'balanced' as SSR default |
| shadcn/ui conflicts with existing Tailwind config | Manual component setup if CLI fails |
| Motion components break in still mode | Test all three modes as part of dev workflow |
| Performance regression from Zustand | Zustand is minimal; use selectors to prevent unnecessary rerenders |
| Cormorant/Inter font loading delays | Use `next/font` with `display: swap` |

## Handoff Outputs

- Zustand intensity store in `src/stores/intensity.ts`
- Motion hooks in `src/hooks/`
- Upgraded motion components that read intensity mode
- shadcn/ui primitives customized with OE brand
- Complete design token system in CSS
- IntensityToggle wired into Navbar
- All motion components respect `prefers-reduced-motion`

## Subagent Strategy

1. **Design token audit agent** — Read all CSS files, tailwind config, and component styles to produce a complete inventory of current tokens and gaps
2. **shadcn/ui integration agent** — Handle the mechanical work of installing and customizing shadcn/ui components
3. **Motion testing agent** — Verify each motion component in all three intensity modes, check for reduced-motion compliance

## Commit Strategy

```
feat(stores): add Zustand intensity mode store with localStorage persistence
feat(hooks): add useIntensityMode, useReducedMotion, useMotionLevel hooks
feat(ui): initialize shadcn/ui with OE brand customization
refactor(motion): upgrade ScrollReveal, ParallaxImage, AmbientOrb for intensity modes
feat(motion): add BreathingOrb and ParallaxLayer components
feat(design): complete design token system in CSS custom properties
feat(layout): add IntensityToggle to Navbar
```
