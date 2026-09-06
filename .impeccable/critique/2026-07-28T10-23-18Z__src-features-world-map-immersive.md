---
target: src/features/world-map/immersive
total_score: 20
p0_count: 0
p1_count: 4
timestamp: 2026-07-28T10-23-18Z
slug: src-features-world-map-immersive
---
Method: dual-agent (A: /root/retro_map_design_review · B: /root/retro_map_detector)

# One Emergence Immersive Map — Design Critique

Target: `src/features/world-map/immersive`  
Live route: `/map/immersive`  
Viewports: `1440 × 900`, `390 × 844`

## Executive assessment

The implementation has a solid interaction, fallback, persistence, and accessibility foundation. Its visible medium is the central failure: procedural low-poly primitives, repeated rings, cone trees, sparse ecology, and a plastic terrain slab communicate a blockout rather than the authored Retro-RPG/RTS world promised by the concept.

The recommended direction is a fixed-camera, hand-painted 2.5D isometric world inside the current R3F shell. Keep camera, picking, state, game logic, sound, DOM navigation, and fallbacks. Replace the visible environment with governed tiles and anchored sprites.

## Health score

| Nielsen heuristic | Score |
|---|---:|
| Visibility of system status | 3/4 |
| Match between system and world | 2/4 |
| User control and freedom | 2/4 |
| Consistency and standards | 2/4 |
| Error prevention | 2/4 |
| Recognition rather than recall | 2/4 |
| Flexibility and efficiency | 3/4 |
| Aesthetic and minimalist design | 1/4 |
| Error recognition and recovery | 2/4 |
| Help and documentation | 1/4 |
| **Total** | **20/40** |

Interpretation: mechanically acceptable; major visual and experience redesign required.

## AI-slop verdict

Fail, high confidence.

The brand palette is present, but the world relies on generic low-poly vocabulary: primitive geometry, emissive rings, cone trees, floating glass surfaces, pills, and repeated tracked uppercase labels. The atlas preview is richer and more atmospheric than the live scene.

## Main findings

### [P1] The visible medium is wrong

The current primitive blockouts cannot deliver the hand-built Retro-RPG/Age-of-Empires fantasy.

Remediation: use one governed isometric system with a fixed camera, shared tile metric, terrain/water/path kits, vegetation and prop families, and 15 authored hero-building sprites. Use 3D invisibly where it helps camera, depth, picking, flows, and particles.

### [P1] Place detail hijacks the first frame

The selected place initializes to the Tree and the large detail panel is rendered before the user acts. On mobile it consumes roughly half the viewport.

Remediation: initialize with no selection. Open detail only after selecting a building or atlas entry. Desktop uses a compact right drawer; mobile uses a bottom sheet. Close with X, Escape, or empty terrain and restore focus.

### [P1] Buildings are visually and accessibly mute

The 15 abstract silhouettes cannot be identified reliably in the world. The canvas is intentionally non-semantic, so the DOM landmark navigation must remain complete.

Remediation: distinct silhouettes, hover/focus/tap labels, strong selection footprints, and an accessible landmark list tied to camera focus.

### [P1] Product chrome overwhelms exploration

Quality, atmosphere, fallback, reset, sound, camera controls, navigation, atlas, and exit compete simultaneously.

Remediation: keep Back, Atlas, and Settings persistent. Move quality, atmosphere, audio, fallback, and reset into Settings. Prefer direct drag/pinch/wheel camera control while retaining keyboard and accessible controls.

### [P2] Overlay and recovery behavior is incomplete

The atlas does not fully isolate underlying controls and destructive reset lacks confirmation.

Remediation: use a true modal atlas or non-covering drawer, confirm reset, and show explicit quality/atmosphere choices.

## Cognitive load

Seven of eight checks fail. Only local grouping passes.

- The map, dashboard, camera pad, navigation, atlas, and settings compete for focus.
- Progress systems are exposed before the first user decision.
- Buildings require users to remember atlas names and silhouettes.
- The base accessibility snapshot exposes 18 controls; the atlas adds another large destination set.
- Mobile turns the world into scenery behind the panel and camera controls.

## Emotional journey

- Arrival: Tree, river, and Deep Space promise wonder.
- Immediate valley: the interface explains systems before the world can be explored.
- Exploration valley: unlabeled abstract landmarks turn discovery into guessing.
- Potential peak: harmonization, flows, atmosphere, and sound can provide a strong payoff once assets feel precious.
- End: persisted state and exit are reassuring; unconfirmed reset weakens trust.

## Persona red flags

### Jordan — first-time visitor

- No clear first action in five seconds.
- Specialized language appears before a teach-through-action moment.
- The preselected Tree makes it unclear whether an action already occurred.

### Sam — accessibility-dependent visitor

- Spatial meshes are pointer-only, while the canvas is hidden from assistive technology.
- The atlas is a useful alternative, but underlying controls remain available when it opens.
- The current place detail has no keyboard-close path.

### Casey — distracted mobile visitor

- Place panel and camera pad occupy most of the screen.
- Internal panel scrolling hides secondary controls below the fold.
- Icon-only header controls weaken orientation even though accessible names remain.

## What works

- Tree and S-shaped river provide a strong spatial spine.
- Deep Space, teal, cyan, violet, and gold already align with the brand.
- Orthographic navigation, keyboard camera, focus rings, 44px targets, quality fallback, WebGL recovery, 2D fallback, and persisted state are valuable and should be retained.

## Deterministic detector

Static CLI result: 0 findings.

The browser overlay produced 15 rule instances across 14 elements:

- clipped overflow: 2
- AI color palette: 9
- all-caps body: 1
- cramped padding: 1
- overused font: 1
- nested cards: 1

All 15 were classified as deterministic false positives:

- full-viewport clipping is intentional for the stage;
- cyan/deep-space colors are committed brand tokens;
- the uppercase match is a small eyebrow, not body prose;
- the button reaches 44px through minimum height;
- Inter and Cormorant are committed body/heading families;
- the sound control is a functional group, not a nested content card.

Browser evidence found no horizontal overflow, no runtime exceptions, and one unrelated Three.js Clock deprecation warning.

## Recommended visual direction

- richly painted, high-resolution 2.5D isometric RTS art;
- fixed 2:1 grid and fixed upper-left light;
- warm inhabited roots, living solarpunk middle, cosmic northern depth;
- mysticism expressed through materials, water, architecture, weather, and light rather than generic rings;
- coherent asset families and style references rather than isolated prompts.

## Questions

Questions skipped: the requested direction and scope are sufficiently clear. The default interpretation is painterly 2.5D with Retro-RPG warmth and RTS readability, not literal chunky pixel art.

## Run notes

- Target slug: `src-features-world-map-immersive`
- Ignore file: none
- Assessment A: `/root/retro_map_design_review`
- Assessment B: `/root/retro_map_detector`
- Static detector: completed
- Browser detector: completed
- Desktop and mobile inspection: completed
- Detector injection preflight: completed
- Overlay screenshot: completed in an isolated headless browser
- Persistent user-visible overlay: unavailable in the isolated browser, not claimed
- Detector server and browser session: cleaned up
- Repository changes during assessment: none
