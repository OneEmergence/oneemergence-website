# Agent 04 — Public Experience Layer

> Build the Living Portal v2, Experiences section, panel navigation, and the complete public-facing product experience.

---

## Mission

Transform the public website from a set of static pages into the "Living Threshold" described in VISION.md. This means: Living Portal v2 with progressive enhancement, panel-based navigation, experiences section with visual essays, and a library that showcases sacred content types. The public layer should make visitors feel awe and want to return.

## Status: Phase 1 Complete (2026-03-29)

### What Landed

**Living Portal v2 (Homepage):**
- [x] Full-viewport hero with Canvas2D star/particle field (scroll-reactive, mouse-responsive, time-of-day tinting)
- [x] AmbientOrb background orbs retained for depth layering
- [x] Hero text emerges with staggered motion animations
- [x] Scroll indicator with gentle pulse animation
- [x] Hero opacity/scale tied to scroll progress (depth feeling)
- [x] Vision statement section with ScrollReveal word-by-word animation
- [x] Featured content section pulling latest journal posts (server-rendered data)
- [x] Experiences preview section with 3 upcoming experiences
- [x] Community pulse section with events/community CTAs
- [x] Newsletter signup CTA with email form and success state
- [x] Progressive enhancement: StarField shows static gradient in Still mode, full animation in Balanced/Immersive
- [x] Homepage is now a Server Component (page.tsx) delegating to a Client Component (LivingPortalClient.tsx)

**Page Transitions:**
- [x] `(marketing)/template.tsx` with fade + slide-up animation via framer-motion
- [x] All marketing routes get smooth entry transitions

**Experiences Section (New):**
- [x] `/experiences` route with hero, experience cards, and coming-soon newsletter CTA
- [x] 3 experiences defined (Visual Essay, Contemplation, Guided Journey) — marked "Bald verfügbar"
- [x] StarField reused for immersive hero
- [x] Each experience has type, duration, description, and availability status

**Library Page (New):**
- [x] `/library` route replacing `/content` as the primary content browsing destination
- [x] Filter pills for content types (Alle, Lehren, Reflexionen, Journal)
- [x] Content type auto-detection from tags
- [x] Animated filter transitions with AnimatePresence
- [x] Color-coded type indicators (gold=teaching, cyan=reflection, violet=journal)

**Manifesto Upgrade:**
- [x] Full hero with StarField canvas background
- [x] Opening vision statement with ScrollReveal
- [x] Each principle as its own immersive depth-layer section (alternating left/right layout)
- [x] Scroll-driven parallax on principle numbers
- [x] Scroll-driven opacity fading for depth feeling
- [x] Closing vision statement
- [x] Newsletter signup integrated into closing CTA

**Newsletter Signup Component:**
- [x] Reusable `NewsletterSignup` component with email form
- [x] Success state with brand-aligned messaging
- [x] Used on homepage, experiences, and manifesto pages

**Navigation Updates:**
- [x] Navbar updated: added Erfahrungen and Bibliothek, reordered links
- [x] Contact moved out of primary nav (accessible via footer/CTAs)

**New Components:**
- [x] `src/components/scene/StarField.tsx` — Canvas2D particle field with scroll/mouse/time-of-day reactivity
- [x] `src/components/motion/ScrollIndicator.tsx` — Animated scroll-down indicator
- [x] `src/components/sections/NewsletterSignup.tsx` — Email signup form

**Bug Fixes:**
- [x] Fixed `src/lib/content/mdx.ts` → `mdx.tsx` (JSX in .ts file causing build failure)

### Deviations from Original Plan

1. **Canvas2D instead of WebGL/R3F**: Used Canvas 2D API for the star field instead of Three.js/R3F. This avoids adding ~200KB of dependencies while delivering the core experience (scroll-reactive particles, mouse parallax, time-of-day awareness, nebula glow). Three.js can be added later for more complex scenes.

2. **No panel overlay navigation**: Implemented page-level transitions via `template.tsx` instead of panel overlays. Panel overlays (slide-in content previews) are deferred to a future iteration as they require more complex URL state management.

3. **Experiences content not yet created**: The experiences landing page is built but individual experience pages are not yet created (marked "Bald verfügbar"). This is appropriate — content creation is Agent 3's domain, and the visual essay engine needs the MDX pipeline to be fully operational.

4. **Library uses existing content system**: The library page works with the existing journal posts and tag-based type detection rather than a formal sacred content type system. This integrates naturally with what Agent 3 built.

### Remaining Work (Future Iterations)

- [ ] **Task 1.1**: Install three.js/R3F for advanced WebGL scenes (LivingPortalScene with full particle nebula, SacredGeometry)
- [ ] **Task 3.3**: Panel overlay for content preview (slide-over panels with deep-linking)
- [ ] **Task 4.2-4.4**: Visual essay experience engine and 2-3 actual visual essay MDX content files
- [ ] **Task 5.2**: Content detail routes at `/library/[type]/[slug]`
- [ ] **Task 6.2**: Values visualization (animated sacred geometry per principle)
- [ ] **Task 7.1-7.3**: Formal performance audit (Lighthouse, bundle analysis)
- [ ] Return visit detection (localStorage) for portal mood shift
- [ ] Ambient audio integration with intensity modes on homepage

---

## Scope

### In Scope
- Living Portal v2 (homepage) with canvas layer, scroll-reactive light, time-of-day awareness
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
- **Agent 1** complete (route groups, folder structure) ✅
- **Agent 2** complete (motion infrastructure, intensity modes, design tokens) ✅
- **Agent 3** complete (content system, MDX pipeline, renderers) ✅

## Testing / Validation Checklist

- [x] Living Portal renders without WebGL (still mode) — static gradient fallback
- [x] Living Portal renders with canvas animation (balanced/immersive mode)
- [x] Page transitions are smooth via template.tsx
- [x] All public routes accessible and SEO-friendly
- [x] Library filtering works (by type)
- [ ] Visual essay scroll experience works on mobile and desktop (deferred — no essays yet)
- [x] `next build` passes successfully
- [x] OG tags and metadata correct on all pages
- [ ] LCP < 2.5s on production build (needs formal audit)
- [ ] CLS < 0.1 (needs formal audit)
- [ ] Initial JS bundle < 150KB gzipped (needs formal audit)
- [x] Keyboard navigation works through content
- [x] `prefers-reduced-motion` disables canvas animation (StarField falls back to gradient)
