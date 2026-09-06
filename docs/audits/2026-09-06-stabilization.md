# Stabilisierung und Website-Audit — 2026-09-06

## Umfang und Arbeitsgrundlage

Lokaler Checkout von OneEmergence; Ausgangs-Working-Tree sauber. Vorhandene
Produktvision und Brand erhalten. Öffentliche Website, Portal-Einstieg,
Content-System, 2D/3D-Map und Entwicklungsabläufe analysiert; konkrete Fehler
behoben und priorisierte Weiterarbeit in [ROADMAP.md](../ROADMAP.md) eingetragen.

Umgebung: Windows, Node 24.19.0, pnpm 11.1.3, Next 16.2.1; CI ist weiterhin auf
Node 22 konfiguriert. Browserprüfung mit Playwright 1.62.1 / Chromium 151,
Desktop und Pixel-5-Emulation, gegen `pnpm build` + `pnpm start` auf Port 3000.
Vorhandene lokale Env-Konfiguration wurde verwendet, Werte nicht protokolliert.

## Behobene Ursachen

| Problem | Änderung und Nachweis |
|---|---|
| Kopierte `.env.example` mit leeren optionalen Integrationen schlägt fehl | Leere Werte normalisieren; gültige Supabase-URL prüfen; verpflichtende Produktionswerte weiterhin erzwingen. Frische Node-Prozesse prüfen Dev, Build, fehlende Runtime-Werte und ungültige URL. |
| Playwright sieht `.env.local` nicht und überspringt Portalchecks | Explizites `@next/env` in der Testkonfiguration; tatsächliche lokale Form-/Redirecttests werden ausgeführt. Dabei zuvor verdeckte mehrdeutige Login-Selektoren und eine falsche mobile Poster-Erwartung korrigiert. |
| Journal-Änderung/-Löschung lässt private Map-Kopien zurück | Journal und Quellknoten transaktional ändern/löschen; Besitzer und Quelltyp abgrenzen. Separate lokale PostgreSQL-Regression prüft tatsächliche Actions, Rückabwicklung und Kantenkaskade. |
| Kontakt/Newsletter behaupten Zustellung ohne Backend | Kontakt erzeugt einen überprüfbaren E-Mail-Entwurf und behält Eingaben. Nutzer sendet selbst im Mailprogramm; Newsletter zeigt einen ehrlichen Kontaktweg. Keine automatische Anmeldung oder simulierte Erfolgsmeldung. |
| Hintergrundaudio bleibt nach Navigation/Still aktiv | Output nach der Modulation stummschalten; AudioContext suspendieren bzw. freigeben; kein Autostart nach Still. Auf Mobilgeräten ist Audio ebenfalls erreichbar. |
| Mobile Navigation fehlt Tastatur-/Statusverhalten | Escape schließt und gibt Fokus zurück; Panel-Zuordnung und aktive Route sind ausgezeichnet. |
| Homepage blendet primäre Inhalte/CTAs im SSR aus; Links enthalten Buttons | Primäre Hero-Inhalte sind von Beginn sichtbar, Flow-Bewegung ist gegatet; ButtonLink liefert ein einzelnes semantisches Navigationselement. |
| CI-Berichte und Datenbankworkflow beschreiben falsche Abläufe | Gemeinsame Browserberichte, separate Nightly-Artefakte und manuelle Migrationsvorschau statt Replay eines nicht vorhandenen SQL-Verzeichnisses. |

## Prüfungen

- Ausgangsbasis: `pnpm lint`, `pnpm typecheck`, `pnpm build` erfolgreich;
  Build erzeugt 51 statische Ausgaben einschließlich Content/Metadaten.
- Reproduzierbarkeit: `pnpm install --frozen-lockfile --offline` mit dem vorhandenen
  pnpm-Store erfolgreich; Lockfile und Manifest stimmen überein.
- Erster vollständiger Browserlauf: **170 bestanden, 11 übersprungen, 7 fehlgeschlagen**.
  Fehler: Hero-Kontrast während Einblendung, zwei mehrdeutige Login-Selektoren,
  mobile Poster-Sichtbarkeit und drei 3D-axe-Zeitüberschreitungen.
- 3D-axe-Diagnose mit einem Worker: **4/4 bestanden**, einzelne Scans unter zehn
  Sekunden. Zwei parallele WebGL-Kontexte plus axe konkurrierten um Grafikressourcen.
  Standard deshalb ein Worker; Schwellenwerte wurden hierfür nicht aufgeweicht.
- Final: **`pnpm check` und `pnpm build` bestanden**.
- Vollständige finale Browserprüfung: **197 bestanden, 11 übersprungen, 0 Fehler**
  in 5,6 Minuten. Darin enthalten: öffentliche Routen, WCAG-axe, Portalformulare/
  Redirects, Content, Env und neue Kontakt-/Audio-/Navigation-/No-JS-Regressionen.
  Zwei Skips betreffen nicht vorhandene Story-Entwürfe; neun sind ausdrücklich
  einem anderen Geräteprojekt zugeordnete Tests. Kein Portaltest wurde ausgelassen.
- `pnpm exec playwright test tests/performance --project=chromium`: **9/9 bestanden**.
  Es gelten die vorhandenen Laborschwellen: LCP < 3 s / CLS < 0,25 für Home,
  Manifest und About; Map LCP < 2,5 s / CLS < 0,1 und gemessene Interaktion < 200 ms.
- `pnpm test:world-assets`: **bestanden**, Tree-GLB 857.436 Bytes / 30.487 Dreiecke.
- Lokale PostgreSQL-Regression: **5/5 Prüfgruppen bestanden**, inklusive Savepoint
  bei defekter Map-Erzeugung. Testdatenbanken entfernt, Testserver gestoppt. Der
  neue CI-Job führt denselben Check gegen einen wegwerfbaren PostgreSQL-16-Service aus;
  der GitHub-Workflow ist statisch geprüft, noch nicht auf GitHub ausgeführt.
- Formatierung aller geänderten Code-/Konfigurationsdateien und Diff-Whitespace-
  Check bestanden. Gesamtes Repo-Format weiterhin separat behandeln.
- Sichtkontrolle: Desktop-Startseite, mobiles Menü und Kontaktentwurf geprüft;
  Navigation im Balanced-Modus funktioniert, keine JavaScript-Seitenfehler.
  Screenshots: `tmp/home-desktop-final.png`, `tmp/home-mobile-final.png`,
  `tmp/menu-mobile-final.png`, `tmp/contact-mobile-final.png`.
- Laufender Produktionsserver: `http://localhost:3000`; `/api/health` liefert
  `{"status":"ok"}`. Browserbericht: `playwright-report/index.html`, separater
  Performancebericht: `tmp/playwright-performance/index.html`.

**3D-Performance bleibt offen:** Im finalen Chromium-Lauf lagen die beobachteten
Bildraten bei rund **11,9 FPS (Desktop, medium)** und **58,2 FPS (mobile Emulation,
low)**. Die deterministischen Geometrie-/Transferbudgets bestehen, garantieren
aber keine flüssige Grafik. Qualitätseinstellung und Profil auf realen Geräten
vor einer breiten 3D-Freigabe optimieren; 2D-/Still-Fallback bleibt nutzbar.

Browserinstallation lag anfangs nicht in der erforderlichen Version vor. Chromium
wurde unter `tmp/playwright-browsers` installiert. In dieser Sitzung für weitere
Läufe in PowerShell setzen:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) 'tmp/playwright-browsers'
pnpm check
pnpm exec playwright test tests/smoke tests/a11y tests/content tests/environment
```

Die allgemeine, rechnerunabhängige Anleitung steht in
[ENGINEERING.md](../ENGINEERING.md). Die Env-Integration folgt der
[Next-Dokumentation](https://nextjs.org/docs/app/guides/environment-variables#loading-environment-variables-with-nextenv);
Reporter und Worker sind über die
[Playwright-Konfiguration](https://playwright.dev/docs/test-configuration) gesteuert.

## Bewusste Grenzen und nächste Aufgaben

- Keine Cloud-Migration, kein Deployment, keine E-Mail, kein Newsletterversand und
  keine bezahlte AI-Anfrage ausgelöst. Lokale Portalansichten/Redirects ersetzen
  keine echte Registrierung, Mailzustellung, Admin-Freigabe oder Account-Löschung.
- Supabase-RLS-Suites benötigen ein ausdrücklich separates Testprojekt. Diese
  Cloud-Abnahme bleibt vor breiter Nutzung offen; die lokale Journal-Regression
  stubbt Auth/Cache und ist kein Beweis für Cloud-RLS.
- Bereits früher verwaiste Map-Inhaltskopien brauchen einen gesonderten geprüften
  Cleanup. Gemeinsame Themen bleiben eigenständige Knoten; semantische Neuableitung
  und der Record-Löschzyklus gehören in die nächste Datenphase.
- Journal-Autosave kann bei gleichzeitiger erster manueller Speicherung doppelte
  Creates erzeugen. Als nächstes serialisieren und langsame Antworten testen.
- Guide: Kosten-/Requestlimits und verlässliche Gesprächsidentität nach Providerfehler
  fehlen noch. Vor zusätzlicher AG-UI-/Tool-Infrastruktur beheben.
- Experiences sind überwiegend als noch nicht verfügbar implementiert. Ein echter
  kurzer Praxisweg ist das nächste sinnvolle Produktpaket; Werbetexte müssen dessen
  tatsächliche Verfügbarkeit und Workspace-Freigabe korrekt erklären.
- Weitere Seiten enthalten noch beim SSR unsichtbare Scroll-Reveals. Homepage-Hero
  ist verbessert; ein flächiger No-JS-/Still-Umbau ist nicht als erledigt behauptet.
- Repo-weites `pnpm format:check` war mit **158 Dateien** bereits rot. Nur geänderte
  Dateien formatieren; flächige Stilbereinigung separat halten.
- Performance-Tests sind lokale Labormessungen mit teils lockereren Grenzwerten als
  die Produktziele. Pixel-Emulation ersetzt kein echtes Telefon, Safari oder eine
  Feldmessung. 3D-Grafikleistung hängt stark vom Gerät ab.
