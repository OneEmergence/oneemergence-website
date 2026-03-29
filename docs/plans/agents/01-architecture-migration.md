# Agent 01 — Architecture Migration

> Restructure the codebase from Phase 1 flat layout to the target architecture defined in ARCHITECTURE.md.

---

## Mission

Transform the existing working codebase into the target folder structure without breaking any functionality. This is a pure structural refactor — no new features, no new UI, no new dependencies beyond what's needed for route groups.

## Scope

### In Scope
- Wrap existing public pages in `(marketing)` route group
- Split `components/` into `ui/`, `motion/`, `layout/`, `sections/`
- Create empty `features/`, `stores/`, `hooks/`, `types/` directories
- Create `lib/schemas/`, `lib/actions/`, `lib/content/`, `lib/analytics/`, `lib/auth/` structure
- Reorganize `content/` folder by sacred content type (prepare structure, don't migrate content format)
- Update all import paths
- Ensure `next build` passes after every change

### Out of Scope
- Installing new packages (no shadcn, no Sentry, no Playwright)
- Changing component logic or styling
- Adding TypeScript strict mode fixes beyond what's broken by moves
- Content format changes (that's Agent 3)
- New route creation

## Dependencies / Prerequisites
- None — this agent starts immediately
- Must complete before Agents 2, 3, 4 can fully execute

## Repository Areas Touched

```
src/app/           → src/app/(marketing)/
src/components/ui/ → split into ui/, motion/, layout/
src/lib/           → expanded with sub-folders
src/content/       → reorganized by type
```

## Detailed Task Breakdown

### Phase 1: Route Group Migration

**Task 1.1: Create `(marketing)` route group**
- Create `src/app/(marketing)/` directory
- Move these pages into it: `page.tsx` (home), `manifesto/`, `about/`, `content/`, `community/`, `contact/`, `events/`, `journal/`
- Keep `legal/` outside route groups (it's its own group)
- Keep root `layout.tsx`, `globals.css`, `template.tsx`, `sitemap.ts` at `src/app/`
- Create `src/app/(marketing)/layout.tsx` if a marketing-specific layout wrapper is needed (likely just re-export or passthrough initially)

**Task 1.2: Update sitemap**
- `src/app/sitemap.ts` — verify all routes still resolve correctly after move

**Task 1.3: Verify**
- `next build` passes
- All pages accessible at same URLs (route groups don't affect URL structure)
- No broken links in Navbar/Footer

### Phase 2: Component Reorganization

**Task 2.1: Create new component directories**
```
src/components/motion/    # for ScrollReveal, ParallaxImage
src/components/scene/     # empty, for future WebGL
src/components/content/   # empty, for future content renderers
```

**Task 2.2: Move motion components**
- `ScrollReveal.tsx` → `components/motion/ScrollReveal.tsx`
- `ParallaxImage.tsx` → `components/motion/ParallaxImage.tsx`
- `ambient-orb.tsx` → `components/motion/ambient-orb.tsx` (this is a motion component, not UI primitive)

**Task 2.3: Audit remaining `components/ui/`**
- `button.tsx` — stays in `ui/`
- `MagneticButton.tsx` — stays in `ui/` (it's a UI primitive with motion, not a pure motion component)
- `CustomCursor.tsx` — move to `components/motion/` (it's a motion/interaction layer)

**Task 2.4: Update all imports**
- Search every file that imports from `components/ui/ScrollReveal`, `ParallaxImage`, `ambient-orb`, `CustomCursor`
- Update import paths to new locations

**Task 2.5: Verify**
- `next build` passes
- No unused imports, no missing modules

### Phase 3: Library Structure Expansion

**Task 3.1: Create `lib/` sub-directories**
```
src/lib/schemas/      # Zod schemas (empty, ready for Agent 3)
src/lib/actions/      # Server actions (empty, ready for Agent 5)
src/lib/content/      # Content loader (move existing content.ts here)
src/lib/analytics/    # Sentry setup (empty, ready for Agent 8)
src/lib/auth/         # Auth config (empty, ready for Agent 5)
```

**Task 3.2: Move content utility**
- Move `src/lib/content.ts` → `src/lib/content/index.ts`
- Update imports in all files that use `getArticle`, `getAllArticles`, etc.

**Task 3.3: Create scaffolding directories**
```
src/features/         # empty
src/stores/           # empty
src/hooks/            # empty
src/types/            # empty
```

**Task 3.4: Verify**
- `next build` passes

### Phase 4: Content Folder Reorganization

**Task 4.1: Create sacred content type directories**
```
src/content/teachings/
src/content/reflections/
src/content/practices/
src/content/transmissions/
src/content/essays/
src/content/journeys/
```

**Task 4.2: Keep existing journal content in place**
- `src/content/journal/` stays as-is — it's the existing blog format
- Journal articles may later be recategorized by Agent 3, but that's not this agent's job

**Task 4.3: Keep pages content in place**
- `src/content/pages/` (imprint, privacy) stays as-is

**Task 4.4: Verify**
- Content loader still works for journal articles
- No build errors

### Phase 5: Final Verification

- [ ] `npm run lint` passes
- [ ] `npm run build` passes (which includes type-check)
- [ ] Every existing page renders at its URL
- [ ] Navbar and Footer links work
- [ ] Journal article pages render
- [ ] No console errors in dev mode

## Best Practices & Constraints

1. **Move files one group at a time, commit after each group.** Don't batch all moves into one commit.
2. **Use `git mv` when possible** to preserve file history.
3. **Test after each phase.** Don't move on to Phase 2 until Phase 1 builds clean.
4. **Don't rename files.** Keep existing filenames (even if casing is inconsistent — that's a separate cleanup).
5. **Don't modify component logic.** Only change import/export paths.
6. **Place `.gitkeep` files in empty directories** so they're tracked.

## Testing / Validation Checklist

- [ ] Route group doesn't change any URLs
- [ ] All pages render identically before and after
- [ ] `next build` produces same number of routes
- [ ] Import paths are all updated (no `Module not found` errors)
- [ ] No orphan files left in old locations
- [ ] `git diff --stat` shows only renames and import path changes

## Risks / Pitfalls

| Risk | Mitigation |
|---|---|
| Breaking import paths | Run `next build` after every file group move. Use search-and-replace for import updates. |
| Route group layout conflicts | Test that `(marketing)` layout doesn't double-wrap with root layout |
| Template.tsx behavior | Verify `template.tsx` still applies correctly within route group |
| Next.js route resolution | Route groups don't affect URLs, but verify with dev server |

## Handoff Outputs

When this agent completes, the repo will have:
- Target folder structure from ARCHITECTURE.md Section III
- All existing functionality preserved
- Empty scaffolding directories ready for other agents
- Clean git history showing the structural migration

## Subagent Strategy

This agent can use subagents for:
1. **Import path scanner** — Find all files importing from paths that will change, generate a mapping of old→new imports
2. **Build verification** — Run `next build` and report results after each phase
3. **Route audit** — Compare before/after route lists to ensure nothing was lost

## Commit Strategy

```
feat(arch): wrap public pages in (marketing) route group
refactor(arch): split components into ui/, motion/, layout/ directories
refactor(arch): expand lib/ with sub-module structure
refactor(arch): create sacred content type directories
refactor(arch): create features/, stores/, hooks/, types/ scaffolding
```
