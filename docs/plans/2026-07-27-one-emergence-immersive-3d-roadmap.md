# One Emergence Map — Roadmap zur immersiven 3D-Echtzeitwelt

Status: am 27. Juli 2026 vollständig umgesetzt und abgenommen  
Produktziel: Eine friedliche Echtzeitstrategie über Resonanz statt Eroberung.

## 1. Nordstern

Die Karte wird zu einer lebendigen Welt, die aus einer festen
Vogelperspektive wie ein modernes RTS lesbar ist. Ihr Kernloop lautet:

**Wahrnehmen → Einstimmen → Verbinden → Kultivieren → Emergenz**

Der Fluss ist Energienetz und Interface zugleich. Spielende verteilen
begrenzte Aufmerksamkeit zwischen persönlichen Orten, globalen Centern und
dem Tree of Emergence. Es gibt zunächst keinen Kampf, keinen Zeitdruck, keine
Leaderboards und keine harte Niederlage.

## 2. Dauerhafter Produktvertrag

- `/map` bleibt die schnelle, vollständig zugängliche 2D-Übersicht.
- `/map/immersive` ist die chromefreie Vollbilderfahrung.
- Alle 15 Orte, Texte und Aktionen kommen aus demselben Weltmodell.
- Die Bedienoberfläche bleibt normales DOM außerhalb des WebGL-Canvas.
- Still-Modus, schwache Geräte und WebGL-Ausfälle behalten die vollständige
  2D-Erfahrung.
- 3D wird ausschließlich auf der immersiven Route und erst nach dem Eintritt
  lazy geladen.

## 3. Die sieben Resonanzverbindungen

| Persönlicher Ort      | Globales Center        | Wirkung                    |
| --------------------- | ---------------------- | -------------------------- |
| Root Home             | Living Earth Institute | Erdung und Regeneration    |
| Creation Temple       | House of Creation      | Kreativität und Schöpfung  |
| Solar Ark             | Energy Gardens         | Wille und Energie          |
| Heart Caravan         | Gate of Exchange       | Verbindung und Zirkulation |
| Voice Beacon          | Global Council         | Wahrheit und Koordination  |
| Observatory           | Noosphere Data Center  | Einsicht und Wissen        |
| Cosmic Control Center | Ashram Retreat         | Einheit und Stille         |

Der Tree of Emergence verbindet alle Paare und zeigt den Gesamtzustand der
Welt.

## 4. Ausbau in sechs Gates

### Gate 0 — Die Schwelle

Status: umgesetzt.

- Auf `/map` erscheint oben der CTA **Eintauchen**.
- `/map/immersive` zeigt dieselbe interaktive Karte bildschirmfüllend ohne
  Navbar, Footer oder Marketing-Chrome.
- Alle 15 Gebäude bleiben klickbar; das bestehende Detailmenü wird
  wiederverwendet.
- Ein sichtbarer Rückweg führt zur Kartenübersicht.
- Es wird weder 3D-Code installiert noch geladen.

**Abnahme:** Route, Rückweg, Landmark-Auswahl, Escape, Mobilansicht und
Tastaturbedienung funktionieren ohne Regression.

### Gate 1 — 3D-Vertical-Slice

Umfang bewusst klein: Tree of Emergence, Root Home, Living Earth Institute,
ein Flussabschnitt, Gelände und eine feste RTS-Kamera.

Erster spielbarer Loop:

1. Einen Ort auswählen.
2. Einen begrenzten Aufmerksamkeitsstrom vom Tree ausrichten.
3. Den Bedarf des Ortes beobachten.
4. Die Verbindung stabilisieren.
5. Die sichtbare Reaktion von Landschaft und Tree erleben.

Technischer Schnitt:

- Erst jetzt `three`, `@react-three/fiber`, `@react-three/drei` und
  `@types/three` hinzufügen.
- Eine kleine Client-Komponente importiert die WebGL-Szene mit
  `next/dynamic(..., { ssr: false })`.
- Die bestehende 2D-Karte bleibt Ladezustand und sofortiger Fallback.
- Orthografische Kamera, begrenztes Schwenken und Zoomen, Raycast-Auswahl und
  dieselbe DOM-Detailkarte.
- Anfangs `frameloop="demand"`; eine permanente Render-Schleife gibt es erst,
  wenn echte Echtzeitbewegung sie benötigt.
- Kein Physics-Paket, kein Postprocessing-Paket und keine neue
  State-Abstraktion.

**Abnahme:**

- Ein verständlicher Loop von etwa zehn Minuten mit mindestens einer echten
  Entscheidung.
- Auswahl und Kamera funktionieren mit Maus, Touch und Tastatur.
- Zielwerte: ungefähr 60 FPS auf Ziel-Desktop, mindestens 30 FPS auf
  Ziel-Mobile.
- 2D-Fallback und Rückweg sind jederzeit erreichbar.
- Weitere Gebäude werden erst produziert, wenn der Loop Freude und
  Orientierung erzeugt.

### Gate 2 — Die vollständige lebendige Welt

Die drei Brand-Tiefen werden zu einer zusammenhängenden Topografie:

- warmer, verwurzelter Süden;
- solarpunk-lebendige Mitte;
- kosmische Höhe im Norden.

Alle 15 Landmarken erhalten eine eindeutige Silhouette, Pick-Fläche,
Fokuslicht und drei Zustände: **ruhend**, **eingestimmt**, **harmonisiert**.
Fluss, Wege und Lichtlinien machen die Beziehungen räumlich lesbar.

**Abnahme:**

- Alle 15 Orte sind in 3D eindeutig, klickbar und über eine DOM-Liste
  erreichbar.
- Wiederholte Naturteile werden instanziert; Gebäude und Gelände nutzen
  abgestufte LODs.
- Licht ist überwiegend gebacken; mobile Qualität reduziert Schatten und
  Partikel.
- Das erste sichtbare Szenenpaket bleibt als Planungsbudget unter 6 MB.
- Die 2D-Karte dient zusätzlich als Ladebild und optionale Minimap.

### Gate 3 — Lebendige Echtzeit

Jetzt erhält die Welt Bewegung:

- Fluss- und Resonanzströme;
- Vegetation mit sparsamer Shader-Bewegung;
- wenige ambient lebende Akteure;
- Tageslicht- und Atmosphärenzustände;
- opt-in Soundscape erst nach einer Nutzergeste.

Der Render-Loop darf nun permanent laufen, wird aber bei verborgenem Tab,
Still-Modus und in ruhigen Zuständen gedrosselt oder angehalten.

**Abnahme:** Realtime-Elemente verbessern die Lesbarkeit des Weltzustands und
halten die vereinbarten Frame- und Speicherbudgets.

### Gate 4 — Friedliche RTS-Schicht

Die sieben Paare bilden eine kurze Kampagne. Nur wenige
Aufmerksamkeitsströme sind gleichzeitig aktiv. Gebäude beeinflussen
einander; unausgeglichene Entscheidungen erzeugen sichtbare Dissonanz statt
einer Niederlage.

Session-Loop:

1. Persönliche Station erwecken.
2. Zugehöriges globales Center versorgen.
3. Aufmerksamkeit neu verteilen.
4. Mehrere Verbindungen harmonisieren.
5. Den Tree in den Emergence-Zustand führen.

**Abnahme:**

- Eine abgeschlossene Partie dauert ungefähr 20–30 Minuten.
- Mindestens zwei unterschiedliche erfolgreiche Strategien sind möglich.
- Jede Umverteilung verändert Welt, Fluss und Gebäude unmittelbar.
- Fortschritt wird zunächst nur lokal gespeichert.
- Keine Platzierungsmechanik, Einheitenarmee, Kämpfe oder komplexe
  Ressourcenwirtschaft.

### Gate 5 — Göttlicher Release-Polish

- Sacred Geometry, zurückhaltende Partikel und lebendige Vegetation;
- sanftes, optionales Onboarding;
- Soundscape mit Lautstärke und Mute, niemals Autoplay;
- gespeicherte Fortsetzung;
- adaptive Qualitätsstufen und Recovery bei WebGL-Kontextverlust;
- Produktionsprofiling auf Desktop, Mobile und schwacher GPU.

**Abnahme:** Still, Balanced und Immersive sind geprüft; Canvas ist nie der
einzige Navigationsweg; ein WebGL-Fehler wechselt ohne Inhaltsverlust zu 2D.

## 5. Asset-Pipeline

1. Das bestehende Masterbild bleibt verbindliches Art-Direction-Board.
2. Eine Blender-Greybox fixiert Topografie, Koordinaten und RTS-Kamera.
3. Nur die drei Vertical-Slice-Orte werden zunächst final gestaltet.
4. Danach entstehen drei modulare Landschaftskits und die übrigen
   Landmark-Silhouetten.
5. Gemeinsame Materialien und Texturatlanten begrenzen Draw Calls; Hero-Details
   existieren nur in Fokusdistanz.
6. Produktionsexport ist GLB mit LOD0–2, Pick-Proxies, Mesh-Kompression und
   KTX2-Texturen.
7. Jeder Export erhält Größen-, glTF-, Performance- und
   Referenzbild-Prüfungen.

Generative Assets sind sinnvoll für Concept Art, Materialideen und
Silhouettenvarianten. Produktionsmodelle brauchen dennoch Retopologie,
saubere UVs, LODs, Kompression und eine Prüfung aus der echten
Kameradistanz. Deshalb werden nicht sofort 15 finale Gebäude generiert.

## 6. Zielarchitektur ab Gate 1

```text
/map/immersive (Server Route)
└── ImmersiveShell (Client, kleiner Lade- und Fallback-Rahmen)
    ├── 2D-Fallback / Ladebild
    ├── WorldHud (DOM: Orte, Details, Zurück, Qualität)
    └── dynamic 3D scene (ssr: false)
        ├── WorldScene
        ├── Terrain + River
        ├── Landmark meshes
        ├── Resonance flows
        └── RtsCameraRig
```

- Welt- und Inhaltsdaten bleiben in `src/features/world-map/landmarks.ts`.
- UI-Zustand darf eine kleine Zustand-Insel nutzen; Frame-Daten bleiben
  außerhalb von React-State.
- 3D-Dateien liegen getrennt vom jetzigen D3-Einstieg, damit `/map` keinen
  Three.js-Chunk erbt.
- Distrikt-Streaming entsteht erst, wenn reale Assetgrößen es verlangen.

## 7. Budgets und Messpunkte

Diese Werte sind Gates, keine Behauptung über den aktuellen Build:

| Bereich            | Budget                                                                  |
| ------------------ | ----------------------------------------------------------------------- |
| Bestehende `/map`  | bestehendes LCP < 2,5 s, CLS < 0,1, INP < 200 ms bewahren               |
| Einstieg           | kein 3D-Download vor Klick auf „Eintauchen“                             |
| Erstes Szenenpaket | Ziel < 6 MB komprimiert                                                 |
| Desktop            | Ziel ~60 FPS im Vertical-Slice                                          |
| Mobile             | Mindestziel 30 FPS auf definiertem Referenzgerät                        |
| Qualität           | Low, Medium, High; automatisch startend, manuell änderbar               |
| Kontrolle          | Draw Calls, Dreiecke, Texturen und GPU-Speicher je Referenzszene messen |

## 8. Zugänglichkeit und Rückfallebene

- Fokus, Enter, Escape und Landmark-Navigation funktionieren ohne Canvas.
- Kamera besitzt Buttons und Tastaturalternativen; nichts ist nur per Drag
  erreichbar.
- Fokusmarkierung und ausgewähltes Gebäude bleiben kontraststark.
- `prefers-reduced-motion` und Still-Modus entfernen Kamera-Easing, Partikel
  und Sacred Motion.
- Ladefehler, fehlendes WebGL 2 und Kontextverlust zeigen die vollständige
  2D-Karte.
- Audio startet ausschließlich nach ausdrücklicher Aktivierung.

## 9. Teststrategie

- Playwright: Eintritt, Rückweg, alle 15 Orte, Menü, Escape, Mobilansicht,
  Tastatur und 2D-Fallback.
- Visual Regression: drei Brand-Tiefen, Fokuszustände und Qualitätsstufen.
- Performance-Capture: definierte Kamerawege statt zufälliger Messungen.
- 3D-Asset-Check: Dateigröße, fehlende Texturen, LOD-Namen und glTF-Validität.
- WebGL-Kontextverlust wird vor Release absichtlich simuliert.

## 10. Unmittelbar nächster Sprint

1. Phase 0 mit Browser-, Build- und Accessibility-Prüfung abnehmen.
2. Greybox der Welt und feste orthografische RTS-Kamera in Blender erstellen.
3. Tree, Root Home und Living Earth Institute als Low-Poly-Proxies exportieren.
4. Erst dann den kleinen R3F-Stack installieren und die Dynamic-Boundary
   bauen.
5. Auswahl, Kamera und einen Resonanzstrom als vollständigen Loop testen.
6. Fun-Gate durchführen; nur bei positivem Ergebnis Gate 2 starten.

Bewusst vertagt: Multiplayer, Live-Feld, Server-Saves, KI-Bewohner, Markt,
Physik, komplexes Audio und finale Assets für alle Orte. Sie werden erst
hinzugefügt, wenn der lokale Vertical-Slice ihren Bedarf beweist.

## Technische Grundlagen

- [Next.js: Lazy Loading](https://nextjs.org/docs/app/guides/lazy-loading)
- [React Three Fiber: Performance Scaling](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
- [React Three Fiber: Canvas](https://r3f.docs.pmnd.rs/api/canvas)
- [Three.js: glTF-Workflow](https://threejs.org/manual/en/loading-3d-models.html)
- [Three.js: KTX2Loader](https://threejs.org/docs/pages/KTX2Loader.html)
- [Three.js: Ressourcen freigeben](https://threejs.org/manual/en/how-to-dispose-of-objects.html)
