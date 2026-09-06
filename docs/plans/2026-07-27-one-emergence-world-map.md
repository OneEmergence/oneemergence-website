# One Emergence World Map

Status: Konzept und Umsetzungsplan  
Datum: 2026-07-27

## Fortschritt

- [x] Phase A: typisierte Landmarken, interaktiver Karten-Wireframe und
      zugängliches Ortsverzeichnis unter `/map`
- [x] Phase B, Kompositionsstudien:
      [A–C ansehen](../design/one-emergence-map/README.md)
- [x] Variante B — River of Emergence als Grundlage ausgewählt
- [ ] Synthese-Entwurf nach
      [Implementierungsplan](./2026-07-27-one-emergence-map-implementation.md)
- [ ] Produktionsassets und visuelle Integration
- [ ] finale A11y-, Performance- und Browser-Abnahme

## 1. Produktentscheidung

Die neue Karte wird eine eigene öffentliche Seite unter `/map`.

Sie ersetzt **nicht** die bestehende `/inner/map`: Dort liegt bereits die
persönliche Consciousness Map als D3-Graph aus Journal-Themen, Einsichten und
Verbindungen. Die neue World Map macht dagegen die kollektive One-Emergence-
Vision als begehbare Welt sichtbar.

**Einziger Job der Seite:** Aus der abstrakten Vision einen Ort machen, den
Menschen erkunden und in Erinnerung behalten.

Die erste Version ist kein Aufbauspiel. Sie übernimmt die visuelle Grammatik
eines modernen RTS — Vogelperspektive, klare Landmarken, Wege, Bezirke,
Zoom und Pan — bleibt aber eine ruhige, narrative Exploration.

## 2. Designrichtung

### Motiv

Eine solarpunk-mystische Welt in isometrischer Vogelperspektive. Eine Insel
oder ein zusammenhängender Kontinent schwebt im Deep Space. Natur, Technologie
und sakrale Architektur sind nicht getrennt: Datenzentren wachsen wie
Nervengewebe, Energieanlagen wie Gärten und Regierungsarchitektur wie ein
offener Kreis.

Die Karte führt visuell durch die drei Brand-Tiefen:

- außen und in der Höhe: kosmisch;
- in den Städten und regenerativen Systemen: solarpunk;
- am zentralen Baum und den persönlichen Orten: warm und bewohnt.

### Signatur

Der **Tree of Emergence** steht im Zentrum. Seine sichtbaren Lichtwurzeln
verbinden alle globalen Center; eine zweite, spiralförmige Route verbindet die
sieben persönlichen Orte. Beim Auswählen eines Ortes leuchtet nicht nur ein
Marker, sondern sein Weg zum Baum auf.

Das ist das eine prägende visuelle Motiv. Zusätzliche Dekoration bleibt leise.

### Bestehende Brand-Tokens

| Rolle | Token | Wert |
|---|---|---|
| Raum | `oe-deep-space` | `#0A0F1F` |
| Bewusstsein | `oe-aurora-violet` | `#7C5CFF` |
| Lebenskraft | `oe-solar-gold` | `#F6C453` |
| Netzwerk | `oe-spirit-cyan` | `#54E2E9` |
| Regeneration | `oe-living-green` | `#6EDB8F` |
| Nähe | `oe-warm-sand` | `#E8C9A8` |

Cormorant bleibt die Stimme für Namen und Kapitel. Inter trägt Bedienung,
Beschreibungen und Kartenlegende. Es werden keine neuen Farben oder Schriften
eingeführt.

## 3. Weltaufbau

Die Welt besteht aus drei gleichzeitig lesbaren Ebenen:

1. **The Living Field** — Gelände, Flüsse, Wälder, Küste, Berge und Energie.
2. **The Seven Centers** — kollektive Institutionen einer möglichen Zukunft.
3. **The Journey Home** — sieben persönliche Landmarken, abgeleitet aus dem
   Chakra-Motiv des Referenzbildes.

### Zentrum

#### Tree of Emergence

Der große Lebensbaum ist Ursprung, Treffpunkt und visuelle Navigation. Im
Stamm liegt ein warmer, tempelartiger Innenraum. In der Krone erscheint eine
goldene geometrische Sphäre; die Wurzeln werden zu Wegen, Wasserläufen und
Lichtleitungen.

### Die sieben globalen Center

| Center | Bildidee | Funktion in der Welt |
|---|---|---|
| **Council of Earth** | offenes, kreisförmiges Regierungsgebäude ohne monumentale Front | globale Zusammenarbeit, Mediation, Gemeingüter und transparente Entscheidungen |
| **Noosphere Brain & Data Center** | halb unterirdische, organische Kuppeln mit cyanfarbenem Neuralnetz | souveränes Wissen, Forschung, AI und die Akashic Records |
| **Ashram of Stillness** | terrassierter Rückzugsort im Bergwald mit Wasserhöfen | Retreats, Meditation, Heilung und bewusste Integration |
| **Regenerative Energy Gardens** | Windblüten, Solarsegler und leuchtende Speicher in einer Landschaft | dezentrale Energie, Kreisläufe und technologische Regeneration |
| **Living Earth Institute** | Gewächshaus-Inseln, Saatgutarchiv, Wasser- und Myzelgärten | Biodiversität, Nahrung, Wasser und planetare Fürsorge |
| **House of Creation** | offene Werkstätten, Bühne, Medienlabor und Kunsthöfe | Kunst, Bildung, Erfindung, Musik und kulturelle Transmission |
| **Gate of Exchange** | solarbetriebener Luft-, See- und Landhafen | Reisen, Austausch, Versorgung und Verbindung zwischen Welten |

Die Center sind keine sieben Chakra-Gebäude. Sie bilden die kollektive
Zivilisation. Die persönliche Siebenerfolge bleibt als eigene, bewusst
umschaltbare Ebene erhalten.

### Die sieben persönlichen Orte

| Stufe | Landmarke | Motiv aus der Vorlage | Bedeutung |
|---|---|---|---|
| 1 · Muladhara | **Root Home** | warmes Zuhause in den Wurzeln eines Baums | Sicherheit, Erdung, Vertrauen |
| 2 · Svadhisthana | **Temple of Creation** | organischer Tempel an einer Wüstenoase | Kreativität, Leidenschaft, Fluss |
| 3 · Manipura | **Solar Ark** | Segelschiff mit Solarsegeln | Kraft, Wille, Selbstführung |
| 4 · Anahata | **Heart Caravan** | begrüntes mobiles Zuhause | Liebe, Mitgefühl, Heimat in sich |
| 5 · Vishuddha | **Voice Beacon** | Wind- und Kommunikationsturm | Ausdruck, Wahrheit, Verbindung |
| 6 · Ajna | **Observatory of Mind** | Observatorium auf einem Berg | Intuition, Klarheit, innere Führung |
| 7 · Sahasrara | **Cosmic Control Center** | schwebendes Sternenschiff | Einheit, Bewusstsein, Verbundenheit |

Die sieben Orte liegen nicht in einer geraden Chakra-Leiter. Ein leuchtender
Pilgerpfad zieht sich vom Root Home im warmen Süden spiralförmig über Wasser,
Wald und Berge bis zum schwebenden Cosmic Control Center im Norden. Dadurch
funktioniert das Motiv in einer echten Vogelperspektive.

### Vorgeschlagene Komposition

```text
                         [7 Cosmic Control Center]
                                  ✦
                [6 Observatory]       [Energy Gardens]
                       ╲                    ╱
        [Ashram] ───────╲── [Council] ────╱
             ╲            [TREE]        [Voice Beacon · 5]
              ╲       [Heart Caravan · 4]      [Brain/Data]
      [Gate / Harbor]       ╲                 ╱
          [Solar Ark · 3]   [House of Creation]──[Living Earth]
                              ╲          ╱
                         [Temple · 2]
                              │
                         [Root Home · 1]
```

Die Lage ist zunächst ein Art-Direction-Raster. Die exakten Hotspot-Koordinaten
werden erst auf der finalen Master-Illustration festgelegt.

## 4. Seitenerlebnis

### Einstieg

Die Seite öffnet fast ohne klassische Hero-Sektion direkt auf die Karte. Eine
kleine Wortmarke, der Titel „One Emergence Map“ und ein Satz erklären den Ort.
Der Tree of Emergence ist bereits sichtbar; es gibt keinen Intro-Screen, den
man wegklicken muss.

### Kartensteuerung

- Ziehen zum Verschieben, Mausrad/Pinch zum Zoomen.
- Sichtbare `+`, `−` und „Zentrieren“-Buttons für Maus, Touch und Tastatur.
- Zwei Ebenenschalter: **Seven Centers** und **Journey Home**.
- Auswahl per Marker, Gebäudefläche, Tastatur oder Ortsverzeichnis.
- Ein ruhiges Seitenpanel zeigt Name, Funktion, Symbolik und eine passende
  bestehende Zielseite, sofern es bereits eine gibt.
- „Vorheriger/Nächster Ort“ macht die persönliche Siebenerreise ohne komplexen
  Journey-State erlebbar.

### Kartenpanel

Das Panel enthält nur:

1. Name und Kategorie;
2. zwei bis vier Sätze Bedeutung;
3. bei persönlichen Orten den Chakra-Bezug;
4. eine reale nächste Aktion, wenn eine passende Route existiert.

Keine erfundenen „Coming soon“-Buttons und keine Ressourcen-, Bau- oder
Gamification-Anzeigen.

### Responsive Verhalten

Desktop zeigt Karte und rechtes Panel gleichzeitig. Auf Mobile bleibt die Karte
vollflächig pannbar; Details erscheinen als Bottom Sheet. Zusätzlich gibt es
unterhalb der Karte ein semantisches Ortsverzeichnis. So bleibt kein Inhalt von
präzisem Tippen oder räumlicher Wahrnehmung abhängig.

## 5. Motion und Zugänglichkeit

| Ebene | Anwendung |
|---|---|
| Micro | Marker-Hover, Fokus, Button-Feedback |
| Flow | Pan/Zoom, Panel und Ebenenwechsel |
| Sacred | langsamer Puls des Baums, Licht in Wurzeln und Pilgerpfad |
| Event | einmaliges Herauszoomen vom Baum auf die Welt |

Alle Ebenen werden über `useMotionLevel()` gesteuert.

- **Still:** statisches Kartenbild, Marker, Zoom-Steuerung und vollständiges
  Ortsverzeichnis; keine Ambient-Bewegung.
- **Balanced:** Panel- und Kartenübergänge plus sehr zurückhaltender Sacred
  Pulse.
- **Immersive:** zusätzliche Wolken, Lichtflüsse und einmalige
  Kamera-Enthüllung.

Hotspots sind echte Buttons mit Namen, Kategorie und sichtbarem Fokus. Farbe
ist nie die einzige Unterscheidung. Das Ortsverzeichnis bildet die vollständige
lineare Screenreader-Alternative.

## 6. Asset-Strategie

Ja, für die gewünschte Qualität müssen eigene Assets generiert werden. Für v1
brauchen wir jedoch **keine vierzehn unabhängigen 3D-Modelle oder Sprites**.

### Benötigt

1. **Eine Master-Illustration** ohne Beschriftung: isometrische Weltkarte,
   16:9, 3200 × 1800 px, mit Tree, sieben Centern und sieben persönlichen
   Landmarken.
2. **Eine saubere Terrain-Version** derselben Komposition ohne Lichtlinien,
   damit Verbindungen als scharfes SVG-Overlay gerendert werden können.
3. **Zwei transparente Ambient-Layer:** weiche Wolken/Nebel und wenige
   Lichtpartikel; nur für Immersive.
4. **Ein Social-/OG-Crop** der Master-Illustration.

Next/Image erzeugt daraus die benötigten responsiven AVIF/WebP-Varianten.
Beschriftungen, Marker, Fokuszustände und Verbindungslinien bleiben HTML/SVG
und werden nicht in das Bild eingebrannt.

### Generationsbrief

- Kamera: konsistente isometrische Vogelperspektive, keine Horizontlinie.
- Stil: modernes premium RTS-Key-Art, solarpunk-mystisch, bewohnt statt
  militaristisch.
- Licht: warmes Zentrum, cyanfarbene Infrastruktur, violette kosmische Höhe.
- Material: Holz, Stein, Glas, lebende Pflanzen, dezente sakrale Geometrie.
- Lesbarkeit: klare Silhouetten und Freiraum um jede Landmarke.
- Vermeiden: Text im Bild, UI-Elemente, Logos, Waffen, Armeen, dystopische
  Megacity, überfüllte Sci-Fi-Kleinteile und unterschiedliche Kamerawinkel.

Zuerst werden drei kleine Kompositionsvarianten erzeugt. Erst nach Auswahl
wird die Master-Illustration in hoher Auflösung erstellt. Das verhindert, dass
teure Detailarbeit auf einem ungeprüften Layout landet.

## 7. Technische Umsetzung

### Architektur

- Route: `src/app/(marketing)/map/page.tsx`
- Feature: `src/features/world-map/`
- Server Component für Seite und statische Inhalte.
- Kleine Client-Insel für Pan, Zoom, Auswahl und Panel.
- Statische, typisierte Landmark-Daten; keine Datenbank und kein Zod-Schema,
  weil es in v1 keine externe Eingabe gibt.
- `d3-zoom` und `d3-selection` werden wiederverwendet; beide sind bereits für
  `/inner/map` installiert.
- `framer-motion` nur für Panel und freigegebene Motion-Level.
- Alle UI-Texte in `src/i18n/messages/{de,en}.json`.
- Keine neue Dependency, kein Canvas und kein WebGL in v1.

### Minimale Dateien

```text
src/app/(marketing)/map/page.tsx
src/features/world-map/
├── components/WorldMap.tsx
├── landmarks.ts
└── index.ts
src/i18n/messages/de.json
src/i18n/messages/en.json
public/images/world-map/*
tests/smoke/world-map.spec.ts
```

Die Landmark-Daten enthalten ID, Kategorie, Kartenkoordinate, Titel-Key,
Beschreibung-Key, optionalen Chakra-Key und optional eine bestehende Route.

## 8. Umsetzungsphasen

### Phase A — Inhalt und Wireframe

- finale Namen und Kurztexte der 15 Orte festlegen;
- Kartenraster mit Platzhaltern bauen;
- Desktop- und Mobile-Navigation mit Tastatur prüfen.

**Ergebnis:** benutzbarer grauer Prototyp ohne finale Kunst.

### Phase B — Art Direction und Asset-Generierung

- drei Kompositionsvarianten erzeugen;
- eine Variante auf Silhouetten, Abstände und Hotspot-Flächen prüfen;
- Master-, Terrain-, Ambient- und OG-Assets erstellen und optimieren.

**Ergebnis:** freigegebenes Asset-Paket mit stabilen Landmark-Koordinaten.

### Phase C — Seitenbau

- öffentliche Route und Feature-Modul anlegen;
- responsive Karte, Pan/Zoom, Layer-Toggles und Detailpanel implementieren;
- deutsche und englische Texte einbinden;
- Navigation/Sitemap um `/map` ergänzen.

**Ergebnis:** vollständige World Map ohne optionale Personalisierung.

### Phase D — Motion, A11y und Performance

- Motion-Level korrekt gaten;
- Tastatur, Screenreader, Fokus und Touch testen;
- Bildgrößen, LCP und Client-Bundle prüfen;
- Playwright-Smoke-, Mobile- und A11y-Check ergänzen.

**Abnahme:** LCP < 2,5 s, CLS < 0,1, INP < 200 ms; jede Landmarke ist ohne
Maus und ohne Bewegung erreichbar.

### Später, nur bei echtem Bedarf

- persönliche Fortschrittsmarkierungen aus dem Portal;
- Übergang von einem World-Map-Ort zur privaten Consciousness Map;
- WebGL-Höhen, Tag/Nacht oder frei laufender Avatar;
- editierbare Gebäude und Community-Live-Signale.

Diese Punkte gehören nicht in v1, weil die narrative Karte ihre Wirkung ohne
Spielsystem, 3D-Engine oder neue Datenmodelle bereits vollständig zeigen kann.
