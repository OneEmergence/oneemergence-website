# One Emergence World Map V2

## Retro-RPG / RTS 2.5D Production Plan

Status: geplante V2  
Datum: 2026-07-28  
Zielroute: `/map/immersive`

## 1. Entscheidung

Die immersive Karte wird als **handgemalt wirkende 2.5D-RTS-Welt in einem bestehenden R3F-Unterbau** weiterentwickelt.

Das bedeutet:

- Die Kamera bleibt orthografisch und die Welt bleibt in Echtzeit zoombar und verschiebbar.
- Gebäude, Vegetation und Props werden als hochwertige isometrische Sprites gerendert.
- Terrain, Wasser, Wege und Höhenstufen werden aus einem kontrollierten Tile-System gebaut.
- R3F bleibt für Kamera, Tiefensortierung, Picking, Partikel, Lichtströme und Zustandsfeedback erhalten.
- Die sichtbaren Low-Poly-Blockouts werden nach einer erfolgreichen Vertical Slice ersetzt.
- Es wird keine frei drehbare Kamera geben. Die feste Perspektive ist Teil des Art Contracts.

Der Zielstil ist **kein wörtlicher 16-Bit-Pixel-Look**. Er verbindet:

- die klare Lesbarkeit und Siedlungsdichte klassischer RTS-Karten,
- die Wärme und Detailfreude eines Retro-RPGs,
- die kosmisch-solaren Materialien der One-Emergence-Marke,
- moderne, hochauflösende 32-Bit-ähnliche Illustrationen.

Die Referenzen bestimmen Perspektive, Dichte und Gefühl, werden aber nicht kopiert. Architektur und Symbolik bleiben eigenständig.

## 2. Review des aktuellen Standes

### Was erhalten bleibt

- `game.ts` und die bestehende Progressionslogik
- Landmark-IDs, Texte und Weltplatzierungen als Ausgangspunkt
- orthografische Kamera, Pan und Zoom
- Auswahl- und Picking-Mechanik
- Qualitäts- und Intensitätsmodi
- Soundscape und gespeicherter Kampagnenstand
- DOM-basierte, barrierefreie Landmark-Navigation
- 2D-Fallback und Fehlergrenzen
- die räumliche Hauptidee: Tree of Emergence, Fluss, drei Tiefen und 15 Orte

### Was ersetzt wird

- prozedurale Low-Poly-Gebäude aus Zylindern, Kugeln, Boxen und Tori
- gleichförmige Kegelbäume
- die glatte, spielbrettartige Inseloberfläche
- austauschbare Leuchtringe als primäre mystische Formensprache
- das ungefragte, immer sichtbare Ortsdetail
- die Verteilung globaler Einstellungen im Ortsdetail

### Wesentliche Review-Ergebnisse

- Die technische Basis ist belastbar, die sichtbare Kunstschicht wirkt jedoch wie ein Blockout.
- Die Karte besitzt mit Baum und Fluss bereits eine gute räumliche Achse.
- Die erste Ansicht ist durch Ortsdetail, Navigation, Kamerapad und Einstellungen überladen.
- Auf Mobilgeräten wird die Welt vor der ersten Interaktion zu stark von UI bedeckt.
- Gebäude sind ohne Atlas nicht zuverlässig identifizierbar.
- Der statische Code-Detektor fand keine strukturellen UI-Regelverstöße; die Probleme liegen vor allem in Medium, Hierarchie und Dramaturgie.

## 3. Festgelegter Art Contract

### Perspektive und Raster

- Weltachsen: `+X` Osten, `+Z` Süden, `+Y` Höhe
- Kamera: orthografisch
- Azimut: `45°`
- Elevation: `30°`
- Roll: `0°`
- Projektion: festes 2:1-Diamantraster
- logische Welt: zunächst `40 × 24` Zellen
- Zellgröße: `2 × 2` World Units
- Höhenstufen: drei feste Ebenen mit je `0.75` World Units
- Kamera: Pan und Zoom, keine Rotation
- Licht: weiches warmes Hauptlicht von Nordwesten, cyanfarbenes Umgebungslicht

### Drei visuelle Tiefen

1. **Wurzeln / Süden**
   - warme Erde, Sandstein, Wohnorte, Gärten, Textilien und Holz
   - Farben: Ocker, Terrakotta, Blattgrün, warmes Gold

2. **Lebendige Mitte**
   - Wasser, Solararchitektur, Gewächshäuser, gemeinschaftliche Zentren
   - Farben: tiefes Grün, Türkis, Cyan, helles Holz und Keramik

3. **Kosmischer Norden**
   - Observatorien, Datenzentren, Kristallgestein und Himmelsarchitektur
   - Farben: violetter Schiefer, Nachtblau, Cyan und zurückhaltendes Gold

### Material- und Formensprache

- geschnitzter Stein
- lebendes Holz und Wurzeln
- Keramik und gewebte Fasern
- Glas, Wasser und bepflanzte Dächer
- Solarsegel, Lichtkanäle und kristalline Datenelemente
- sakrale Geometrie als Teil von Bauwerk und Landschaft

Richtwert pro Bild:

- 70 % natürliche oder mineralische Flächen
- 20 % Tiefenfarbe
- 10 % Licht in Gold, Cyan oder Violett

### Verbotene Abkürzungen

- keine Textlabels oder Logos in generierten Sprites
- keine militärischen Einheiten oder dystopische Architektur
- kein generisches Neon-Sci-Fi
- keine langen eingebrannten Schlagschatten
- keine Fluchtpunktperspektive oder Horizontlinie
- keine wechselnden Sonnenrichtungen
- keine vollflächigen Glow-Ringe als Ersatz für Architektur
- keine direkte Nachbildung geschützter Gebäude aus Referenzspielen

## 4. UI-Verhalten

### Ausgangszustand

- `selectedId` wird `WorldLandmarkId | null`.
- Die Karte startet mit `selectedId = null`.
- Beim Eintritt ist kein Ortsdetail sichtbar.
- Dauerhaft sichtbar bleiben nur:
  - Zurück
  - Weltatlas
  - Einstellungen
- Die Welt selbst erhält die visuelle Priorität.

### Auswahl eines Gebäudes

Eine Ortsansicht wird geöffnet durch:

- Klick oder Tap auf ein Gebäude
- Auswahl im Weltatlas
- Auswahl in der barrierefreien Landmark-Liste

Desktop:

```text
┌───────────────────────────────────────────────────────────────┐
│ Resonanzfeld                         Atlas  Einstellungen  Zurück│
│                                                               │
│                         SPIELWELT                  ┌──────────┐ │
│                                                   │ Ort   [×]│ │
│                                                   │ Status   │ │
│                                                   │ Aktion   │ │
│                                                   └──────────┘ │
└───────────────────────────────────────────────────────────────┘
```

Mobil:

```text
┌──────────────────────────────┐
│ Atlas  Einstellungen  Zurück │
│                              │
│          SPIELWELT           │
│                              │
├──────────────────────────────┤
│ Ort                      [×] │
│ Status und Aktion            │
└──────────────────────────────┘
```

### Schließen

Das Detail schließt durch:

- sichtbaren Schließen-Button
- `Escape`
- Klick oder Tap auf leeres Terrain

Ein Kamera-Drag gilt nicht als Terrain-Klick und darf das Panel nicht versehentlich schließen.

Danach:

- verschwindet das Detail vollständig,
- bleibt die Kamera an ihrer Position,
- kehrt der Tastaturfokus zum auslösenden Landmark oder zur Kartenfläche zurück.

Das Panel ist kein blockierender Dialog. Die Welt bleibt bedienbar. Auf Desktop erscheint es rechts als kompakter Drawer, auf Mobil als Bottom Sheet mit maximal etwa `55dvh`.

### Verlagerung globaler Controls

Qualität, Atmosphäre, Audio, 2D-Fallback und Zurücksetzen gehören in einen kompakten Einstellungs-Popover. Sie dürfen nicht Teil eines Ortsdetails sein.

Das sichtbare Kamerapad wird sekundär:

- Drag, Pinch und Wheel sind primär.
- Tastatursteuerung bleibt vollständig erhalten.
- Das D-Pad wird nur bei Touch-/Bedarfskontext eingeblendet oder über Einstellungen erreichbar.

### UI-Akzeptanz

- Beim Start existiert kein Ortsdetail.
- Gebäudeauswahl öffnet genau ein Detail.
- `X`, `Escape` und leeres Terrain schließen es.
- Eine Pan-Geste verändert die Auswahl nicht.
- Der Fokus wird korrekt wiederhergestellt.
- Der Weltatlas öffnet denselben Detailzustand.
- Auf `390 × 844` bleibt mehr als die Hälfte des Viewports für die Welt sichtbar.
- Landmark-Namen und Zustände sind nicht ausschließlich durch Farbe oder Canvas-Grafik zugänglich.
- Neue UI-Texte werden in Deutsch und Englisch über die bestehenden `next-intl`-Messages geführt.

## 5. Render-Architektur

### Minimaler Umbau

```text
bestehende R3F Canvas
├── orthografische Kamera
├── unsichtbare Pick-Flächen
├── zusammengefasste Terrain-/Wasser-Geometrie
├── isometrische Gebäude-Sprites
├── Vegetations- und Prop-Sprites
├── prozedurale Zustands- und Resonanzeffekte
└── bestehendes DOM-HUD
```

Keine neue Runtime-Engine und kein ECS werden eingeführt.

### Tiefensortierung

Alle Objekte besitzen einen Bodenanker. Die Sortierung folgt der Rasterposition:

```text
(gridX + gridZ) * 4096 + gridX + sortOffset
```

Gebäudeanker liegen im projizierten Mittelpunkt ihrer Grundfläche. Figuren werden zwischen den Füßen verankert; Props im Mittelpunkt ihres Bodenkontakts.

### Asset-Auflösung

- `@2x` Terrain-Diamant: `128 × 64 px`
- `@1x` Terrain-Diamant: `64 × 32 px`
- Klippen `@2x`: `128 × 96 px`
- kleine Props: ungefähr `64 × 96 px`
- mittlere Props: ungefähr `128 × 192 px`
- Landmarken: je nach Footprint `256–512 px` breit und `320–768 px` hoch

Autoritative Quellen bleiben verlustfreie RGBA-PNGs. Auslieferung erfolgt als verlustfreies WebP.

### Zustände ohne dreifache Asset-Menge

Jedes Landmark erhält:

- ein Basis-Sprite,
- eine graustufige Emissionsmaske.

Runtime-Zustände:

- ruhend: Basis-Sprite
- eingestimmt: cyanfarbene Emissionsmaske
- harmonisiert: goldfarbene Emissionsmaske plus gemeinsamer Effekt
- ausgewählt: prozeduraler Fokus-/Footprint-Ring

Damit werden nicht 45 voneinander abweichende Gebäudevarianten erzeugt.

### Atlas-Entscheidung

Die Vertical Slice startet mit einzelnen WebP-Dateien. Nach realer Messung wird entschieden:

- bleiben die Draw Calls und Requests im Budget, bleibt das einfachere Dateimodell bestehen;
- überschreiten sie das Budget, werden stabile Produktionsassets in maximal `2048²` große Atlanten gepackt.

Es wird vor diesem Messpunkt weder eine neue Atlas-Library noch eine eigene Asset-Pipeline gebaut.

## 6. Asset-Katalog

Die folgenden Zahlen sind der vollständige Zielkorridor, nicht die erste Produktionscharge.

### 6.1 Style- und Referenzassets

- 1 Master-Styleboard
- 3 Tiefen-Styleboards
- 1 Kamera-/Raster-Referenz
- 1 Materialtafel
- 1 Silhouetten- und Maßstabstafel
- 1 Beleuchtungsreferenz

### 6.2 Terrain — bis zu 102 Frames

- 12 Grundflächen: 3 Tiefen × 4 Varianten
- 48 Übergangstiles: 3 Tiefen × 16 Verbindungsmasken
- 12 organische Rand-/Ecken-Decals
- 12 Klippenelemente
- 18 Bodendetails: Wurzeln, Kiesel, Blumen, Blätter, Myzel, Sternenstaub

KI erzeugt nur Materialstudien. Nahtlose Übergänge, Connectivity-Masken und Klippen werden kontrolliert manuell gebaut.

### 6.3 Wasser und Küsten — bis zu 56 Frames

- 4 offene Wasserflächen
- 8 gemeinsame Schimmerframes
- 16 Küstenverbindungen
- 16 Flussverbindungen
- 6 besondere Elemente: Quelle, Becken, Deltas, Wasserfallkanten
- 6 gemeinsame Schaumframes

Im Still-Modus wird jeweils Frame 0 verwendet.

### 6.4 Wege, Plätze und Brücken — bis zu 78 Frames

- 16 warme Steinwege
- 16 Wurzel-/Pilgerpfade
- 16 cyanfarbene Center-Leitungen
- 16 violett-goldene Journey-Leitungen
- 6 Plätze
- 6 Rampen oder Treppen
- 6 Brücken in drei Materialfamilien und zwei Orientierungen

### 6.5 Vegetation — bis zu 85 Sprites

- 18 Bäume
- 9 Grove Cards
- 12 Sträucher
- 18 Bodendecker-Cluster
- 16 Spezialcluster: Schilf, Myzel, Nutzgärten, Solarblumen
- 12 Felsen, Kristalle und Baumstümpfe

### 6.6 Umgebungsprops — bis zu 38 Sprites

Warme Tiefe:

- Feuerstelle, Brunnen, Wurzelbogen, Saatkörbe
- Bank, Laterne, Gartenbeet, kleiner Schrein

Lebendige Mitte:

- Solarblume, Windblüte, Regenzisterne, Kompost-Pod
- Myzel-Lampe, Gewächshausbeet, Lastenrad
- Gemeinschaftstisch, Banner, Brunnen

Kosmische Tiefe:

- Datenobelisk, Antennenhalm, Sternenlinse
- Archivkristall, schwebende Laterne, Signal-Totem

Hafen und Wege:

- Dockteile, Poller, Cargo-Pod, Skiff, Segelboot
- Leuchtboje, Canopy, Wegweiser, Zäune, Torbogen

### 6.7 Fünfzehn Landmarken

| ID | Footprint | Visuelles Erkennungsmerkmal |
|---|---:|---|
| `tree` | 5×5 | bewohnter uralter Baum, warme Tür, geometrische Krone, straßenartige Wurzeln |
| `council` | 4×4 | offene terrassierte Ratsarena, zentraler Kreistisch |
| `noosphere` | 4×4 | halb eingegrabene neuronale Kuppeln und kristalliner Kern |
| `ashram` | 4×4 | Bergterrassen, Wasserhöfe und ruhiger Schrein |
| `energy` | 4×4 | Windblüten, Solarsegel und Speicherblätter |
| `earth` | 4×4 | Gewächshausinseln, Saatarchiv und Myzelgärten |
| `creation` | 4×4 | spiralförmige Werkstätten, Amphitheater und offene Bühne |
| `exchange` | 5×3 | Hafenbogen, Pier, Segelmast und Verkehrsknoten |
| `root-home` | 3×3 | warmes Zuhause innerhalb lebender Wurzeln |
| `creation-temple` | 3×3 | organischer Oasentempel mit Blütendach |
| `solar-ark` | 4×2 | kompaktes Schiff mit eindeutigem Solarsegel |
| `heart-caravan` | 3×2 | bepflanztes mobiles Zuhause mit sichtbaren Rädern |
| `voice-beacon` | 2×2 | schlanker Kommunikationsturm mit drei Signalringen |
| `observatory` | 3×3 | Bergkuppel mit angewinkelter Sternenlinse |
| `cosmic-control` | 3×3 | schwebendes Schiff mit Himmelsringen und Kernlicht |

### 6.8 Optionale Figuren

Erst nach bestandener Core-Asset-Gate:

- Gärtner:in
- Pilger:in
- Kurier:in

Je Rolle:

- 4 Rasterrichtungen
- 4 Idle-Frames
- 6 Walk-Frames

Keine Armeen, Kampfeinheiten, Spielerfigur oder Porträtpipeline in V2.

### 6.9 VFX

Beibehalten oder manuell/prozedural erzeugen:

- Auswahlring
- Zustandsringe
- cyanfarbene Center-Verbindungen
- violett-goldene Journey-Verbindungen
- Resonanzstrom
- Aufmerksamkeitspartikel

Optionaler Dekor-Atlas:

- Wasserglanz
- Rauch
- Blattflug
- Glühwürmchen
- Fußstaub
- Harmonisierung
- Emergence Bloom

### 6.10 UI-Assets

- 15 aus den Silhouetten abgeleitete Landmark-Icons
- 3 Ebenen-Crests
- 3 formverschiedene Zustandsglyphen
- 4 Minimap-Marker

Panels, Buttons, Tooltips und Texte bleiben semantisches DOM mit CSS, Cormorant, Inter, Lucide und Brand-Tokens.

## 7. Higgsfield-Produktionspipeline

Der freigeschaltete Zugang wurde geprüft; die benötigten Bild-, Korrektur-, Freistellungs- und Zerlege-Workflows sind verfügbar.

### Rollen der Modelle

| Aufgabe | Werkzeug | Regel |
|---|---|---|
| Welt- und Tiefen-Moodboards | Soul Location | nur Szenenstudien, keine Produktionssprites |
| Landmark-Konzept | Soul Location + GPT Image 2 | zuerst im Weltkontext, danach isoliert |
| Landmark-Sprite | GPT Image 2 | feste Kamera, Licht- und Footprint-Vorgabe |
| konsistente Korrektur/Variante | Nano Banana 2 | nur mit freigegebenen Referenzbildern |
| Vegetation und Props | GPT Image 2 | isolierte Kandidaten, danach bereinigen |
| Freistellung | Background Remover | Alpha anschließend manuell prüfen |
| Kontaktbogen zerlegen | Image Decompose | nur für Ideation oder Props, nicht blind übernehmen |
| Perspektivproblem | Multi-Image-to-3D | Ausnahme; Ergebnis wieder als 2D-Sprite rendern |

Runtime-GLBs sind nicht die Standardausgabe.

### Prompt-Grammatik

Jeder Produktionsprompt enthält dieselben unveränderlichen Bestandteile:

```text
original One Emergence sacred-solarpunk hand-painted 2.5D orthographic
isometric RTS asset, camera yaw 45 degrees, elevation 30 degrees,
warm soft upper-left key light, subtle cyan bounce light,
crisp readable silhouette, centered, isolated, tile-safe ground contact,
no text, no UI, no watermark, no horizon, no perspective convergence,
no detached shadow, no copied game architecture
```

Danach folgen nur:

- Landmark- oder Prop-Identität
- Materialien
- erlaubte Akzentfarbe
- Footprint und relative Höhe
- gewünschtes Erkennungsmerkmal

### Produktionsfolge je Landmark

1. drei kleine Konzeptkandidaten mit demselben Styleboard
2. Auswahl genau eines Kandidaten
3. hochauflösende feste Perspektive
4. gegebenenfalls eine referenzgebundene Korrektur
5. Freistellung und Alpha-Bereinigung
6. Footprint- und Ankerausrichtung
7. Emissionsmaske
8. Downsample auf Liefergrößen
9. Sichtprüfung bei Desktop- und Mobile-Übersicht
10. erst danach Aufnahme in den Manifest-Stand

Keine Batch-Produktion aller 15 Landmarken vor der Freigabe von Tree, Root Home und Living Earth Institute.

## 8. Datei- und Manifestvertrag

Vorgeschlagene Struktur:

```text
docs/design/world-map-isometric/
├── canon/
├── source/
└── reviews/

public/images/world-map/isometric/
├── terrain/
├── water/
├── roads/
├── landmarks/
├── vegetation/
├── props/
├── characters/
└── vfx/

src/features/world-map/immersive/
└── spriteAssets.ts
```

Der Manifest-Eintrag enthält nur tatsächlich benötigte Felder:

- Asset-Pfad oder Atlas-Referenz
- Rechteck, falls Atlas
- Quellgröße
- Pixelanker
- Footprint
- Sort-Offset
- Alpha-Modus
- Frameanzahl
- Motion-Level
- Kamera-Contract-Version

Assets werden nur über den Manifest-Stand in die Szene aufgenommen. Generationsordner sind keine Runtime-Abhängigkeit.

## 9. Phasen und Gates

### G0 — Canon Gate

Ergebnisse:

- Kamera und Raster fest
- Styleboard und drei Tiefen freigegeben
- Licht, Material, Größen und Prompt-Grammatik dokumentiert
- UI-Verhalten mit `selectedId = null` freigegeben

Ohne G0 keine Produktionsgeneration.

### G1 — Vertical Slice

Umfang:

- Tree of Emergence
- Root Home
- Living Earth Institute
- je eine Terrainfläche pro Tiefe
- kleiner Fluss- und Küstenabschnitt
- ein Weg, eine Brücke
- sechs Vegetationsassets
- vier Props
- Auswahl, Ruhe-, Einstimmungs- und Harmonisierungszustand
- neuer rechter Detail-Drawer und mobiles Bottom Sheet

Gate:

- Stil überzeugt in der echten Route
- drei Gebäude sind ohne Label unterscheidbar
- keine sichtbaren Perspektivsprünge
- Panel öffnet und schließt korrekt
- Performance liegt innerhalb des Budgets

Erst nach G1 beginnt die Massenproduktion.

### G2 — Core World

Umfang:

- Terrain-, Wasser-, Wege- und Höhenkit
- sieben globale Center
- sieben persönliche Journey-Orte
- vollständige Landmark-Navigation
- stabile Footprints und Anker

Gate:

- alle 15 Orte sind in Übersicht und Fokus lesbar
- Wege und Wasser besitzen keine sichtbaren Nähte
- Spiellogik und Zustände entsprechen der bestehenden Version

### G3 — Living World

Umfang:

- Vegetation und Props
- optional drei Ambient-Rollen
- dekorative, Motion-Level-gesteuerte VFX
- Landmark-Icons und Minimap-Marker
- finale Klang- und Atmosphärenabstimmung

Gate:

- Welt wirkt bewohnt, aber nicht visuell überladen
- Still-Modus enthält dieselben Informationen
- keine optionale Animation blockiert Release oder Interaktion

### G4 — Release Gate

- visuelle QA Desktop und Mobil
- Accessibility- und Keyboard-QA
- Asset- und Performance-QA
- 2D-Fallback und WebGL-Fehlerpfad
- Intensitäts- und Qualitätsmodi
- saubere Ablösung der Blockoutmodelle
- `/map` lädt weiterhin keine Immersive-Assets vor dem Klick auf „Eintauchen“

## 10. Paralleler Sub-Agent-Arbeitsgraph

Maximal vier aktive Slots: Root-Integrator plus drei spezialisierte Agents.

```text
A0 Bestandsaufnahme
        ↓
A1 Kamera + Raster + Style Canon
        ↓ G0
 ┌──────────────────┬──────────────────┬─────────────────────┐
│ E1 Environment    │ L1 Landmark Trio │ R1 Renderer + UI    │
│ Slice             │ Tree/Root/Earth  │ Platzhalter/Drawer  │
 └──────────────────┴──────────────────┴─────────────────────┘
        ↓ Integration durch Root
        ↓ G1
 ┌──────────────────┬──────────────────┬─────────────────────┐
│ E2 Terrain/Wasser │ L2 Global Center │ L3 Journey-Orte     │
│ Wege/Höhen        │ sechs Restassets │ sechs Restassets    │
 └──────────────────┴──────────────────┴─────────────────────┘
        ↓ Integration durch Root
        ↓ G2
 ┌──────────────────┬──────────────────┬─────────────────────┐
│ N1 Natur + Props  │ M1 VFX/UI/Actors │ R2 Gesamtintegration│
 └──────────────────┴──────────────────┴─────────────────────┘
        ↓ G3
 ┌──────────────────┬──────────────────┬─────────────────────┐
│ Q1 Visual/A11y    │ Q2 Perf/Assets   │ Q3 Browser/Fallback │
 └──────────────────┴──────────────────┴─────────────────────┘
        ↓ G4
```

### Eigentumsregeln

- Root besitzt Kamera-Contract, Manifest, Weltlayout und Integrationsentscheidungen.
- Asset-Agents schreiben nur in getrennte Source-/Output-Unterordner.
- Asset-Agents ändern nie gleichzeitig das gemeinsame Manifest.
- UI/Renderer-Agent ändert keine generierten Bildquellen.
- Jede Welle endet mit einer sichtbaren Integration in der echten Route.
- Abgelehnte Assets werden nicht „für später“ in die Runtime aufgenommen.

### Parallelwelle 1

Agent E1:

- drei Terrainmaterialien
- kleiner Fluss-/Küstenabschnitt
- Weg und Brücke
- erster Vegetationssatz

Agent L1:

- Tree
- Root Home
- Living Earth Institute
- zugehörige Emissionsmasken

Agent R1:

- feste 2:1-Kamera
- Sprite-Verankerung und Picking
- nullable Auswahlzustand
- rechter Drawer / mobiles Bottom Sheet
- Settings-Verlagerung

Root:

- Style- und Perspektivprüfung
- Integration
- G1-Abnahme

### Parallelwelle 2

Agent E2:

- vollständiges Terrain-, Wasser-, Wege- und Höhenkit

Agent L2:

- verbleibende globale Center

Agent L3:

- verbleibende Journey-Orte

Root:

- Footprints einfrieren
- Manifestintegration
- Szenenkomposition
- G2-Abnahme

### Parallelwelle 3

Agent N1:

- Vegetationsfamilien und Props

Agent M1:

- VFX, UI-Silhouetten und optional Ambient-Figuren

Agent R2:

- Gesamtintegration, Zustände und Qualitätsstufen

Root:

- visuelle Dichte kuratieren
- Feature-Parität prüfen
- G3-Abnahme

### Parallelwelle 4

Drei unabhängige QA-Spuren:

- visuelle Qualität, Responsiveness und Accessibility
- Payload, Texturspeicher, Draw Calls und FPS
- Browser, Persistenz, Fallback, Keyboard und reduzierte Bewegung

Root behebt nur nachweisbare Probleme und führt G4 durch.

## 11. Messbare Abnahmekriterien

### Kunst

- alle 15 Landmarken sind bei Desktop-Übersicht unterscheidbar
- Kernlandmarken bleiben bei `390 px` Breite erkennbar
- Footprints liegen innerhalb eines Pixels auf dem Referenzdiamanten
- keine Alpha-Halos auf Deep Space, Pure Light oder Cyan-Testgrund
- alle Objekte teilen Perspektive und Licht
- Zustände sind auch in Graustufen unterscheidbar

### Tiles

- zufällige `10 × 10` Testflächen zeigen bei drei Zoomstufen keine Nähte oder Löcher
- keine auffällige Wiederholung identischer `2 × 2`-Blöcke
- Brücken, Flüsse und Straßen schließen geometrisch an

### Performance

- erste sichtbare 2.5D-Ladung maximal etwa `6 MB` komprimiert
- vollständige Weltkunst maximal etwa `10 MB`, Hochauflösung lazy
- dekodierte Texturen ungefähr:
  - Low: maximal `48 MB`
  - Medium: maximal `72 MB`
  - High: maximal `96 MB`
- Zielwerte:
  - ungefähr 60 FPS Desktop
  - mindestens 30 FPS auf unterstützten Mobilgeräten
- `/map` bleibt ohne R3F-/World-Atlas-Download
- bestehende Web-Vitals-Budgets bleiben bestehen

### Interaktion

- Start ohne Vorauswahl und Detailpanel
- Klick, Atlas und Landmark-Liste führen zum selben Auswahlzustand
- `X`, `Escape` und leeres Terrain schließen
- Fokuswiederherstellung funktioniert
- alle Gebäudeaktionen sind auch ohne Canvas bedienbar
- Still-Modus besitzt funktionale Gleichwertigkeit

### Kleinste notwendige Tests

- ein fokussierter Interaktionstest für Öffnen, Schließen und Fokuswiederherstellung
- ein Manifest-/Assettest für vorhandene Dateien, Dimensionen, eindeutige Keys und gültige Anker
- bestehende Game-Logic-Tests bleiben unverändert

Keine neue Testsuite und kein Bildverarbeitungs-Framework werden allein für diese Phase eingeführt.

## 12. Bewusst nicht Teil dieser V2

- frei rotierende 3D-Kamera
- ausgelieferte KI-generierte GLBs als Standard
- Kampf, Ressourcenwirtschaft oder Armeen
- Multiplayer
- ECS oder neue Game Engine
- 45 separat gerenderte Landmark-Zustände
- zusätzliche Charakterklassen
- KTX2-Pipeline ohne gemessenen Speicherbedarf
- Massengeneration vor der Vertical-Slice-Freigabe

## 13. Empfohlener nächster Ausführungsschritt

Nicht mit allen 15 Gebäuden beginnen.

Die erste Umsetzungswelle ist:

1. UI auf nullable Auswahl, schließbares rechtes Detail und Settings umstellen.
2. 2:1-Kamera- und Rastercontract in der echten Route festziehen.
3. ein gemeinsames Styleboard mit drei Tiefen erzeugen.
4. Tree, Root Home und Living Earth Institute als kohärentes Landmark-Trio produzieren.
5. einen kleinen Terrain-/Fluss-/Wege-Ausschnitt bauen.
6. alles als echte spielbare Vertical Slice integrieren und auf Desktop sowie Mobil abnehmen.

Erst wenn diese eine Bildschirmansicht wunderschön, lesbar und performant ist, wird der restliche Asset-Katalog parallel produziert.
