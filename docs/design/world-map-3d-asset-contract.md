# One Emergence World — 3D-Asset-Vertrag

Status: aktiv ab Gate 3

## Produktionsentscheidung

Die erste Produktionsfassung verwendet die prozeduralen Three.js-Meshes als
native Assets. Sie liefern alle 15 Silhouetten ohne zusätzliche Texturen oder
Netzwerkrequests, reagieren direkt auf Brand-Tokens und besitzen echte
Low-/Medium-/High-LODs. GLB ersetzt eine Landmarke nur, wenn der Import in der
Referenzkamera sichtbar besser ist und innerhalb des Szenenbudgets bleibt.

Meshopt und KTX2 sind für das prozedurale Set bewusst nicht anwendbar: Es gibt
weder externe Mesh-Binärdaten noch Texturen zu komprimieren.

Ausnahme ist der optionale High-LOD-Hero des Tree of Emergence. Er wird erst
beim manuellen Wechsel auf High geladen und verwendet Meshopt,
Mesh-Quantisierung sowie eine 1024px-WebP-Textur. Das Rohmodell fiel mit
7,43 MB durch; der reproduzierbare Produktionslauf misst 857 KB bei 30.487
Dreiecken. KTX2 bleibt für diesen einzelnen Base-Color-Slot vertagt, bis ein
Basis-Universal-Encoder Teil der Build-Umgebung ist.

## Laufzeitvertrag

- Einheit: Meter; Y zeigt nach oben; Ursprung liegt am Fußpunkt der Landmarke.
- Alle Orte verwenden `WORLD_PLACEMENTS` für Position, Fokus, Pick-Radius und
  Skalierung.
- Low reduziert Segmente, Sekundärdetails, Schatten und Naturdichte.
- Medium ergänzt die lesbare Silhouette bei moderater Segmentzahl.
- High nutzt volle Segmentzahl, Fokusdetails und die zweite Zustandsaura.
- Materialien stammen ausschließlich aus `WorldScenePalette`.
- Wiederholte Natur bleibt instanziert; Canvas-Inhalt bleibt nie der einzige
  Bedienweg.

Der Canvas veröffentlicht nach dem ersten Rendern folgende messbare
Diagnosewerte:

- `data-world-asset-format`
- `data-world-lod`
- `data-world-draw-calls`
- `data-world-triangles`
- `data-world-budget`

Der fokussierte Playwright-Smoke-Test schlägt fehl, wenn kein echter Render
stattfindet oder das Qualitätsbudget überschritten wird.

Der binäre Asset-Check läuft separat:

```bash
pnpm test:world-assets
```

## Vertrag für spätere Hero-GLBs

Ein externer Ersatz liegt unter `public/models/world-map/<id>/` und enthält:

```text
<id>.glb
├── <id>__lod0
├── <id>__lod1
├── <id>__lod2
├── pick__<id>
└── focus__<id>
```

- LOD0/1/2 müssen dieselbe Grundsilhouette und denselben Ursprung behalten.
- Pick- und Fokus-Nodes sind unsichtbare, einfache Proxies.
- Keine eingebetteten Kameras oder Lichter.
- Maximal ein gemeinsamer Materialatlas pro Landschaftstiefe.
- Farbtexturen verwenden KTX2 nur, wenn reale Texturen hinzukommen.
- Der Export ist ein binäres GLB; fehlende Texturen oder unbenannte LODs
  blockieren den Import.
- Ein Hero-GLB darf den initialen Szenenpfad nur ersetzen, wenn `/map` weiter
  keinen 3D-Chunk lädt und das rohe Einstiegspaket unter 6 MB bleibt.
