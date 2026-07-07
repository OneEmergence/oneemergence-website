# OpenAdvo — Best Practices, Ideen & Aussichten für die zukünftige Arbeit

> Vorausschauende Synthese. Verzahnt die Vision (`goal.md`) mit der ehrlichen Ist-Analyse (`2026-07-07-openadvo-positionierung.md`) und den verifizierten Marktdaten (`2026-07-07-openadvo-marktbild.md`). Zweck: die große Vision im Kopf behalten und zugleich den Alltag danach ausrichten. FACT/ASSESSMENT/SPEC wie in den Schwester-Dokumenten. Stand 2026-07-07.

## Der eine Satz, den alles trägt

**OpenAdvo gewinnt nicht mit dem besseren Formular, sondern mit dem Vorgang, den niemand sonst anbietet — KI-nativ, end-to-end, für einen Service, den die Großen nicht profitabel bedienen.** Der Markt bestätigt: Incumbents besetzen die Formular-Bibliothek (MACH: 3.500 PDF + 1.600 HTML), die KI-Player besetzen die Auskunft (Komm.ONE/neuraflow), aber die Strecke „verstehen → ausfüllen → einreichen → Rückkanal → Bescheid" ist frei. Dort ist unser Platz.

## Strategische Leitplanken (was die Marktdaten für die Arbeit bedeuten)

1. **Nicht gegen die Bibliothek antreten.** MACHs Moat sind 3.500 gepflegte Formulare. Diesen Vorsprung holt man nie ein — und man muss nicht. Differenziere auf der **Dialog- und Vorgangs-Ebene**, nicht auf Formular-Breite. Jede Stunde, die in „mehr Templates" statt „besserer Vorgang" fließt, spielt auf dem Feld des Gegners. [Marktbild §1]
2. **FIT-Connect/FIM sind Pflicht, kein Vorsprung.** FORMCYCLE, MACH, OZG-Hub sind alle FIT-Connect-fähig. Baue den Anschluss solide, aber verkaufe ihn nicht als Alleinstellung — die Story ist der Vorgang, der darüber läuft. [Marktbild §2]
3. **In Baden-Württemberg steht schon eine Landesplattform (OZG-Hub, Komm.ONE-gestützt).** Tübingen hat potenziell eine Formular-Option. → Positioniere OpenAdvo als **KI-/Vorgangs-Layer, der neben oder auf** solchen Plattformen Wert schafft, nicht als deren Formular-Ersatz. [Marktbild §3]
4. **Der Kanal entscheidet den Zugang, nicht das Produkt.** Komm.ONE-Kommunen kaufen ohne eigenes Vergabeverfahren über die Rahmenvereinbarung. Ein Solo-Direktvertrieb ist strukturell benachteiligt. → **White-Label-/Mandanten-Fähigkeit früh mitdenken** (Tenant + Theming ist ohnehin auf der Roadmap), damit der IT-Dienstleister-Kanal später ohne Umbau offensteht. [Marktbild §3]
5. **Compliance: mehr Luft als gedacht, aber ein Design-Zwang.** Die EU-AI-Act-Recherche (Marktbild-Addendum §1) zeigt: ein Anspruchs-*bewertender* Precheck ist sehr wahrscheinlich Hochrisiko (Anhang III Nr. 5a) — aber die volle Pflichtenkaskade greift durch den Digital Omnibus voraussichtlich erst ab **02.12.2027** (Transparenzpflicht Art. 50 schon 08/2026), nicht 08/2026. **Design-Zwang:** Vorbefüllung/Extraktion architektonisch sauber von jeder Anspruchs-/Betragsaussage trennen und die menschliche Letztentscheidung dokumentieren (Muster „wohni") — das hält die „vorbereitende Aufgabe"-Ausnahme argumentierbar. → Compliance als **parallelen Track** mit realistischem Zeithorizont statt Panik; das Pilot-Datum hängt näher an DPA/DPIA/DSB als am AI Act. **Unsere Lesart, anwaltlich zu bestätigen.**

## Produkt-Ideen & Wetten (was zu bauen sich lohnt)

Priorisiert nach „trifft die Marktlücke × nutzt Gebautes × Solo-machbar":

- **Der „Vorgang" als Produktkategorie besetzen.** Sprache prägt Wahrnehmung: nicht „noch ein Formular-Tool", sondern „der Bürger-Vorgang von Antrag bis Bescheid". Die `case_event`-Spine ist der technische Beleg; die Story ist das Verkaufsargument gegen Formular-Silos. [goal.md Prinzip 1]
- **Wohngeld-Copilot als beweisbare Referenz.** Mehrsprachig, Precheck, „nur die wirklich fehlenden Nachweise" — die sichtbare Wow-Fläche. Corpus (`info_rag` Wohngeld) und Template existieren. Eine exzellente Referenz schlägt zehn Feature-Ankündigungen. [Positionierung Option 3]
- **Der Rückkanal als Differenzierer, sobald FIT-Connect-Rückkanal live ist.** Zwei-Wege-Kommunikation (Rückfrage, Nachweis-Nachforderung, Bescheid) ist genau das, was die Formular-Silos nicht bieten — und der bindende Standard existiert (gültig ab 2026-04-01). Der Bau-Slot ist offen (Marktbild §5 unbestätigt, aber roadmap-spezifiziert). [target-arch D10]
- **„Nur was fehlt"-Nachweis-Intelligenz** als konkretes KI-Wertversprechen gegenüber dem Backoffice: weniger Nacharbeit, weniger Rückläufer. Das ist ein Sachbearbeiter-Nutzen, kein Bürger-Gimmick — und Sachbearbeiter-Zeitersparnis ist das, was Kommunen kaufen.
- **Cross-Fachverfahren-„Verbindungsnetz" als 3-5-Jahres-Narrativ**, geerdet im belegten Schmerz (~20.000 isolierte Fachverfahren; Bundesdruckerei: „verfahrensübergreifend, nicht verfahrensintern"). Heute IOU, aber die glaubwürdige Nordstern-Story. [Marktbild §2.3]
- **Provably-safe AI als Vertrauens-Asset im öffentlichen Sektor.** Deklaratives BITV-sicheres Rendering + Zitate + Human-in-the-Loop + Audit ist nicht nur Technik, sondern **Verkaufsargument** in einem Markt, der KI misstraut. Wenn der EU AI Act High-Risk-Pflichten bringt, wird „nachweisbar sicher" vom Kostenfaktor zum Differenzierer.

## Best Practices für die zukünftige Arbeit

**Engineering / Betrieb (das Solo+AI-Modell tragfähig halten):**
- **Fail-cheap-Zwei-Gate-Disziplin beibehalten.** Teure Foundations erst nach dem Markt-Gate, Live-PII erst nach dem Pilot-Gate. Das schützt die knappste Ressource (Zeit) vor Verbrennung an ungevalidierten Wetten. [goal.md Prinzip 3]
- **„Nachweisen, nicht behaupten".** Die Verifikations-Disziplin dieser Sessions (tsc/pytest-Baselines, echte Ausführung, FACT/ASSESSMENT-Trennung, ehrliche NICHT-VERIFIZIERT-Kennzeichnung) ist im öffentlichen Sektor ein **Trust-Asset**, kein Overhead. Beibehalten.
- **Dokumentation als Source-of-Truth.** Das Multi-Agent-Entwicklungsmodell funktioniert nur, weil `goal.md` + Roadmap + Task-Karten + diese Analysen durable Grounding liefern. Diese Docs pflegen ist Produktivarbeit, kein Nebenschauplatz.
- **Multi-Agent-Orchestrierung als Betriebsrhythmus.** Das Muster Research → Challenge → Judge → Plan → parallele Umsetzung → adversariales Review → Auto-Fix hat in diesen Sessions real Code geliefert und Fehler gefangen, die Einzel-Agenten übersahen. Das **ist** der Kostenhebel gegenüber einem Team — bewusst als Operating Model nutzen.
- **Kosten früh instrumentieren.** Der N-Services-×-M-Sprachen-Übersetzungskostenrisiko ist real; der measure-only-Cost-Hook (T-19) sollte nicht bis Phase 3 warten, wenn LLM-Volumen steigt. [Positionierung Risiken]

**Go-to-Market (die Vergabe-Realität ernst nehmen):**
- **Eine Referenz vor Breite.** Ein zahlender, zitierbarer Wohngeld-Pilot schlägt jede Feature-Liste. Der Markt kauft Referenzen, nicht Roadmaps.
- **White-Label-Fähigkeit als Architektur-Default,** nicht als späteres Add-on — der IT-Dienstleister-Kanal ist die Vergabe-Abkürzung.
- **EU-AI-Act-Einordnung SOFORT klären** (Rechtsauskunft/FITKO/Behörden-Leitfaden). Sie kann Pflichten oder Chancen bedeuten — beides muss man kennen, bevor man das Pilot-Datum plant.
- **Open-Source als Option offenhalten,** nicht jetzt ziehen: potenzieller Vergabe-/Trust-Vorteil, aber verwässert den kommerziellen Moat. Entscheidung nach der ersten Referenz. [Positionierung Asset 7]

## Aussichten (3-5-Jahres-Fenster, ehrlich)

**Das Fenster ist offen [ASSESSMENT]:** Solange OZG 2.0 / EfA kleine Kommunen unterversorgen (nur ~5% der Prioleistungen live, Positionierung/Chancen) und die Incumbents Content-Bibliothek + die KI-Player Auskunft bleiben, existiert die End-to-End-KI-Vorgangs-Lücke weiter. Der belegte Fachverfahren-Schmerz (~20.000 isoliert) wächst eher, als dass er sich schließt.

**Was in 3-5 Jahren erreichbar ist (eigene Kontrolle):** der volle Vorgang (case_event → FSM → Tracker → Bescheid via FIT-Connect-Rückkanal), gehärtete Generative-UI, mehrsprachiger barrierefreier Dialog, Kommune-#2-ohne-Code. Alles Bau-, kein Forschungsrisiko. [Positionierung §Vision]

**Was fremdbestimmt bleibt:** „exponentielle Skalierung" hängt an Cross-Kommune-Fork + FIM-Import (heute Stub — bis dahin linear); proaktive Lebenslagen-Services brauchen verifizierte Attribut-Quellen (BundID/Registry-Events); das „Verbindungsnetz" braucht mehr als den einen Legacy-Pfad live. Diese hängen an Markt-/Regulierungs-Entwicklung. [Positionierung §Vision]

**Die drei Risiken, die das Fenster schließen könnten:**
1. **Der Wettbewerb ist näher als gedacht — nicht die Formular-Hersteller, sondern ein Wohngeld-Startup.** Die Recherche (Marktbild-Addendum §4) korrigiert das Bild: im Zielsegment ist **forml/„Wohni"** bereits produktiv (Frankfurt/Hannover/Potsdam/Düsseldorf-Direktvergabe, gebündelt im BMDS Agentic AI Hub), und **Tübingen — die Pilotstadt — hat bereits einen konkurrierenden Wohngeld-KI-Piloten** (Kölner Startup). Von den Formular-Herstellern hat nur cit (intelliForm KIM, 06/2026) einen Bürger-GenAI-Dialog gelauncht. Konsequenzen: (a) die lokale Konkurrenzlage in Tübingen **sofort** prüfen; (b) nicht auf „wir haben auch einen Chat", sondern auf **End-to-End-Vorgang (Bescheid/Rückkanal) + Wohngeld-Tiefe + Compliance-by-Design** differenzieren — genau die Flächen, die forml (Sachbearbeiter-Assistenz, Endentscheidung beim Menschen) und cit (Dialog ohne Vorgang) heute nicht besetzen. Gegenmittel bleibt: Execution-Speed + a11y/Trust + Vorgangs-Vorsprung (Prozess-, kein IP-Moat). [Positionierung Assets]
2. **Bus-Faktor 1:** Solo, Teilzeit. Das größte Einzelrisiko. Gegenmittel: das AI-Agent-Modell so dokumentieren und automatisieren, dass Wissen im Repo (nicht im Kopf) liegt; früh über einen zweiten Menschen oder engen Partner nachdenken.
3. **Compliance-Timeline:** DPA/DPIA/DSB + evtl. EU-AI-Act-High-Risk dominieren das Pilot-Datum stärker als jeder Code-Move. Gegenmittel: Compliance als paralleler Track ab jetzt, nicht als Phase-3-Anhang.

## Verzahnung mit dem Alltag (damit die Vision führt)

- **`goal.md` bleibt der Nordstern** — dieses Dokument ändert nichts an der Vision, es schärft nur den *Weg*: Wedge (Wohngeld) → Referenz → End-to-End → Kanal (IT-Dienstleister) → Verbindungsnetz.
- **Nächste konkrete Nicht-Code-Schritte** (parallel zur technischen Roadmap): (a) EU-AI-Act-Einordnung klären; (b) 2-3 Kandidaten-Kommunen mit EfA-Frust identifizieren (offene Recherche-Lücke Marktbild §5.6); (c) ein Gespräch mit einem kommunalen IT-Dienstleister über das White-Label-Modell; (d) die offenen Marktbild-Lücken (Preise, Wettbewerber-KI-Roadmaps, Rückkanal-Infrastruktur) gezielt nachrecherchieren.
- **Die technische Roadmap ändert sich nicht** — sie wird nur durch die Markt-Linse priorisiert: alles, was den Wohngeld-Wedge zur beweisbaren Referenz macht, hat Vorrang; alles, was nur „mehr Plattform" ist, wartet aufs Markt-Gate.

## Zusammenhang der drei Dokumente

| Dokument | Frage | Quelle |
|---|---|---|
| `2026-07-07-openadvo-positionierung.md` | Was sind wir, wo ist unser Platz? | intern (Code + Docs) |
| `2026-07-07-openadvo-marktbild.md` | Wer besetzt den Markt, wo ist die Lücke? | extern (verifizierte Quellen) |
| `2026-07-07-openadvo-aussichten.md` (dieses) | Wie arbeiten wir darauf hin? | Synthese + `goal.md` |
