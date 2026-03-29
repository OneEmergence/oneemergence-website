# Agent 04 — Public Experience Layer

> Build the Living Portal v2, Experiences section, panel navigation, and the complete public-facing product experience.

---

## Mission

Transform the public website from a set of static pages into the "Living Threshold" described in VISION.md. This means: Living Portal v2 with WebGL progressive enhancement, panel-based navigation, experiences section with visual essays, and a library that showcases sacred content types. The public layer should make visitors feel awe and want to return.

## Scope

### In Scope
- Living Portal v2 (homepage) with WebGL canvas layer, scroll-reactive light, time-of-day awareness
- Panel-based navigation system (smooth transitions between routes)
- Experiences section with 2–3 visual essays / guided interactions
- Library page showing content by sacred type with filtering
- Upgrade Manifesto page to immersive layered reading
- Newsletter signup with meaningful CTA
- Progressive enhancement: beautiful without JS, transcendent with it
- Performance optimization to meet LCP < 2.5s

### Out of Scope
- Auth / Portal Entry (Agent 5)
- AI Guide (Agent 6)
- Content creation (Agent 3 handles content system, this agent uses it)
- Sentry / Playwright (Agent 8)
- Sound journeys / practice rooms (Agent 5)

## Dependencies / Prerequisites
- **Agent 1** complete (route groups, folder structure)
- **Agent 2** complete (motion infrastructure, intensity modes, design tokens)
- **Agent 3** complete (content system, MDX pipeline, renderers)
- All three must be merged before this agent starts

## Repository Areas Touched

```
src/app/(marketing)/page.tsx           # Rewrite: Living Portal v2
src/app/(marketing)/manifesto/         # Major upgrade
src/app/(marketing)/experiences/       # New section
src/app/(marketing)/library/           # New or rename from content/
src/components/scene/                  # New: WebGL scenes
src/components/sections/               # Modified: new page sections
src/components/layout/                 # Modified: panel navigation
src/content/essays/                    # New: visual essay content
package.json                           # New: three.js, @react-three/fiber, @react-three/drei
```

## Detailed Task Breakdown

### Phase 1: WebGL Infrastructure

**Task 1.1: Install 3D dependencies**
- `three`, `@react-three/fiber`, `@react-three/drei`
- These must be lazy-loaded and code-split — never in initial bundle

**Task 1.2: Create WebGL canvas wrapper**
```typescript
// src/components/scene/SceneCanvas.tsx
// - Lazy-loaded R3F Canvas component
// - Reads intensity mode: only renders in 'balanced' and 'immersive'
// - In 'still': shows a static gradient/image fallback
// - Progressive enhancement: works without WebGL
// - Performance: auto pixel ratio, adaptive quality
```

**Task 1.3: Create LivingPortal scene**
```typescript
// src/components/scene/LivingPortalScene.tsx
// - Particle field (stars / nebula points)
// - Scroll-driven light intensity (deeper scroll = more emergence)
// - Mouse position influences subtle light direction
// - Time of day shifts color temperature
// - Return visit detection (localStorage) subtly shifts mood
```

**Task 1.4: Create SacredGeometry component (optional, time permitting)**
- Rotating sacred geometry shapes (Flower of Life, Metatron's Cube)
- Used as decorative elements throughout the portal
- Motion level: sacred (only in balanced/immersive)

### Phase 2: Living Portal v2 (Homepage)

**Task 2.1: Restructure homepage layout**
- Full-viewport hero with WebGL canvas background
- Text emerges from space (animated with Motion, gated by intensity)
- Scroll depth layers: hero → vision statement → featured content → experiences preview → community pulse → CTA
- Each section has depth-layer feel (parallax, opacity shifts)

**Task 2.2: Hero section**
- "OneEmergence" title with nebula emergence animation
- Subtitle fades in after title
- Scroll indicator (gentle downward pulse)
- WebGL canvas behind (LivingPortalScene)
- Still mode: beautiful static gradient with centered text

**Task 2.3: Content preview sections**
- Featured teachings / reflections from library
- Uses ContentGrid with ScrollReveal
- Cards with hover effects, brand accent glows
- Links to library and individual content

**Task 2.4: Community / Events preview**
- Upcoming events teaser
- Community statement
- CTA to join newsletter / explore community

**Task 2.5: Homepage CTA footer**
- Meaningful call to action (not "sign up" — something aligned with brand voice)
- Newsletter form (email input + submit)
- Subtle ambient animation

### Phase 3: Panel Navigation System

**Task 3.1: Design panel transition architecture**
- Replace hard `<Link>` navigations with smooth panel transitions
- Options:
  - Route-based with `AnimatePresence` in template.tsx
  - Overlay panels that slide in (for sub-content)
  - Full-page transitions with cross-fade or slide

**Task 3.2: Implement page transitions**
- Use `template.tsx` or a layout-level `AnimatePresence`
- Each route transition animates: fade, slide, or depth shift
- Respect intensity mode: 'still' = instant transition, 'balanced' = fade, 'immersive' = full animation
- Maintain scroll position correctly

**Task 3.3: Panel overlay for content preview**
- When clicking a content card from library, content can open in a slide-over panel
- Close panel to return to list
- Deep-linkable (URL reflects open panel)

### Phase 4: Experiences Section

**Task 4.1: Create Experiences index page**
- `src/app/(marketing)/experiences/page.tsx`
- Grid/gallery of available experiences
- Each experience card has: title, type, duration, cover image/animation
- Visual essays and guided interactions listed

**Task 4.2: Build Visual Essay experience engine**
- Scroll-driven narrative container
- Sections that snap or flow based on scroll
- Image/text/animation per section
- Full-screen immersive layout
- Uses VisualEssayRenderer from Agent 3 as base

**Task 4.3: Create 2–3 visual essay experiences**
- Write/commission content for at least 2 visual essays
- Topics aligned with brand: emergence, consciousness, solarpunk future
- Example: "What If the Earth Is Dreaming?" — scroll-driven visual narrative
- Each experience: 5-8 scroll sections with text + imagery

**Task 4.4: Create experience detail route**
- `src/app/(marketing)/experiences/[slug]/page.tsx`
- Loads experience content from MDX
- Renders in full-screen immersive mode

### Phase 5: Library Page

**Task 5.1: Create Library index page**
- `src/app/(marketing)/library/page.tsx` (rename from `content/` or new)
- Shows all published sacred content
- Filter by type (Teaching, Reflection, etc.)
- Filter by theme, difficulty, tag
- Sort by date, duration
- Responsive grid with content type indicators

**Task 5.2: Create content detail route**
- `src/app/(marketing)/library/[type]/[slug]/page.tsx`
- Routes to appropriate content renderer based on type
- Metadata: title, description, OG tags
- Related content suggestions at bottom

**Task 5.3: Curate initial library content**
- Ensure at least 3 teachings and 2 reflections are published
- Content about: Emergence, Presence, Unity (from VISION.md staging plan)
- Use existing journal articles as basis where applicable

### Phase 6: Manifesto Upgrade

**Task 6.1: Immersive layered reading**
- Full redesign of Manifesto page
- Sections revealed as scroll-driven depth layers
- Each core value gets its own visual treatment
- ParallaxLayers for depth
- Sacred geometry accents

**Task 6.2: Values visualization**
- Each value (Emergence, Presence, Unity, etc.) as a visually distinct section
- Subtle animations that reinforce the value's meaning
- Still mode: clean, readable, beautiful typography

### Phase 7: Performance Optimization

**Task 7.1: Ensure LCP < 2.5s**
- WebGL canvas lazy-loaded, not blocking LCP
- Hero text renders server-side (SSR)
- Images optimized with `next/image`
- Critical CSS inlined

**Task 7.2: CLS < 0.1**
- WebGL canvas has reserved dimensions
- No layout shift from font loading
- Content doesn't jump when animations initialize

**Task 7.3: Bundle analysis**
- Three.js tree-shaking: import only used features
- R3F and Drei code-split
- Initial JS bundle < 150KB gzipped

## Best Practices & Constraints

1. **Progressive enhancement is non-negotiable.** The site must be beautiful and functional without WebGL. WebGL is the enhancement, not the requirement.
2. **Performance budget is sacred.** LCP < 2.5s means WebGL cannot block initial paint. Lazy-load everything 3D.
3. **Content comes from Agent 3's system.** Don't build a parallel content loader. Use `getContentByType()`, `getContentBySlug()`.
4. **Panel navigation must not break browser back button.** URL-driven, not state-driven.
5. **All animations declare motion level.** WebGL scenes are 'sacred' or 'event' level.
6. **Mobile-first.** WebGL may be disabled on low-power mobile devices. Detect and fallback gracefully.

## Testing / Validation Checklist

- [ ] Living Portal renders without WebGL (still mode)
- [ ] Living Portal renders with WebGL (immersive mode)
- [ ] Page transitions are smooth in balanced/immersive, instant in still
- [ ] All public routes accessible and SEO-friendly
- [ ] Library filtering works (by type, theme, tag)
- [ ] Visual essay scroll experience works on mobile and desktop
- [ ] LCP < 2.5s on production build
- [ ] CLS < 0.1
- [ ] Initial JS bundle < 150KB gzipped
- [ ] OG tags and metadata correct on all pages
- [ ] Keyboard navigation works through panels
- [ ] `prefers-reduced-motion` disables WebGL and animations

## Risks / Pitfalls

| Risk | Mitigation |
|---|---|
| WebGL kills mobile performance | Detect GPU capability, disable on low-end. Use `<Suspense>` for lazy load. |
| Three.js bloats bundle | Tree-shake aggressively. Only import used geometries/materials. |
| Panel navigation breaks SEO | Ensure every panel state has a real URL. Server-side rendered content. |
| Visual essay content quality | Start with 2 simple essays. Quality > quantity. |
| Time-of-day detection unreliable | Use server timestamp for SSR, client `Date` for enhancement |
| Scroll-driven animations jank on Safari | Test thoroughly. Use `will-change` sparingly. Prefer CSS transforms. |

## Handoff Outputs

- Living Portal v2 with WebGL progressive enhancement
- Panel navigation system usable by all marketing pages
- Experiences section with at least 2 visual essays
- Library page with filtering by sacred content type
- Upgraded Manifesto page
- Performance within budget
- WebGL scene components in `components/scene/`

## Subagent Strategy

1. **WebGL scene agent** — Build the LivingPortalScene in isolation, test performance, deliver as a standalone component
2. **Panel navigation agent** — Research and implement the transition system, handle edge cases (back button, deep links)
3. **Visual essay agent** — Create the scroll-driven narrative engine and produce 2 example essays
4. **Performance audit agent** — Run Lighthouse, analyze bundle, identify and fix bottlenecks after build
5. **Mobile testing agent** — Verify all public pages on mobile viewports, check WebGL fallbacks

## Commit Strategy

```
feat(scene): add WebGL canvas wrapper with progressive enhancement
feat(scene): create LivingPortalScene with particles and scroll-reactive light
feat(portal): rebuild homepage as Living Portal v2
feat(nav): implement panel-based page transitions with AnimatePresence
feat(experiences): add experiences section with visual essay engine
feat(library): add library page with sacred content type filtering
refactor(manifesto): upgrade to immersive layered reading experience
perf: optimize initial bundle, lazy-load WebGL, meet LCP budget
```
