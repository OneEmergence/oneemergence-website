# One Emergence Isometric World — G0 Canon

Status: active production canon  
Camera contract: yaw `45°`, elevation `30°`, roll `0°`, fixed 2:1 dimetric view  
Light contract: one soft warm upper-left key light, restrained cyan bounce  
Runtime format: lossless RGBA WebP

## Approved GPT Image 2 outputs

### Master style frame

- Source: `gpt-image-2-master-styleframe-v1.png`
- Role: visual language, material density, lighting, landscape hierarchy
- Runtime use: none
- Status: approved G0 canon

### Higgsfield comparison frame

- Source: `higgsfield-master-styleframe-candidate-v1.png`
- Model: Soul Location
- Role: independent composition and three-depth study
- Status: retained as a rejected comparison candidate
- Reason: the depth zoning and river are useful, but the oversized left tree,
  bright-blue surround, sparse northern settlement and perspective do not meet
  the approved central-focus, Deep-Space and dense-RTS contracts.

### Vertical-slice landmarks

| Landmark | Raw generation source | Runtime asset |
|---|---|---|
| Tree of Emergence | `../source/landmarks/tree-gpt-image-2-chroma-v1.png` | `/images/world-map/isometric/landmarks/tree/base.webp` |
| Root Home | `../source/landmarks/root-home-gpt-image-2-chroma-v1.png` | `/images/world-map/isometric/landmarks/root-home/base.webp` |
| Living Earth Institute | `../source/landmarks/earth-gpt-image-2-chroma-v1.png` | `/images/world-map/isometric/landmarks/earth/base.webp` |

The raw sources use a flat magenta chroma background. Runtime assets were processed with the installed imagegen chroma-key helper, cropped without distortion, downsampled with Lanczos, and saved as lossless WebP.

## Shared production prompt

```text
Use case: stylized-concept
Asset type: production game landmark sprite
Input images: approved One Emergence master style frame and previously approved
landmark sprites are visual references only. Preserve their painterly 32-bit RTS
rendering language, fixed camera, warm upper-left light, cyan bounce, tactile
materials, crisp silhouette, and restrained sacred-solarpunk vocabulary.

Style/medium: richly hand-painted high-resolution 32-bit-era RTS game sprite
with Retro-RPG warmth; contemporary polish; no low-poly geometry, no
photorealism, no chunky pixelation.

Composition/framing: single centered full object, camera yaw 45 degrees and
elevation 30 degrees, consistent 2:1 isometric/dimetric projection, east and
south faces visible, generous padding, complete footprint visible, no
perspective convergence.

Lighting/mood: one soft warm upper-left key light and subtle cyan bounce,
compact ambient occlusion only.

Scene/backdrop: perfectly flat solid #ff00ff chroma-key background. Uniform
color only; no shadows, gradients, texture, reflections, floor plane, or
lighting variation.

Constraints: no #ff00ff in the landmark; no cast or detached shadow, reflection,
text, labels, UI, logos, watermark, people, animals, weapons, horizon, scenery,
unrelated buildings, floating rings, neon overload, or copied game architecture.
```

## Landmark-specific prompt additions

### Tree of Emergence

```text
A monumental inhabited ancient tree with a broad readable crown, intertwined
road-like roots, a warm arched doorway, crafted wooden and stone dwelling
details integrated into the roots, subtle cyan energy veins, and one restrained
golden sacred-geometry light within the crown. Iconic at RTS overview scale.
Stable 5-by-5 tile footprint.
```

### Root Home

```text
A welcoming compact home grown into sheltering old roots, with a rounded warm
wooden doorway, two amber windows, a covered stoop, carved stone foundation,
woven awning, herb planters, seed baskets, one lantern, and subtle cyan root
veins. Humble and grounded. Stable 3-by-3 tile footprint.
```

### Living Earth Institute

```text
A civic ecological research center formed by three connected low greenhouse
domes around a taller seed-vault pavilion, with planted roofs,
timber-and-ceramic ribs, garden beds, a mycelium nursery, rainwater channels,
solar-flower canopies, and a turquoise glass entry. Stable 4-by-4 tile
footprint.
```

## Acceptance checks

- transparent RGBA output and all four corner pixels fully transparent
- no visible magenta fringe on Deep Space
- no perspective mismatch between the three assets
- silhouettes remain distinct at overview scale
- total compressed vertical-slice landmark payload remains below `1.5 MB`
- no runtime dependency on the raw source files
