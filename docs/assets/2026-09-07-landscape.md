# Gemalte Landschaft — Asset-Provenienz

Stand: 7. September 2026. Erzeugt mit dem eingebauten Imagegen-Werkzeug
(Built-in-Modus, keine zusätzliche API-/CLI-Integration). Stilreferenz war das
vorhandene `public/images/world-map/isometric/landmarks/root-home/base.webp`.
Die bestehenden Gebäude wurden nicht neu generiert.

## Verwendete Dateien

| Datei unter `public/images/world-map/isometric/terrain/` | Auflösung   | Größe           | Verwendung                                                                                     |
| -------------------------------------------------------- | ----------- | --------------- | ---------------------------------------------------------------------------------------------- |
| `painted-meadow-v2.webp`                                 | 1254 × 1254 | 342.480 Bytes   | Gemalte Wiesen, Klee, Moos, kleine Blüten und warme Erde; ersetzt die bisherige Bodenbelegung. |
| `landscape-details-v1.webp`                              | 1254 × 1254 | 1.507.142 Bytes | Ein gemeinsamer 2×2-Atlas: Sandsteinfelsen, Kräutergarten, Schilfufer, Blumenfläche.           |

Die angefragten 2048 Pixel wurden vom Werkzeug als 1254 Pixel geliefert; diese
native Auflösung bleibt erhalten. Sharp konvertierte ausschließlich das Format:
Wiese mit WebP-Qualität 88, Atlas verlustfrei. Kein nachträgliches Hochskalieren.

Der erste Atlas enthielt trotz Alpha-Anfrage ein **eingebranntes Schachbrett**.
Dieser Entwurf wird nicht ausgeliefert. Ein Imagegen-Edit ersetzte den Hintergrund
durch Magenta. `LandscapeEnvironment.tsx` entfernt den Farbschlüssel und die
Farbsäume im Material vor dem Alpha-Test. Alle Landschaftsdetails teilen eine
Geometrie und ein Material. Für künftige Assets ist echtes Alpha vorzuziehen;
bei violetten Pflanzen muss das Keying erneut beurteilt werden.

Originale der gewählten Generationen im lokalen Imagegen-Ausgabeordner
`C:/Users/Julius6043/.codex/generated_images/01a07883-ff14-76c2-baa9-d49e97ab01b7/`:

- Wiese: `exec-0eae388c-6e13-49c2-9e07-47003003660e.png`
- Finale Details: `exec-ceccb885-1e1a-47bc-8931-3eb161ae15c6.png`
- Verworfener Schachbrett-Entwurf: `exec-1221e9b8-69ae-4c27-b89b-e57634fb4542.png`

Die lokalen Originale werden zum Betrieb nicht benötigt; die gewählten WebP-Dateien
sind vollständig im Repository enthalten.

## Prompts

### Wiese — Referenz: Root Home

> Create a NEW production-ready terrain albedo texture for a hand-painted solarpunk fantasy strategy game. The attached building is a STYLE AND MATERIAL reference only, do not include the building. Output a square 2048x2048 completely opaque texture, orthographic directly TOP-DOWN, covering the entire image edge to edge, no border. A beautiful painterly moss meadow made of broad softly varied islands of sage grass, clover and fern-green moss, warm golden-olive meadow clearings, sparse tiny cream wildflowers, subtle ochre earth showing through, a few modest weathered sandstone pebbles. Match the reference's lovingly painted luminous natural materials, warm light and organic brush detail. Landscape-scale TEXTURE, not an isometric scene: foliage is low and sparse, no trees, no bushes, no buildings, no river, no paths, no objects casting strong shadows. Mid-value greens and golden grassy patches must be clearly readable, never dark teal-black. Soft even illumination, no vignette, no huge central motif, no horizon, no sky, no text. Keep enough restrained open grass for buildings and paths to be overlaid in the game. Aim at charming illustrated storybook / high quality painted game art rather than photorealistic lawn noise. Broad variation over the whole tile, seamless edges if possible.

### Vier Landschaftsdetails — Referenz: Root Home

> Create a NEW square 2048x2048 production sprite sheet of FOUR landscape decorations for the same hand-painted fantasy solarpunk strategy game as the reference building. Reference is STYLE and material only. Genuine transparent alpha background, no ground rectangle, no checkerboard, no text. Four independent fully separated sprites in a regular 2x2 grid, one centered in each quadrant with wide transparent gutters (at least 100px) and 70px transparent outer margins. Each object fully visible, no overlap. Isometric orthographic camera: 45 degree azimuth, looking down 30 degrees, matching the reference building. Delicate painted detailing and highlights, warm sandstone/old golden wood, moss-green vegetation and tiny cream/gold flowers, light from upper left. Top left: a low rounded natural sandstone rock outcrop with mossy shelves and soft trailing roots, no tree, wider than tall. Top right: a lovingly tended terraced herb and flower garden enclosed by a low curved weathered warm-stone wall, small lush beds, a few ivory flowers, no roof/no building. Bottom left: natural riverbank cluster of reeds, ferns, two rounded stones and a few tiny waterlilies, a small patch of turquoise water around their base, no rectangular edges. Bottom right: a low luxuriant wildflower meadow mound with clover, short grasses, white and golden wildflowers, a little fern, organic feathered ground edge, no tall tree. Each has a tiny integrated soil/stone footprint and soft contact shadow, isolated cutout. Strongly match reference painterly craftsmanship, not photorealism, not flat vector, no chunky toy-like plastic. These are small landscape details, keep silhouettes low so they never compete with the buildings.

### Korrektur des Atlas-Hintergrunds — Referenz: erster Atlas

> Edit this production landscape sprite atlas ONLY by replacing the entire white-and-grey checkerboard background with a perfectly uniform saturated pure MAGENTA chroma-key background RGB(255,0,255), hex #FF00FF. Keep all four painted landscape objects, their positions in the 2x2 sheet, scale, lovely colors, flowers, stone details and lighting exactly as they are. The user needs a clean keyable game asset; there must be NO checkerboard, white canvas, floor or backdrop shading at all. All empty pixels and empty space between leaves and reeds are solid #FF00FF. Keep the objects' edges clean, no magenta tint cast onto the stone/plants. Square canvas. No text. Do not move, resize, redesign or add objects.

## Technische Referenz

Der gemalte Boden verwendet nach dem asynchronen Laden ein neu angelegtes
Material: Der Wechsel von einem Material ohne Textur zu einem mit Textur benötigt
eine erneute Shader-Konfiguration. Siehe [Three.js: Materialänderungen](https://threejs.org/manual/en/materials.html#material-needsupdate).
