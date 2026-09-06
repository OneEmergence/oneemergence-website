---
target: One Emergence Gate-1 3D Vertical Slice
total_score: 29
p0_count: 0
p1_count: 4
timestamp: 2026-07-27T21-22-29Z
slug: src-features-world-map-immersive
---
Method: dual-agent (A: gate1_visual_assets · B: impeccable_detector_assessment)

## Design Health Score

| # | Heuristik | Score | Kernbefund |
| --- | --- | ---: | --- |
| 1 | Sichtbarkeit des Systemstatus | 3 | Aufmerksamkeit, Resonanz, Kohärenz und Locks sind sichtbar. |
| 2 | Übereinstimmung mit der realen Welt | 3 | Der Lichtstrom trägt die friedliche RTS-Metapher; einige Begriffe brauchen noch Erfahrung. |
| 3 | Kontrolle und Freiheit | 3 | Rückweg, 2D-Wechsel, Lösen und Reset sind vorhanden. |
| 4 | Konsistenz und Standards | 3 | Brand-Tokens, Lucide-Icons und DOM-Aktionen sind konsistent. |
| 5 | Fehlervermeidung | 3 | Kapazitäten, Locks und Stabilisierung werden vorbeugend deaktiviert. |
| 6 | Wiedererkennen statt Erinnern | 3 | Die Kernaktionen sind sichtbar; die Kamera-Shortcuts stehen nur im Accessibility-Hinweis. |
| 7 | Flexibilität und Effizienz | 3 | Maus, Touch, Tastatur und DOM-Alternative sind vorgesehen. |
| 8 | Ästhetik und Minimalismus | 2 | Die Komposition war noch von prozeduralen Blockout-Formen und dominantem HUD geprägt. |
| 9 | Fehlererkennung und Recovery | 3 | 2D-Fallback und Retry existieren, der Fortschritt bleibt erhalten. |
| 10 | Hilfe und Dokumentation | 3 | Inline-Hinweise erklären den Loop, aber es gibt noch keine geführte erste Minute. |
| **Gesamt** |  | **29/40** | **Gute Flagship-Basis mit klaren P1-Polish-Punkten** |

## Anti-Patterns Verdict

Die Oberfläche wirkt nicht wie ein generisches Dashboard: Welt, Fluss und
Resonanz sind ein eigenes Interaktionsmotiv. Der größte AI-Slop-Risikofaktor
war nicht das DOM-UI, sondern die noch generischen Low-Poly-Formen im
prozeduralen Blockout.

Der deterministische Detector lief über sieben immersive Quelldateien und
meldete `0` Findings (`[]`). Es gab keine Regeln, Fundstellen oder
Falschpositive. Eine zuverlässige sichtbare Detector-Overlay-Injektion war
wegen instabiler CDP-Sessions nicht verfügbar; die eskalierte Headless-Session
bestätigte jedoch den fertigen 3D-Zustand, Root-Auswahl und die erste
Aufmerksamkeitsaktion.

## Gesamtwirkung

Die Idee trägt: ein ruhiges strategisches Heiligtum statt militärischer
Eroberung. Der entscheidende Hebel ist, dass Landschaft, Kamera und Tree die
emotionale Führung übernehmen und das HUD nur die Regeln erklärt.

## Was funktioniert

- Die WebGL-Welt besitzt eine vollständige DOM-Alternative und verliert bei
  2D-Wechsel oder Context-Loss keinen Spielzustand.
- Die Brand-Palette wird zentral aus den bestehenden CSS-Tokens gelesen; es
  entstand kein zweites Farbsystem.
- Aufmerksamkeit ist eine echte begrenzte Entscheidung mit sichtbarer,
  reversibler Wirkung statt dekorativer Animation.

## Priorisierte Befunde

### [P1] Der Fluss liest sich als technischer Schlauch

Runde Tube-Geometrien schwächen das landschaftliche Signaturmotiv. Das Wasser
braucht ein flaches Ribbon, ein dunkles Bett und eine glaubwürdige Absenkung im
Terrain.

### [P1] Die Startkamera verliert die Dreierkomposition

Der gleiche Zoom auf Desktop und Portrait sowie der automatische erste
Tree-Fokus schneiden Root Home beziehungsweise Living Earth Institute ab.
Responsive Overview-Zoom und mobile Fokus-Offsets sind nötig.

### [P1] Living-Earth-Kuppeln schweben

Die Glas-Hemisphären beginnen über dem Sockel, während das Wireframe volle
Kugeln zeichnet. Kuppelbasis und Rahmen müssen dieselbe Hemisphäre teilen.

### [P1] Der Tree ist noch kein visueller Hero

Wenige große Kronenblöcke lesen sich als generischer Low-Poly-Baum. Ein
sichtbarer Astfächer und kleinere asymmetrische Kronencluster müssen die
Silhouette unverwechselbar machen.

### [P2] Schatten erden nur die Szenenmitte

Das Standard-Shadow-Frustum deckt die Weltkoordinaten der äußeren Gebäude
nicht ab. Das Licht braucht ein explizites, zur Insel passendes Frustum.

## Persona-Red-Flags

- **Jordan, First-Timer:** Auf Mobile waren die drei Orte zunächst nur als
  Icons sichtbar; die Bedeutung von zwei aktiven und einem haltenden
  Lichtstrom musste aus Fließtext erschlossen werden.
- **Sam, Tastatur/Screenreader:** Die Kernaktionen sind erreichbar und
  Statuswechsel werden angekündigt. Vor der Härtung musste der Fokus bei
  WebGL-Verlust gezielt auf Retry und danach zurück zur Kamera geführt werden.
- **Casey, Mobile:** Der erste Tree-Zoom und ein großes Bottom Sheet ließen zu
  wenig Welt für Orientierung übrig; primäre Ortsnamen fehlten visuell.
- **Alex, Power User:** Kamera-Shortcuts existieren, sind aber nur über den
  Screenreader-Hilfetext auffindbar.

## Kleine Beobachtungen

- Das Gate-1-HUD darf auf kleinen Höhen nicht in einen dauerhaft sichtbaren
  Scrollbalken kippen.
- Die native 2D-Karte bleibt die richtige Still- und Fehlererfahrung.
- Der etwa zehnminütige Loop entspricht der Roadmap, braucht aber früh
  sichtbares Feedback, damit die ruhige Phase nicht wie Stillstand wirkt.

## Fragen

- Kann die Welt die Regel „zwei lassen wachsen, einer hält“ bald ohne Text
  vermitteln?
- Welche Landmark-Silhouette wäre auch ohne Label eindeutig One Emergence?
- Wie wenig HUD bleibt nötig, sobald die finalen Assets und Resonanzreaktionen
  selbst erklären, was geschieht?
