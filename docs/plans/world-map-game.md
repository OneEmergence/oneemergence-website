# World Map Game — Eine Welt, die antwortet

Stand: 2026-09-07 · Slice 0 lokal umgesetzt; weitere Spiel- und Geräteabnahme offen.

Die öffentliche Karte wird zu einer ruhigen, spielbaren Solarpunk-Insel im
kosmischen Raum. Ihr wiedererkennbarer Kern ist der **Tree of Emergence mit
verzweigten Lichtflüssen**: Aufmerksamkeit verbindet persönliche Orte mit
kollektiven Einrichtungen, und jede gelungene Verbindung verändert die Welt.
Die handgemalte 2.5D/3D-Mischung bleibt die gestalterische Grundlage.

Dieser Plan konkretisiert die [aktuelle Roadmap](../ROADMAP.md) und
[VISION.md](../../VISION.md). Er ersetzt für die nächsten Map-Arbeitspakete die
Reihenfolge der älteren Juli-Gates; deren Nachweisprotokolle bleiben historischer
Kontext. **Ein geplanter Abnahmepunkt ist kein bereits bestandenes Ergebnis.**

## 1. Spielversprechen und bestehende Grundlage

**„Lenke fünf Lichtströme, verbinde innere Entwicklung mit einer lebendigen Welt
und sieh, wie aus einzelnen Orten ein zusammenhängendes Zuhause entsteht.“**

Die Freude entsteht durch Entdecken, verständliche Entscheidungen und sichtbare
Verwandlung. Die Insel darf warm, geheimnisvoll und wunderschön sein, ohne ständige
Reize zu fordern. Eine kurze Begegnung soll sich vollständig anfühlen; eine ganze
Reise darf ungefähr 20–30 Minuten dauern, ohne diese Zeit künstlich einzufordern.
Diese Dauer ist ein zu prüfendes Erlebnisziel, keine Pflicht oder Wartezeitschranke.

Die öffentliche Welt unter `/map` und `/map/immersive` bleibt von der privaten
Consciousness Map unter `/inner/map` getrennt. Für die öffentliche Reise ist kein
Konto nötig. Spielstände sind zunächst lokal; Journal- und Gesundheitsdaten
werden weder für Spielaufgaben verwendet noch als Fortschritt bewertet.

### Iststand aus dem Code

| Bereits vorhanden                                                                                       | Grenze für die nächste Arbeit                                                                                                |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 15 typisierte Orte, sieben feste Paare, fünf Aufmerksamkeitspunkte, Kapazität zwei pro Ort              | Die Paare verwenden bislang dieselben Kernaktionen; ihre spielerischen Unterschiede müssen erst gestaltet werden.            |
| Deterministischer Reducer, Unterstützungsring, reversible Dissonanz, dauerhafte Paarabschlüsse          | Dissonanz ist derzeit vor allem ein Hinweiswert; zusätzliche Regeln müssen einen nachvollziehbaren Nutzen haben.             |
| Validierte lokale v2-Session und Wiederherstellung nach Renderer-Ausfall                                | Alte Spielstände bei Regeländerungen bewusst übernehmen oder einen erklärten Neustart anbieten.                              |
| R3F-Szene mit handgemalten Sprites für alle 15 Orte, prozeduralen Rückfällen und einzelnen 3D-Elementen | Die primären Sprites bilden Zustandsänderungen noch weniger deutlich ab als einige Rückfallmodelle.                          |
| DOM-Ortsatlas, Kameraaktionen, responsive Detailkarte, WebGL-/2D-Wechsel                                | Die 2D-Karte erhält aktuell keine Spielaktionen oder Session. Sie bietet Ortsnavigation, aber noch keine spielbare Kampagne. |
| Qualitätsstufen, automatische Absenkung, Still/Reduced Motion, Audio nach ausdrücklicher Aktivierung    | Eine explizite Spielpause fehlt. Der Spieltakt läuft nur im 3D-UI und pausiert bei verborgenem Tab.                          |

Der aktuelle Puls dauert 2,5 Sekunden. Zwei Ströme erhöhen Resonanz, einer hält
sie; persönliche Resonanz öffnet das globale Gegenstück. Aus den Konstanten
ergeben sich idealisiert etwa **165–205 Sekunden für das erste vollständige Paar**,
je nach Unterstützung. Das ist eine Herleitung, kein beobachteter Nutzertest.
Das neue Erlebnis darf diese Zeit mit Entscheidungen und Entdeckungen füllen,
muss aber auch unnötiges Warten abbauen.

## 2. Die ersten zehn Minuten

Die folgende Reise ist der Zielzustand nach den Spielbarkeits-Slices. Der aktuelle
Sprint liefert daraus zunächst die Orientierung, die erste nächste Aktion und
die bessere Landschaft, noch kein vollständiges neues Onboarding.

| Zeit als Orientierung | Erlebnis und Handlung                                                                                                                                          | Sichtbare Antwort / Verständnis                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:30             | Die Kamera zeigt Lebensbaum, Root Home und den Weg Richtung Living Earth. Ein kurzer Hinweis bietet „Beginne bei Root Home“; freies Erkunden bleibt möglich.   | Ein klarer Blickfang und eine nächste Handlung. Keine Anleitung, die vor dem Spielen gelesen werden muss.                                                  |
| 0:30–1:30             | Root Home auswählen und Aufmerksamkeit ausrichten. Ein zweiter Strom erklärt durch seine Wirkung den Unterschied zwischen Halten und Wachsen.                  | Licht läuft tatsächlich vom Baum zu den Wurzeln; Fenster und Garten antworten. Die Oberfläche benennt Quelle, Ziel und Wirkung.                            |
| 1:30–3:00             | Das Living Earth Institute antwortet. Einen Strom am persönlichen Ort halten und weitere Aufmerksamkeit zum globalen Center lenken.                            | Der gemeinsame Wasserlauf wird lesbar. Die Person versteht, warum beide Orte zusammenwirken und welche Aufmerksamkeit noch frei ist.                       |
| 3:00–5:00             | Die erste Verbindung vollenden; währenddessen darf man erkunden, pausieren oder den nächsten Simulationsschritt bewusst auslösen.                              | Ein trockener Garten wird lebendig, der Wasserlauf verbindet beide Orte, ein Ast am Tree verändert sich dauerhaft. Der Abschluss braucht keine Zahlenwand. |
| 5:00–7:30             | Zwei verständliche nächste Ziele entdecken: direkt der unterstützten Schöpfungsroute folgen oder einen anderen persönlichen Ort vorbereiten.                   | Vor der Wahl ist erkennbar, was Unterstützung bewirkt. Beide Wege sind gültig und rückgängig planbar.                                                      |
| 7:30–10:00            | Eine zweite Verbindung beginnen oder abschließen und auf die veränderte Insel zurückblicken. Ein freiwilliger kurzer Impuls verbindet das Bild mit dem Alltag. | Die Person kann erklären, was ihre Entscheidung verändert hat, und weiß, wie sie später fortsetzt. Beenden erhält den Fortschritt.                         |

Zeitangaben sind Beobachtungsfenster für Spieltests. Es gibt keinen Countdown,
keinen erzwungenen Ablauf und keine Pflicht zur persönlichen Selbstoffenbarung.
Ein Impuls wie „Was möchtest du heute nähren?“ bleibt freiwilliger Inhalt und
wird nicht zur Voraussetzung für eine Spielbelohnung.

## 3. Kernablauf und Fortschritt

1. **Wahrnehmen:** Ein Ort zeigt einen konkreten Bedarf, etwa einen trockenen
   Garten, eine ruhende Werkstatt oder einen unverbundenen Weg.
2. **Ausrichten:** Aufmerksamkeit zuweisen; Quelle, Ziel und erwartete Wirkung
   bleiben sichtbar. Eine Umverteilung aus einem anderen Ort geschieht erkennbar.
3. **Verbinden:** Persönlichen und globalen Ort gemeinsam tragen. Freie Ströme
   können den nächsten Bereich vorbereiten; Unterstützung macht diese Wahl lesbar.
4. **Erleben:** Der Zustand verändert Landschaft und Gebäude unmittelbar.
   Abschluss erzeugt eine dauerhafte, charakteristische Veränderung.
5. **Weiterziehen oder ruhen:** Aufmerksamkeit kehrt zurück, ein neuer Zusammenhang
   wird verständlich, und die Person entscheidet selbst über Fortsetzung und Pause.

Die fünf Ströme und der vorhandene Reducer bleiben zunächst die Grundlage.
Balancing wird anhand konkreter Spielbeobachtungen angepasst; zusätzliche
Währungen, Inventare, Skill-Trees oder sieben getrennte Minispiele sind dafür
nicht nötig. Zwei erfolgreiche Strategien müssen erkennbar sein: eine unterstützte
Kette aufbauen oder mehrere persönliche Orte parallel vorbereiten.

Ab Slice 1 liegt der Takt außerhalb des Renderers. „Pause“ stoppt die Simulation;
ein zugänglicher Schrittmodus kann denselben Reducer bis zum nächsten relevanten
Ereignis fortführen. Er überspringt keine Spielbedingungen und liefert bei
denselben Befehlen dasselbe Ergebnis. Das genaue Schrittkriterium wird beim
ersten Paar festgelegt und deterministisch geprüft. So muss Still keine
Echtzeit-Wartephase ersetzen und eine Unterbrechung wird nicht zum Nachteil.

Abgeschlossene Paare bleiben erhalten. Unfertige Verbindungen dürfen bei bewusster
Umverteilung reversible Spannungen zeigen, aber eine Pause oder Abwesenheit
verursacht keinen Verlust. Fortschritt besteht aus einer veränderten Insel,
verständlicheren Zusammenhängen und neu entdeckten Inhalten. Keine Tagespflichten,
Streak-Verluste, zufälligen Belohnungsschleifen, Ranglisten oder XP-Aufgaben.
Ein Neustart wird ausdrücklich gewählt und gegen versehentliches Auslösen geschützt.

## 4. Sieben Paare, fünfzehn Orte

Der Tree ist Ursprung, Rückblick und verbindendes Zentrum. Die sieben Paare
erhalten eigene Bedürfnisse und Ergebnisse; ihre Grundbedienung bleibt gleich.
Die folgenden Unterschiede sind **Produktionsvorschläge für Slice 2**, keine
bereits implementierten Mechaniken.

| Persönlicher Ort → globales Center         | Spielerische Frage                                                                                               | Dauerhafte Weltreaktion                                                                                |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Root Home → Living Earth Institute**     | Wie halte ich mein Zuhause getragen, während ich den gemeinsamen Garten nähre? Einführung in Halten und Wachsen. | Wurzeln, Wasser und Saatgärten verbinden sich; die warme Startregion blüht auf.                        |
| **Creation Temple → House of Creation**    | Führe ich die Unterstützung aus der Erdung weiter oder bereite ich parallel einen anderen Ort vor?               | Werkstatthöfe öffnen sich, Stoffsegel und ein gestalteter Steg beleben den Flussraum.                  |
| **Solar Ark → Energy Gardens**             | Wann lohnt sich konzentrierte Aufmerksamkeit, wann die stabile Verteilung?                                       | Solarflächen entfalten sich, eine Wasseranlage arbeitet, Licht erreicht die benachbarten Wege.         |
| **Heart Caravan → Gate of Exchange**       | Wie verbinde ich zwei bereits lebendige Bereiche, ohne einen unfertigen Ort unbemerkt zu entziehen?              | Eine ruhige Karawanen-/Fährroute und ein einladender Hafen zeigen Austausch.                           |
| **Voice Beacon → Global Council**          | Welche Verbindung unterstützt mein nächstes Vorhaben, und wie wird diese Wirkung verständlich?                   | Ein Signalweg verbindet den Beacon mit einem offenen, beleuchteten Kreis am Council.                   |
| **Observatory → Noosphere Data Center**    | Welche Zusammenhänge erkenne ich im gewachsenen Netz? Eine alternative Reihenfolge darf sich hier auszahlen.     | Sternkarte und Wissensgärten werden lesbar verbunden; Sichtachsen öffnen sich.                         |
| **Cosmic Control Center → Ashram Retreat** | Was kann ich loslassen, wenn tragfähige Verbindungen bereits bestehen?                                           | Der letzte Weg wird ruhig, der Tree führt die sieben Veränderungen in einem gemeinsamen Bild zusammen. |

Der bestehende Unterstützungsring folgt dieser Reihenfolge und schließt sich vom
letzten Paar zurück zum ersten. Er ist eine Hilfe, keine vorgeschriebene Reihenfolge.
Zunächst genügen ortsspezifische Zustandsbilder, kurze Hinweise und sichtbare
Verbindungen. Neue Regelvarianten kommen erst hinzu, wenn Spieltests eine konkrete
Wiederholung zeigen; jede Variante braucht eine verständliche Entscheidung und
eine ebenso zugängliche DOM-Darstellung.

## 5. Bild, Raum und Klang

### Eine zusammenhängende Insel

Die drei Markentiefen werden räumlich lesbar: ein warmer, bewohnter Süden aus
Wurzeln, Stein und Textilien; eine lebendige Solarpunk-Mitte mit Wasser, Gärten und
Werkstätten; ein stillerer kosmischer Norden mit Höhen, Observatorium und Rückzug.
Küste, Nebenarme, Übergänge und Wege verbinden diese Bereiche. Gebäude sitzen
glaubwürdig auf Gelände und besitzen freie Sichtachsen; die Karte wirkt nicht
wie eine Ansammlung frei platzierter Bildkarten.

Der Lebensbaum bleibt der stärkste Blickfang. Licht wächst aus seinen Wurzeln
durch vorhandene Wege und Wasserläufe. Ruhend, eingestimmt und verbunden
unterscheiden sich durch Form, Umgebung und Zeichen, zusätzlich zur Farbe.
Ein Abschluss kann Wasser zurückbringen, einen Weg öffnen oder ein Segel entfalten.
Das ist wertvoller als ein weiterer frei schwebender Leuchtring.

Die feste orthografische Perspektive folgt dem vorhandenen isometrischen Kanon
(Yaw 45°, Elevation 30°, Pan/Zoom). Kamerafahrten sind kurz und optional, manuelle
Ausrichtung bleibt erhalten. Freie Rotation würde die Einzelansicht-Sprites
entlarven und ist keine Voraussetzung für räumliche Tiefe.

### Realistischer Weg von 2.5D zu mehr 3D

**Landschaftsstand vom 7. September:** Der Boden besitzt eine eigene gemalte
Wiesenoberfläche. Ein Rundweg, ein innerer Gartenpfad und kurze Zugänge verbinden
alle 15 Orte mit kleinen Sandsteinplätzen. Vier neue gemalte Umgebungstypen
(moosige Felsen, Kräutergärten, Schilfufer und Blumenflächen) ergänzen weniger,
bewusster verteilte Baumgruppen. Wasser erhält flache Ufer, Tiefenfarbe und
ruhige Lichtstriche; die Inselunterseite sichtbare Sandsteinschichten.
Pfade werden auf dem tatsächlich gerenderten Gelände platziert, damit der
Low-Modus keine Wegstücke verschluckt. Die neuen Details benötigen zusammen
einen Draw Call. [Abnahme](../audits/2026-09-07-landscape.md),
[Assets und Prompts](../assets/2026-09-07-landscape.md).

Die Gärten sind derzeit eine gemeinsame gestalterische Grundausstattung.
Als nächstes erhält **Root Home → Living Earth** unterscheidbare ruhende,
wachsende und verbundene Garten-/Uferzustände, die der vorhandene Reducer steuert.
Abnahme: Der Unterschied ist auch ohne Zahlen, in Still und in der später
spielbaren 2D-Ansicht verständlich; Neustart und Fortsetzen zeigen denselben Zustand.
Eigene Vegetation und Geländehöhen pro Region folgen nach diesem überprüfbaren
ersten Paar. Freie Kamerarotation bleibt wegen der gemalten Einzelansichten außen vor.

1. Vorhandene Sprites sauber im Gelände verankern; Küste, Wasser, Bodenschatten,
   Pfade und Vorder-/Hintergrundstaffelung ausarbeiten.
2. Für das Starttrio Zustandsmasken und kleine ergänzende Elemente herstellen:
   Fenster, Wasser, Vegetation, offene Wege. Basisbild plus Maske statt drei
   vollständiger Bildsets pro Gebäude, soweit das Motiv dies trägt.
3. Einen zusammenhängenden Ausschnitt mit echten Höhen, Brücke, Wasserbett und
   wenigen räumlichen Details aufwerten. Vergleich aus der Spielkamera, auf Mobile
   und ohne Bewegung durchführen.
4. Erst danach einen Hero-Ort als handwerklich bereinigtes 3D-Modell prüfen.
   Er muss aus derselben Kamera sichtbar besser aussehen und ins Budget passen.
   Andere Landmarken dürfen dauerhaft Sprites bleiben.

Mehr räumliche Tiefe bedeutet langfristig begehbar wirkende Ufer, Terrassen,
Brücken, Höfe und gestaffelte Vegetation. Avatare, Gebäudeinnenräume, freie
Kamera oder Multiplayer bleiben spätere Produktentscheidungen. Keine neue
Engine, Physik oder ECS-Schicht ist für diese vier Slices vorgesehen.

### Asset-Pipeline

Der [isometrische Kanon](../design/world-map-isometric/canon/README.md) ist die
Bildreferenz. Der [Retro-2.5D-Plan](./2026-07-28-one-emergence-retro-2-5d-map-plan.md)
liefert Kamera-, Licht- und Exportvorgaben. Der ältere
[3D-Asset-Vertrag](../design/world-map-3d-asset-contract.md) bleibt eine technische
Referenz für geprüfte GLBs; seine überwiegend prozedurale Produktionsbeschreibung
ist nicht mehr der vollständige Iststand.

Pro Asset: Zweck und Zustand festlegen → aus der echten Kamera entwerfen →
Silhouette, Licht und Maßstab vergleichen → Alpha/Anker/Sortierung bereinigen →
optimiert exportieren → in der Szene und im Budget abnehmen. Referenz und
Herkunft/Lizenz bleiben nachvollziehbar. Generierte Rohbilder oder Rohmodelle
sind Entwürfe, keine automatisch fertigen Produktionsassets.

RGBA-WebP bleibt für Landmarken der Standard. Manifestdaten tragen Größe,
Bodenanker und Sortierung. GLBs brauchen geprüfte Topologie, UVs, reduzierte
Texturen, passende LODs und Pick-Flächen; Mesh-Kompression wird gemessen,
KTX2 erst mit tatsächlich verfügbarem und geprüftem Exportweg eingeführt.
Eine kleine fertige Region gibt die Qualität vor, bevor ein großer Asset-Katalog
entsteht. Die vorhandenen 17 isometrischen WebPs umfassen zusammen rund 2,32 MB
auf Disk; das ist keine Messung des gesamten Szenen-Downloads oder GPU-Speichers.

### Klang

Die vorhandene ausdrückliche Aktivierung, Lautstärke, Pause, Mute und
Tab-Unterbrechung bleiben. Später ergänzen wenige regionale Schichten Wasser,
Werkstatt, Wind und kosmische Ruhe; ein Paarabschluss fügt eine zurückhaltende
musikalische Antwort hinzu. Klang transportiert niemals allein eine notwendige
Information. Kein Autoplay, keine vorausgesetzten Kopfhörer und keine zusätzliche
Audio-Library ohne konkreten Bedarf.

## 6. Vier priorisierte vertikale Slices

### Slice 0 — Die Insel lädt zum ersten Schritt ein · aktueller Sprint

**Ergebnis:** Besseres Kamera-Framing, schlankeres HUD, eine klare nächste Aktion
und ein zusammenhängenderer Wasser-/Küstenraum. Regeln und Fortschritt bleiben
Grundlage; rendererunabhängiges Spielen und Pause werden noch nicht behauptet.

**Abnahme:**

- Desktop und Mobile zeigen beim Eintritt den Tree und einen verständlichen
  Einstieg Richtung Root Home; zentrale Gebäude werden nicht von HUD überdeckt.
- Eine primäre nächste Aktion führt zum passenden Ort. Atlas, Einstellungen und
  Rückweg bleiben erreichbar, sekundäre Kamerasteuerung konkurriert weniger.
- Keine überlagerten Aktionen oder abgeschnittenen Inhalte bei 390 × 844 und
  einem niedrigen Desktop-Fenster; Auswahl, Escape, Touch und Tastatur bleiben nutzbar.
- Wasser, Ufer und Gelände bilden erkennbare Übergänge. Vergleichsbilder aus
  identischen Kameras zeigen den Gewinn in Dawn/Day/Cosmic und Low/Medium.
- Bestehende Auswahl-, Speicher-, Fallback- und Qualitätsprüfungen bleiben grün.
  Ein langsames Referenzprofil verschlechtert sich nicht ohne dokumentierte Ursache.

**Abhängigkeit:** Bestehende Welt- und Performancebasis; keine neuen Backenddienste.
**Status:** Lokal umgesetzt: responsive Kamera, kompaktes HUD, regelgerechte
Spielführung und Landschaft. Build/Lint und 122 relevante Prüfungen sind grün;
16 Geräte-Skips sind erklärt. Das [Prüfprotokoll](../audits/2026-09-07-map-game.md)
hält Renderer, Bildnachweise und Grenzen fest. Beobachtete Spieltests und echte
Geräte bleiben offen; die folgenden Slices sind weiterhin geplant.

### Slice 1 — Das erste Paar ist für alle spielbar

**Ergebnis:** Tree, Root Home und Living Earth bilden einen vollständigen kurzen
Spielbogen mit verständlichen Zuständen, sichtbarer Veränderung, Pause und
gleichwertigen DOM-Aktionen in 2D und 3D.

**Abnahme:**

- Neue Personen finden in einem beobachteten Erstkontakt ohne mündliche Erklärung
  innerhalb von ungefähr 30 Sekunden die erste Handlung. Mindestens vier von
  fünf können nach dem ersten Paar Quelle, Halten/Wachsen und Weltreaktion erklären.
- Das erste Paar kann ohne Leerlauf als Hauptinhalt abgeschlossen werden;
  Spieltest dokumentiert tatsächliche Zeit, Verständnis und Wartephasen.
- Still, Reduced Motion, fehlendes WebGL und Context-Loss erlauben denselben
  Paarabschluss über DOM-Aktionen; Rendererwechsel verliert keinen Fortschritt.
- Pause und Tab-Unterbrechung ändern keinen Spielstand. Schrittmodus und
  Echtzeittakt ergeben bei gleicher Befehlsfolge denselben logischen Zustand.
- Speichern, Reload, nicht verfügbare lokale Speicherung und bewusster Neustart
  haben nachvollziehbare Zustände; ein Regel-/Versionswechsel löscht keinen
  bestehenden Fortschritt stillschweigend.
- Drei Zustände des Starttrios sind auch ohne Ton, Animation und reine
  Farbunterscheidung erkennbar. Tastatur und Screenreader schließen den Bogen ab.

**Abhängigkeit:** Slice 0; Session/Takt aus `ImmersiveThreeWorld` herauslösen,
bestehenden Reducer und gemeinsame semantische Spielaktionen weiterverwenden.

### Slice 2 — Sieben Beziehungen ergeben eine lebendige Reise

**Ergebnis:** Alle Paare besitzen charakteristische Weltreaktionen und die
Unterstützung macht mehrere sinnvolle Wege durch die Insel möglich.

**Abnahme:**

- Alle 15 Orte und sieben Paare sind vollständig in 2D/3D, DOM und DE/EN abgebildet.
  Zwei unterschiedliche Strategien führen deterministisch zum Abschluss.
- Nach jedem Paar ist eine ortsspezifische Veränderung dauerhaft sichtbar und
  textlich beschrieben. Die nächste Entscheidung und ihre Wirkung sind erkennbar.
- Beobachtete vollständige Reisen prüfen das Ziel von ungefähr 20–30 Minuten;
  wiederholte Wartephasen werden gekürzt, statt neue Aufgaben zum Strecken einzubauen.
- Mindestens vier von fünf Testpersonen können nach zwei Paaren eine eigene
  nächste Wahl begründen. Der Abschluss bietet einen ruhigen Rückblick und einen
  freiwilligen Ausstieg; eine Rückkehr braucht keinen verlorenen Bonus auszugleichen.
- Pause, Reload und Rendererwechsel funktionieren auch mitten in parallelen
  Verbindungen. Bestehende v2-Spielstände erhalten einen geprüften Übergang.

**Abhängigkeit:** Abgenommener erster Bogen; Zustandsbilder und verständlicher
Unterstützungsring vor weiteren Mechanikvarianten produzieren.

### Slice 3 — Räumliche Tiefe mit nachgewiesenem Qualitätsgewinn

**Ergebnis:** Ein besonders schöner zusammenhängender Ausschnitt verbindet
Terrain, Wasser, Zustandsdetails und optional einen hochwertigen 3D-Hero-Ort.

**Abnahme:**

- Derselbe Ausschnitt wird vor/nach Änderung mit fester Kamera, gleichem
  Spielstand, gleicher Atmosphäre und gleichem Qualitätsprofil verglichen.
  Silhouette, Materialwirkung und Landschaftszusammenhang verbessern sich sichtbar.
- Der 3D-Hero wird nur übernommen, wenn er aus der Spielkamera besser als der
  Sprite wirkt; bei Ablehnung bleibt der fertige Hybrid-Ausschnitt lieferbar.
- Low bleibt vollständig spielbar. Hochwertige Assets laden bedarfsabhängig;
  `/map` lädt weiterhin keine Three-/R3F-Szene oder Hero-Modelle.
- Reale Zielgeräte bestehen die untenstehenden Bildraten- und Bedienungsziele.
  Qualitäts-/Atmosphärenwechsel erhalten Kamera und Spielstand; mehrfacher
  Einstieg verursacht keinen stetig wachsenden GPU-Speicherverbrauch.
- Art-, Audio-, Accessibility- und Performance-Nachweise werden gemeinsam
  protokolliert, bevor weitere Regionen dieselbe Produktionsqualität erhalten.

**Abhängigkeit:** Slice 1 und ein bewährter Art-Ausschnitt; breiter Rollout erst
nach Slice 2. Ein isolierter Asset-Prototyp darf parallel zu Slice 2 entstehen.

## 7. Gemeinsame Grenzen und Prüfweg

### Accessibility und Bedienung

Semantisches DOM trägt Orte, Zustände und alle Kernaktionen. Fokus ist sichtbar,
kehrt nach Schließen/Renderer-Ausfall sinnvoll zurück und bleibt frei von
überlagernden Panels. Aktionen sind mit Tastatur und einfachen Touch-Eingaben
möglich; anvisiert werden 44-Pixel-Touchflächen. Statusmeldungen erklären
bedeutende Ereignisse, ohne jeden Simulationspuls vorzulesen.

Still nutzt statische Weltantworten mit vollständiger Spielbarkeit ab Slice 1.
Bewegung folgt dem vorhandenen `useMotionLevel`-Vertrag: Micro für Bedienfeedback,
Flow für Kamera, Sacred für Resonanz, Event für den großen Abschluss. Alle
neuen Texte werden in DE/EN über next-intl gepflegt. Die öffentliche Sprachroute
ist gesondert zu lösen; Übersetzungsdateien allein beweisen keine englische Seite.

### Performancebudgets

| Bereich                      | Ziel / Prüfkriterium                                                                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Öffentliche Website          | LCP < 2,5 s, CLS < 0,1, INP < 200 ms als Produktziele; 3D bleibt hinter dem Eintritt.                                                              |
| Spielszene                   | Ziel etwa 60 FPS auf vereinbartem Mittelklasse-Desktop, mindestens 30 FPS auf vereinbartem Mittelklasse-Mobile; echte Geräte benennen.             |
| Downloads                    | Erstes sichtbares Szenenpaket als Planungsbudget unter 6 MB übertragen; High-Assets separat und bedarfsabhängig.                                   |
| Texturen                     | Aus dem 2.5D-Plan: dekodierte Texturen zunächst maximal 48/72/96 MB für Low/Medium/High; Mipmaps und tatsächlichen GPU-Bedarf zusätzlich erfassen. |
| Bestehende Geometrie-Grenzen | Low 205 Draw Calls / 120.000 Dreiecke; Medium 355 / 250.000; High 520 / 420.000. Das sind Obergrenzen, keine auszuschöpfenden Ziele.               |
| Schwache Geräte              | Automatische Absenkung erhalten, manuelle Wahl respektieren, Low-Pixelbudget erhalten; lesbare DOM-Texte bleiben in nativer Auflösung.             |

Draw Calls, Dreiecke oder eine grüne Budgetmarkierung ersetzen keine Messung der
Bildrate, Reaktionszeit und Speichernutzung. Software-Renderer sind ein
reproduzierbarer Stresstest, kein Nachweis für reale Mittelklasse-Hardware.

### Verifikation und Übergabe

Die bestehende TypeScript-Playwright-Infrastruktur bleibt der Prüfweg:

- `tests/smoke/world-map-game.spec.ts`: Ressourcenregeln, Strategien, Persistenz;
  künftig Pause-/Schrittäquivalenz und Übergang bestehender Spielstände.
- `world-map.spec.ts`: echter Einstieg, Auswahl, Spielaktionen, Speicher-/Renderer-
  Übergänge und Tastatur; neue 2D-Spielparität dort nachvollziehbar abnehmen.
- `world-map-geometry.spec.ts`, `world-map-placements.spec.ts` und
  `world-map-performance.spec.ts`: räumliche Verträge und technische Budgets.
- `world-map-framing.spec.ts`, `world-map-landscape.spec.ts`,
  `world-map-journey.spec.ts` und `world-map-presentation.spec.ts`: unabhängige
  Projektion, Ufer/Fluss, tatsächlich erreichbare Spielhinweise und DOM-/Canvas-Framing.
- Ergänzend: gezielte Axe-/manuelle Screenreader-Prüfung, feste Vergleichsbilder
  und kurze beobachtete Spieltests. Automatisierte Klicks beweisen keinen Spielspaß.

Jeder Slice endet mit geändertem Nutzerverhalten, tatsächlichen Befehlen und
Ergebnissen, Renderer-/Servertyp, getesteten Geräten, erklärten Skips, offenen
Grenzen und dem nächsten kleinen Auftrag. Unabhängige Art-, Logik- und
Dokumentationsarbeit erhält getrennte Dateizuständigkeit; Build und Browserlast
bleiben koordiniert. Abschlussstatus und Messwerte werden erst nach der realen
Abnahme ergänzt.

### Technische Einstiegspunkte

- [Weltmodell](../../src/features/world-map/landmarks.ts) und
  [Spielregeln](../../src/features/world-map/immersive/game.ts)
- [Session/Renderer-Grenze](../../src/features/world-map/immersive/ImmersiveMapBoundary.tsx)
  und [heutiges Spiel-HUD](../../src/features/world-map/immersive/ImmersiveThreeWorld.tsx)
- [Szene](../../src/features/world-map/immersive/WorldScene.tsx),
  [Sprite-Manifest](../../src/features/world-map/immersive/spriteAssets.ts) und
  [2D-Karte](../../src/features/world-map/components/WorldMap.tsx)

**Nächster Auftrag nach diesem Sprint:** Slice 1 am vorhandenen Starttrio
umsetzen und mit dem gleichen Spielstand in 2D, Still und 3D abnehmen. Die ersten
Spielbeobachtungen entscheiden dann über Tempo und Umfang der sieben Paarvarianten.
