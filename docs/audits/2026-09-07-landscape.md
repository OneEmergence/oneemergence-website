# Landschaft der immersiven Map

Stand: 7. September 2026. Erweiterung des vorherigen Map-Game-Slices, lokal unter
`http://127.0.0.1:3000/map/immersive`.

## Sichtbare Änderung

- Gemalter Wiesenboden mit warmem Moos, Klee, Erde und kleinen Blüten statt der
  dunklen, stark wiederholten Bodentextur.
- Sandstein-Rundweg, innerer Gartenpfad und Zugänge zu allen 15 Orten. Kleine
  gepflasterte Plätze verbinden Gebäudefüße mit der Landschaft. Erhöhte
  Flussübergänge führen die Wege weiter.
- Vier neue Umgebungsmotive im Stil von Root Home: moosige Sandsteinfelsen,
  Kräutergärten, Schilf-/Seerosenufer und Blumenflächen. Sie werden gemeinsam
  als eine Geometrie gerendert. Low begrenzt die Ausstattung auf 68 Details;
  Medium/High erlauben bis zu 94/120. Die bisherigen Baumgruppen reduzieren
  sich auf 14/24/36 und halten Abstand zu Wegen und Wasser.
- Fluss mit Tiefenfarbe, helleren Rändern und statischen gemalten Lichtstrichen.
  Die bestehende Energieantwort bleibt erhalten. Die Felskante hat sichtbar
  mehr Tiefe und horizontale Sandsteinschichten.
- Bestehende Gebäude, feste isometrische Perspektive, Spielregeln und
  lazy geladener WebGL-Einstieg bleiben die Grundlage. Neue Landschaftsdetails
  animieren nicht und benötigen keine zusätzlichen Abhängigkeiten.

## Behobene Fehler

1. Die asynchron geladene Bodentextur wurde zunächst auf einem bereits ohne
   Textur kompilierten Material nicht sichtbar. Das Material wird beim ersten
   Texturladen neu angelegt; vorher bleibt ein grüner Boden sichtbar.
2. Ein konstant seitlich versetzter Mittelpunkt konnte sehr kurze Zugänge
   umkehren. Der Bogenversatz folgt jetzt der jeweiligen Wegrichtung.
3. Die mathematische Geländehöhe stimmt zwischen groben Dreiecken nicht exakt
   mit dem sichtbaren Mesh überein. Pfade und Plätze sampeln dessen Dreiecke,
   anstatt nur die kontinuierliche Höhenfunktion zu verwenden.
4. Der generierte Atlas enthielt ursprünglich ein eingebranntes Schachbrett.
   Eine neue Imagegen-Bearbeitung und Keying im Material entfernen den Hintergrund.
   [Gewählte Dateien, Grenzen und vollständige Prompts](../assets/2026-09-07-landscape.md).

## Verifikation

Windows, Node 24.20.0, vorhandene gepinnte Abhängigkeiten. CI verwendet weiterhin
Node 22. Playwright verwendet Desktop-Chromium und Pixel-5-Emulation, einen
Worker und `PLAYWRIGHT_BROWSERS_PATH=tmp/playwright-browsers`.
`PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000` zeigt ausdrücklich auf den neu
gestarteten Produktionsserver. Entwicklung wurde vor dem Produktionsbuild beendet.

Die Entwicklungsprüfung fand einen beschädigten generierten Deklarationsstand
unter `.next/dev/types`; die Kopie liegt mit `.bak`-Suffix unter
`tmp/landscape-stale-dev-types`. Der erste Build las noch die archivierten
`.ts`-Dateien über den breiten TypeScript-Glob; nach deren Umbenennung konnte
Next die Deklarationen frisch erzeugen. Keine App-Typen wurden dafür gelockert.

| Prüfung                                              | Exakter Befehl                                                                                                  | Ergebnis                                                                                           |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Lint                                                 | `node node_modules/eslint/bin/eslint.js .`                                                                      | Exit 0, `tmp/landscape-lint.log`.                                                                  |
| Produktionsbuild inklusive Typprüfung                | `node node_modules/next/dist/bin/next build`                                                                    | Exit 0, `tmp/landscape-production-build.log`.                                                      |
| Separate Typprüfung nach regenerierten Deklarationen | `node node_modules/typescript/bin/tsc --noEmit --pretty false`                                                  | Exit 0, `tmp/landscape-typecheck.log`.                                                             |
| Gesamte Map-Suite                                    | `node node_modules/@playwright/test/cli.js test tests/smoke/world-map`                                          | **120 bestanden, 16 erwartete Skips**, 3,6 Minuten; `tmp/landscape-world-tests.log`.               |
| Barrierefreiheit                                     | `node node_modules/@playwright/test/cli.js test tests/a11y/accessibility.spec.ts --grep 'world map\|World map'` | **10 bestanden**, 30,6 Sekunden; `tmp/landscape-a11y.log`.                                         |
| Gerenderte Produktionsansicht                        | `node tmp/landscape-production-preview.mjs`                                                                     | Exit 0, beide Assets HTTP 200, keine Console-/Page-Errors; `tmp/landscape-production-preview.log`. |

Insgesamt **130 bestandene Prüfungen**. Die 16 Skips betreffen ausschließlich
geräteabhängige Szenarien: Desktop-Verträge werden nicht im Mobile-Projekt
dupliziert, Touch nicht ohne Touch simuliert. Zusätzliche Geometrieprüfungen
decken die Höhe bis zur Inselkante, jeden Ortszugang, aufwärts gerichtete
Wegdreiecke, das Detailbudget und freie Landmark-Pickbereiche ab.

Der Produktions-Renderlauf verzögerte die Wiesenanfrage absichtlich um 900 ms.
Die Textur erschien danach korrekt. Visuell betrachtet wurden Desktop-Übersicht
und Root-Home-Nahansicht (1440×900), Mobil-Übersicht und -Nahansicht (393×727),
außerdem Morgengold, Taglicht und kosmische Atmosphäre. Die gemalten Materialien
behalten dabei bewusst ihre eingebrannte Beleuchtung passend zu den Gebäuden.

Lokale Screenshot-Dateien:

- `tmp/landscape-production-desktop-overview.png`
- `tmp/landscape-production-desktop-detail.png`
- `tmp/landscape-production-mobile-overview.png`
- `tmp/landscape-production-mobile-detail.png`
- `tmp/landscape-production-day.png`, `tmp/landscape-production-cosmic.png`,
  `tmp/landscape-production-dawn.png`

Die vorhandene Laufzeitprobe nach einer Aufmerksamkeit an Root Home erfasste
**4.537.175 Bytes Asset-Transfer**, unter dem 6-MB-Limit, und meldete das
deterministische Renderbudget als bestanden. Die lokale Frame-Cadence lag bei
39,5/s auf Desktop (Medium) und 60,4/s in der Mobile-Emulation (Low).
Dies sind Diagnosewerte dieses Headless-Chromium-Laufs, keine Messung eines
echten Smartphones und wegen unterschiedlicher Qualitätsstufen kein kontrollierter
Vorher-/Nachher-Benchmark. Die zwei neuen Bilddateien umfassen zusammen
1.849.622 Bytes; der alte Wiesenboden wird in der immersiven Szene nicht mehr geladen.

## Grenze und nächster Slice

Die Ausstattung ist jetzt als Landschaft integriert. Sie ist noch keine
zustandsabhängige Garten-Simulation: Als nächstes soll Root Home → Living Earth
sichtbar zwischen ruhend, wachsend und verbunden wechseln. Der
[Map-Game-Plan](../plans/world-map-game.md) beschreibt Abnahme und Abhängigkeiten.
Eine reale Smartphone-GPU, Safari, Cloud-Flows und Deployment werden durch die
lokale Chromium-Prüfung nicht bestätigt.
