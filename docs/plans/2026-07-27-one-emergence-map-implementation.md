# One Emergence Map — Implementierungsplan

Status: Ready for implementation  
Gewählte Richtung: **B — River of Emergence**  
Datum: 2026-07-27

## 1. Zielbild

`/map` wird eine öffentliche, interaktive 2.5D-Weltkarte in isometrischer
Vogelperspektive. Ein Fluss führt vom warmen Süden durch die lebendige Mitte
bis in die kosmischen Berge im Norden.

Der **Tree of Emergence** steht auf einer zentralen Flussinsel. Die sieben
globalen Center liegen in klar getrennten Seitentälern. Die sieben persönlichen
Orte bilden einen zusammenhängenden Weg vom Root Home zum Cosmic Control
Center.

Die Seite ist eine narrative Weltkarte, kein Aufbauspiel.

## 2. Festgelegte Designentscheidung

Variante B bleibt die geografische Grundlage:

- ein zusammenhängendes, bewohntes Land statt einzelner Level-Inseln;
- ein natürlicher Süd-Nord-Verlauf für die sieben persönlichen Orte;
- der Fluss als sichtbare Verbindung von Leben, Wissen und Infrastruktur;
- warme Tiefe im Süden, solarpunk-lebendige Mitte, kosmische Höhe im Norden.

Aus den anderen Entwürfen werden nur zwei Eigenschaften übernommen:

- aus A: der Tree of Emergence wird etwa 20 % größer und eindeutiger;
- aus C: jedes globale Center erhält eine klarere, eigene Silhouette.

## 3. Produktionsasset

### Benötigte Dateien

```text
public/images/world-map/
├── world-map-river-master.png
└── world-map-og.jpg
```

`world-map-river-master.png` ist die einzige neue Szenenillustration. Die Seite
liefert sie über `next/image` responsiv als AVIF/WebP aus.

`world-map-og.jpg` ist ein 1200 × 630 Crop derselben Illustration. Er wird nicht
separat komponiert.

### Synthese-Prompt

```text
Use case: stylized-concept
Asset type: production master illustration for the interactive One Emergence
website world map
Input images: use Variant B — River of Emergence as the geographic foundation;
use Variant A only for the stronger central-tree scale; use Variant C only for
the clearer institutional silhouettes. Create a new synthesis, not a collage.

Primary request: a premium modern real-time-strategy world map in a consistent
isometric bird's-eye view. A long living river valley flows from a warm Root
Home in the deep south toward a mountain Observatory and a hovering Cosmic
Control Center in the far north. The enormous Tree of Emergence grows on a
central river island and is roughly twenty percent larger than in Variant B.

Seven large global centers occupy distinct side valleys with generous empty
space around each silhouette: an open circular Council of Earth, an organic
Noosphere Brain & Data Center, a terraced mountain-forest Ashram, regenerative
wind-and-solar gardens, a Living Earth greenhouse institute, an open House of
Creation, and a solar sea-and-air Gate of Exchange at the southern delta.

All seven smaller personal landmarks must be individually recognizable along
one uninterrupted south-to-north pilgrimage: Root Home, Temple of Creation,
Solar Ark, Heart Caravan, Voice Beacon, Observatory of Mind, and Cosmic Control
Center.

Style/medium: painterly cinematic game environment concept art, premium RTS key
art, sophisticated solarpunk mysticism, inhabited organic architecture
integrated with terrain.

Composition/framing: wide 16:9 full-map composition, true isometric top-down
view around 35 degrees, no horizon or sky band. Keep the full landmass inside
the frame. Preserve calm negative space around all fifteen interactive
landmarks. The river is the main organizing line, not a radial diagram.

Lighting/mood: warm amber south, living green and solar gold around the central
tree, cyan infrastructure along the river, violet cosmic highlands in the
north, deep-space void beyond the continent. Hopeful and non-militaristic.

Materials/textures: living wood, stone, water, glass, greenery, subtle sacred
geometry, restrained futuristic detail.

Constraints: no text, letters, labels, logos, watermark, interface, marker
rings, borders, baked-in network lines, armies, weapons, roads shaped like UI,
dystopia, duplicated buildings, horizon, or mixed camera angles.
```

### Asset-Abnahme

Der Synthese-Entwurf wird nur akzeptiert, wenn:

1. alle 15 Orte bei 1600 × 900 px noch unterscheidbar sind;
2. der Tree of Emergence ohne Marker der erste Blickpunkt ist;
3. der persönliche Weg visuell von Süden nach Norden lesbar ist;
4. kein Center von Baum, Bergen oder einem anderen Gebäude verdeckt wird;
5. um jeden Ort genug ruhige Fläche für einen 64-px-Hotspot bleibt;
6. keine Beschriftung oder UI in das Bild eingebrannt ist.

Wenn nur ein einzelner Ort unklar ist, wird gezielt dieser Bereich korrigiert.
Es wird keine weitere allgemeine Konzeptserie erzeugt.

## 4. Kartenkoordinaten

Die aktuellen Werte in `landmarks.ts` bleiben Platzhalter, bis das Master-Asset
freigegeben ist.

Nach der Freigabe wird das Bild auf das bestehende logische Raster
`1600 × 900` gelegt. Für jeden Ort werden Mittelpunktkoordinaten als Prozentwert
gemessen:

```ts
{ id: "tree", x: 50.2, y: 49.4 }
```

Zielzonen:

| Bereich | Persönliche Orte | Globale Center |
|---|---|---|
| Norden | Observatory, Cosmic Control | Ashram, Energy Gardens |
| Mitte | Heart Caravan, Voice Beacon | Council, Noosphere, Tree |
| Süden | Root Home, Creation Temple, Solar Ark | House of Creation, Living Earth, Gate of Exchange |

Die Reihenfolge der persönlichen Orte kommt ausschließlich aus `step`. Sie
bleibt unabhängig von der visuellen x-Position stabil.

## 5. Technische Umsetzung

### Bestehendes bleibt

- Route `src/app/(marketing)/map/page.tsx`
- Feature `src/features/world-map/`
- D3-Pan/Zoom
- typisierte Landmark-Daten
- Layer-Toggles
- Detailpanel
- i18n DE/EN
- lineares Ortsverzeichnis
- Sitemap-Eintrag

### Änderungen

#### `WorldMap.tsx`

1. `MapTerrain` durch `next/image` mit dem Master-Asset ersetzen.
2. Das Bild innerhalb derselben transformierten `1600 × 900`-Fläche rendern.
3. Die SVG-Ebene darüber behalten, aber auf zwei Funktionen reduzieren:
   - cyanfarbene Center-Verbindungen zum Tree;
   - violett-goldener Journey-Pfad zwischen den sieben persönlichen Orten.
4. Hotspots von 56 auf 64 logische Pixel erhöhen. Bei der minimalen Skalierung
   bleiben sie damit über dem WCAG-2.2-Ziel von 24 CSS-Pixeln.
5. Mobile Details als fixes Bottom Sheet anzeigen; Desktop behält das rechte
   Panel.
6. `Escape` schließt das Detailpanel.
7. Ausgewählte Landmarke, Layer und Zoom bleiben rein lokal. Keine URL- oder
   Datenbankpersistenz in v1.

#### `landmarks.ts`

- finale x/y-Koordinaten eintragen;
- bestehende IDs, Layer, Schritte und Links beibehalten;
- kein neues Schema und keine neue Abstraktion.

#### Navigation und Metadaten

- `/map` als `nav.map` zwischen Manifest und Erfahrungen ergänzen;
- `/map` im Footer unter „Erkunden“ ergänzen;
- Open-Graph-Metadaten auf `world-map-og.jpg` setzen;
- Sitemap ist bereits vorbereitet.

#### Ortsverzeichnis

Die 15 gleichwertigen Karten werden zu drei semantischen Gruppen:

1. Tree of Emergence;
2. Seven Centers;
3. Journey Home.

Das reduziert visuelle Dichte und macht die Screenreader-Reihenfolge verständlich.

## 6. Motion

| Level | Umsetzung |
|---|---|
| Micro | Marker-Fokus, Hover und Ebenenschalter |
| Flow | Detailpanel, Bottom Sheet und programmatischer Landmark-Fokus |
| Sacred | langsamer Tree-Halo und Bewegung entlang des ausgewählten Pfades |
| Event | in v1 nicht verwendet |

Pan und Zoom bleiben in allen Intensitätsmodi bedienbar, weil sie Navigation
und keine dekorative Animation sind.

Die Sacred-Ebene animiert nur SVG-Overlays. Das große Rasterbild selbst wird
nicht zeitbasiert bewegt oder gefiltert.

## 7. Mobile

- Kartenfenster: mindestens `34rem` hoch.
- Startansicht: Tree und mittlerer Flussbereich, nicht die gesamte Karte.
- „Ganze Karte zeigen“ bleibt verfügbar.
- Detailansicht: fixes Bottom Sheet mit maximal 70 % Viewporthöhe.
- Sheet, Ebenenschalter und Zoom-Kontrollen dürfen sich nicht überdecken.
- Das Ortsverzeichnis bleibt vollständig unterhalb der Karte.

Keine separate Hochformat-Illustration: Mobile nutzt dieselbe Karte und andere
Kamerakoordinaten.

## 8. Performance

- keine neue Dependency;
- kein Canvas, WebGL oder Three.js;
- Master-Asset über `next/image` mit `priority`, korrektem `sizes` und festen
  Dimensionen;
- Zielgröße der ausgelieferten Variante:
  - Mobile ≤ 250 KB;
  - Desktop ≤ 600 KB;
- keine Ambient-PNGs oder transparenten Partikelbilder in v1;
- SVG-Verbindungen enthalten höchstens 14 Pfade;
- D3 bleibt lazy im bestehenden Client-Chunk der Karte.

## 9. Barrierefreiheit

- alle Hotspots bleiben echte `<button>`-Elemente;
- sichtbarer Fokus mit mindestens 3:1 Kontrast;
- Layer-Schalter verwenden `aria-pressed`;
- Kartenregion besitzt einen zugänglichen Namen;
- Farbe ist nicht die einzige Kategorieinformation;
- Ortsverzeichnis bietet alle Inhalte ohne Pan, Zoom oder räumliche
  Interpretation;
- Panel wird mit `Escape` geschlossen;
- alle drei Intensitätsmodi werden separat geprüft;
- Still enthält keine Sacred- oder Flow-Animation, aber alle Funktionen.

## 10. Tests

### Statisch

```text
pnpm lint
pnpm typecheck
pnpm build
```

### Playwright

Der bestehende `world-map.spec.ts` wird erweitert:

1. Route antwortet erfolgreich.
2. Alle 15 Orte existieren auf Karte und im Verzeichnis.
3. Layer lassen sich ein- und ausblenden.
4. Auswahl öffnet die richtige Beschreibung.
5. Escape schließt das Panel.
6. Vorheriger/Nächster navigiert korrekt durch die sieben Journey-Orte.
7. Mobile hat keinen horizontalen Seiten-Overflow.
8. Still rendert keine Sacred-Animation.

### Visuelle Abnahme

Screenshots:

- Desktop 1440 × 1000;
- Mobile 390 × 844;
- Still, Balanced und Immersive;
- Karte vollständig;
- Tree ausgewählt;
- Cosmic Control Center ausgewählt;
- beide Ebenen einzeln.

## 11. Reihenfolge

### Schritt 1 — Synthese und Koordinaten

- B-Synthese erzeugen;
- sechs Asset-Kriterien prüfen;
- Master und OG-Crop ablegen;
- finale 15 Hotspot-Koordinaten messen.

**Fertig, wenn:** Asset und Koordinaten unverändert in den Seitenbau gehen
können.

### Schritt 2 — Visuelle Integration

- Platzhalter-SVG durch Master-Asset ersetzen;
- Pfade und Hotspots auf neue Koordinaten setzen;
- Panel und Ebenen gegen das finale Bild kalibrieren.

**Fertig, wenn:** Desktop alle Orte eindeutig und ohne Marker-Verwechslung
zeigt.

### Schritt 3 — Mobile und Motion

- Bottom Sheet;
- mobile Startkamera;
- Micro-, Flow- und Sacred-Gating;
- Escape und Fokusverhalten.

**Fertig, wenn:** Karte auf 390 px Breite vollständig bedienbar ist.

### Schritt 4 — Discoverability und Abnahme

- Navigation, Footer und OG-Metadaten;
- i18n-Texte final lesen;
- Tests, Screenshots und Performance-Prüfung;
- `impeccable` Kritik/Polish auf dem finalen Ergebnis.

**Fertig, wenn:** alle Definition-of-Done-Punkte erfüllt sind.

## 12. Definition of Done

- [ ] Variante B ist als finales Master-Asset integriert.
- [ ] Alle 15 Orte sind visuell und per Tastatur erreichbar.
- [ ] Die sieben persönlichen Orte bilden eine verständliche Reihenfolge.
- [ ] Desktop-Panel und mobiles Bottom Sheet funktionieren.
- [ ] Still, Balanced und Immersive verhalten sich korrekt.
- [ ] Navigation, Footer, Sitemap und OG-Metadaten führen zur Karte.
- [ ] Kein neues Paket und keine Datenbankänderung.
- [ ] `lint`, `typecheck`, `build` und World-Map-Playwright-Tests sind grün.
- [ ] LCP < 2,5 s, CLS < 0,1 und INP < 200 ms.

## 13. Bewusst nicht in v1

- 3D-Gelände oder frei drehbare Kamera;
- laufender Avatar;
- Ressourcen, Bauzeiten oder RTS-Spielmechanik;
- persönliche Fortschrittsspeicherung;
- editierbare Center;
- Tag/Nacht-System;
- Soundscape;
- Live-Community-Signale;
- Datenbank- oder Portal-Kopplung.

Diese Erweiterungen beginnen erst, wenn die statische narrative Karte im echten
Gebrauch trägt.

