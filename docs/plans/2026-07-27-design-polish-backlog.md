# Design-, UX- und Performance-Backlog

Date: 2026-07-27 · Status: **Umgesetzt** — siehe „Umsetzungsstand" unten

> **Stand nach der Umsetzungsrunde:** Alle Top-10-Punkte und der Großteil der
> Themen A–G sind erledigt. Was offen bleibt und warum, steht am Ende unter
> [Bewusst offen](#bewusst-offen). Die Abschnitte darunter sind das
> ursprüngliche Audit und bleiben als Begründung stehen.

Ergebnis eines 7-dimensionalen Audits (Visual, UX/IA, Performance, Motion,
Accessibility, Publishing-System, SEO/Shareability) über den gesamten Code-Stand.
104 Rohbefunde, dedupliziert und nach Wirkung/Aufwand sortiert.

**Lesehilfe zur Verlässlichkeit:**

- ✅ **verifiziert** — im Browser oder am Build reproduziert, Zahl selbst nachgerechnet.
- 🔍 **belegt** — Datei und Zeile geprüft, Wirkung plausibel abgeleitet.
- 💭 **Vorschlag** — Gestaltungsidee, keine Fehlermeldung.

Aufwand: S = unter einer Stunde · M = ein halber Tag · L = eigenständige Aufgabe.

---

## Bereits in dieser Session erledigt

| Was | Datei |
|---|---|
| ✅ **Cormorant hat noch nie gerendert.** Tailwind v4 nutzt `--font-*`, nicht `--font-family-*` — `font-serif` fiel auf `ui-serif, Georgia` zurück, während Cormorant auf jeder Seite preloaded wurde. Alle 154 Serif-Headlines liefen in Georgia. | [src/app/globals.css](src/app/globals.css) |
| ✅ Jede MDX-Überschrift wurde als violetter, unterstrichener Link gerendert (`rehype-autolink-headings` mit `behavior: "wrap"`). Betraf Journal, Library und Stories. | [src/app/globals.css](src/app/globals.css) |
| ✅ Footer-Links unter WCAG AA: `text-oe-pure-light/40` = 3,65:1 (nachgerechnet), jetzt `/50` = 5,07:1. Dazu 44px-Touch-Targets und der tote `/legal/terms`-Link entfernt. | [src/components/layout/Footer.tsx](src/components/layout/Footer.tsx) |
| ✅ `Callout` trug den `border-l-4`-Seitenreiter — das bekannteste Template-Signal. Jetzt Hairline + Tint. | [src/lib/content/mdx.tsx](src/lib/content/mdx.tsx) |
| ✅ Unquotierte YAML-Daten (`date: 2026-07-27`) ließen den Build mit einem Zod-Fehler platzen. `DateString` normalisiert beides. | [src/lib/schemas/content.ts](src/lib/schemas/content.ts) |
| ✅ Das Story-System selbst (siehe unten). | — |

---

## Top 10 — zuerst

1. ✅ **`/journal` ist ein 404.** Es gibt nur `layout.tsx` und `[slug]/`, keine `page.tsx`. Schlimmer als ein toter Link: Weil `journal/[slug]/generateMetadata` nur Titel und Description zurückgibt, erbt **jeder** Artikel `alternates.canonical` aus dem Layout und sendet `<link rel="canonical" href="…/journal">` — auf eine 404-URL. Das ist die stärkste denkbare Anweisung an Google, den Artikel zu deindexieren. Die Sitemap bewirbt `/journal` zusätzlich. Entweder `journal/page.tsx` anlegen oder `alternates`/`openGraph.url` aus [journal/layout.tsx](src/app/(marketing)/journal/layout.tsx) entfernen und pro Artikel setzen. **S**

2. 🔍 **Der Root-Canonical behauptet, jede Seite sei die Startseite.** [src/app/layout.tsx](src/app/layout.tsx) setzt `alternates.canonical = baseUrl`; jede Route ohne eigenen Canonical erbt ihn. `/content`, `/library`, `/library/[type]/[slug]` und `/experiences` deindexieren sich damit selbst. `alternates` aus dem Root löschen, pro Seite setzen (relative Pfade lösen gegen `metadataBase` auf). **S**

3. ✅ **Der Blanket-`prefers-reduced-motion`-Nuke steht trotz explizitem Verbot in [globals.css](src/app/globals.css).** `.agents/skills/frontend-workflow/SKILL.md` Constraint 2 verbietet ihn namentlich. Er nützt nichts — framer-motion animiert über WAAPI und rAF, die CSS-`animation-duration` nicht erreicht. Er *zerstört* genau die Micro-Feedback-Transitions, die Still-Mode behalten soll, und friert beide `animate-spin`-Loader ein: Wer im Kontaktformular sendet, sieht 1,2 s einen stehenden Kreis. Nur den `*`-Block löschen, die gezielte `.oe-atmosphere__*`-Regel behalten. **S**

4. 🔍 **34 von 42 framer-motion-Komponenten ignorieren den Still-Mode.** Die Durchsetzung ist CSS, das framer-motion umgeht. In `IntensityProvider` `<MotionConfig reducedMotion={effectiveMode === 'still' ? 'always' : 'never'}>` legen — ein Import, ein Element, wirkt auf alle 42. `useMotionLevel` bleibt der Ebenen-Gate pro Komponente. **S**

5. 🔍 **Lenis Smooth-Scroll kennt keinen Gate.** 1,2 s Inertia bei jedem Wheel-Tick — auch für `prefers-reduced-motion` und für Nutzer, die bewusst Still gewählt haben. Es ist die einzige Bewegung, die kein Schalter erreicht, und ausgerechnet die vestibulär kritischste. In [SmoothScroll.tsx](src/components/layout/SmoothScroll.tsx) `useMotionLevel('flow')` lesen, sonst als `<>{children}</>` durchreichen und den Import in den Effect ziehen (spart das Bundle gleich mit). **S**

6. ✅ **Nichts wird statisch vorgerendert.** Der Build zeigt jede Route als `ƒ`. Ursache: `cookies()` in [src/i18n/request.ts](src/i18n/request.ts) macht den ganzen Baum dynamisch. Jeder Unfurl-Bot von WhatsApp, Slack und LinkedIn löst damit einen vollen Server-Render inklusive MDX-Kompilierung aus — bei ~5 s Timeout und ohne Retry. Genau der Fall, für den die Story-Links gedacht sind. **Das ist die eine Aufgabe mit einer echten Produktentscheidung davor**: Cookie-basiertes EN-Umschalten für Marketing-Seiten aufgeben, oder auf `[locale]`-Segmente umstellen. Nicht nebenbei lösen. **L**

7. 🔍 **Kein `robots.ts`.** `/robots.txt` liefert 404, die Sitemap ist für Crawler unauffindbar, und nichts hält `/portal`, `/inner` und `/auth` aus dem Index. **S**

8. 🔍 **Sentry Session Replay liegt eager im Root-Bundle** ([src/instrumentation-client.ts](src/instrumentation-client.ts)) — rrweb, ~150 KB gzip, vor allem anderen, bei `replaysSessionSampleRate: 0.1`. Für 9 von 10 Sessions reine Last auf dem Main Thread während der Hydration. Auf `lazyLoadIntegration` umstellen. **S**

9. 🔍 **`published: false` ist beim Journal wirkungslos.** [getPosts()](src/lib/content/index.ts) filtert nicht. Ein Entwurf erscheint auf `/content`, `/library`, der Startseite und in der Sitemap. Das Feld existiert, validiert — und tut nichts. Die drei Content-Systeme haben drei verschiedene Bedeutungen von „unveröffentlicht": Journal ignoriert das Flag, Sacred Content versteckt die Liste aber liefert die Seite aus, Stories geben 404. Auf eine Regel bringen. **S**

10. 🔍 **Kein `not-found.tsx`.** Acht Aufrufstellen rufen `notFound()`, keine hat eine Boundary — jeder 404 landet auf Nexts weißer Systemseite. Auf einer Seite, deren These „Dunkelheit ist Raum" ist, der härtestmögliche Bruch. **S**

---

## A · Korrektheitsfehler

| | Befund | Aufw. |
|---|---|---|
| 🔍 | **`/content` und `/library` zeigen dieselben Artikel unter zwei URLs.** `/content` ist aus der Navigation verwaist, steht aber mit Priorität 0.8 in der Sitemap; `/library` fehlt darin ganz. Die Artikel-Rückwärtsnavigation führt auf die verwaiste Variante. Jeder Journal-Post lebt zusätzlich unter `/journal/<slug>` **und** `/library/journal/<slug>`. Eine URL wählen, die andere per `redirects()` umleiten — `next.config.ts` hat noch gar keinen `redirects`-Key. | M |
| 🔍 | **Drei tote `href="#"`-CTAs auf `/community`** — der Conversion-Seite. Das 3-Schritt-Versprechen „Ankommen → Verbinden → Gestalten" führt nirgendwohin, und die Seite erwähnt das Portal nicht, das Mitgliedschaft tatsächlich implementiert. | S |
| 🔍 | **Kontakt- und Newsletter-Formular simulieren nur.** `setTimeout`, dann eine Erfolgsmeldung: „Deine Nachricht ist bei uns angekommen." Es wird nichts zugestellt. Kein Error-Zweig — ein echter Backend-Fehler würde weiterhin Erfolg anzeigen. Newsletter sammelt eine E-Mail ohne Consent-Checkbox und ohne Datenschutz-Link. **Das ist der eine Punkt mit rechtlicher Kante.** | M |
| 🔍 | **Alle Events liegen über ein Jahr in der Vergangenheit**, werben weiter mit „18 Plätze", und beide Buttons pro Karte tun nichts. Vorsicht bei der naheliegenden Lösung: `new Date("12. April 2025")` ist `Invalid Date` — es braucht erst ein maschinenlesbares Feld. | M |
| 🔍 | **Doppeltes `\| OneEmergence` im Title** an vier Stellen (Journal-Artikel, beide Library-Zweige, `/content`) — das Root-Template liefert den Marken-Suffix bereits. Google schneidet bei ~60 Zeichen ab, weg ist genau der Teil, der den Klick verdient. | S |
| 🔍 | **Die sechs Sacred-Content-Renderer laufen nie.** Sie sind aus dem Barrel exportiert, den ein Agent natürlicherweise importiert. Wer `TeachingRenderer.tsx` ändert, sieht keine Wirkung — die Route rendert inline. Entweder löschen oder durchrouten. | M |
| 🔍 | **Der Library-Typfilter kennt nur zwei von sechs Typen.** Sobald etwas in `practices/`, `transmissions/`, `essays/` oder `journeys/` landet, erscheint es als „Journal". Ein Journal-Eintrag bekommt auf `/library` einen grünen Punkt und auf der Detailseite einen violetten. Ein `TYPE_META` für beide Seiten. | S |
| 🔍 | **`tailwind.config.ts` wird gar nicht geladen** — kein `@config` in `globals.css`, Tailwind v4 liest die JS-Config nicht. Eine zweite, still ignorierte Farbtabelle ist genau die Falle, die auch mich in dieser Session einmal erwischt hat. Löschen. | S |
| 🔍 | **`--background` ist per Default hell.** Auf einem OS mit heller Einstellung zeichnet die Error-Boundary `#F7F8FB` auf `#F7F8FB` — eine leere Fehlerseite. Light Mode wurde nie gestaltet, die Tokens tun aber so. Deep Space in `:root`, `prefers-color-scheme: dark` streichen. Dazu `color-scheme: dark` global, statt des Inline-Hacks auf `/contact`. | S |

## B · Visual Craft

| | Befund | Aufw. |
|---|---|---|
| 🔍 | **51 Textstellen unter der Alpha-Schwelle, die der Footer selbst dokumentiert** — 14 verschiedene Alphastufen einer Farbe, also keine Skala, gegen die man konsistent sein könnte. Zwei semantische Tokens (`--color-oe-fg-muted` = /60, `--color-oe-fg-subtle` = /50) und dann sweepen; `/40` und darunter nur noch dekorativ. | L |
| 🔍 | **Das Eyebrow-Specimen driftet über fünf Tracking-Werte und drei Größen.** Es steht über fast jedem Abschnitt — also die sichtbarste Inkonsistenz überhaupt: `/about` 0.1em, `/experiences` 0.4em. Eine `.oe-eyebrow`-Klasse. | M |
| 🔍 | **Sieben Container-Breiten und uneinheitliche Gutter.** Unter 640px springt die Inhaltskante beim Scrollen um 8px; die Wortmarke sitzt im Header 24px, im Footer 16px vom Rand. Auf `px-4 sm:px-6` und drei benannte Breiten vereinheitlichen. | M |
| 🔍 | **Acht improvisierte Hero-Maßstäbe.** `/about` reserviert einen vollen Viewport für vier Zeilen, `/contact` 40vh für dieselbe Rolle, `/library` hat gar keinen. Die h1 landet auf jeder Seite auf anderer Höhe — Navigieren fühlt sich an wie Seitenwechsel zwischen Websites. Ein `<PageHero>` mit `size="full" \| "standard"`. Der `/s`-Header zeigt die Form bereits. | M |
| 💭 | **Nur zwei Momente auf der ganzen Site brechen die zentrierte Spalte** (die alternierenden Reihen auf `/manifesto` und `/about`). Sonst überall dasselbe vertikale Band aus zentriertem Text über `rounded-2xl`-Karten — keine Seite hat eine eigene Silhouette. Vorschlag: den linksbündigen Editorial-Header von `/s` für die Index-Seiten übernehmen, zentrierte Heroes als bewusstes Signal für `/`, `/manifesto`, `/brand` behalten. | L |
| 🔍 | **Die zehn `.glow-*`-Utilities sind tot**, während sechs handgeschriebene `radial-gradient`-Literale die Token-Werte per Hand duplizieren. `.glow-interactive` feuert nirgends. Entweder verdrahten oder löschen. | M |
| 🔍 | **Der Custom Cursor ist in Tailwinds `purple-500` gemalt**, nicht in `oe-aurora-violet` — das einzige Element, das der Besucher dauerhaft ansieht, ist off-brand. Zusätzlich Raw-Hex in einer Komponente. | S |
| 🔍 | **Fünf konkurrierende Accent-Maps.** Kartenrahmen sind `/20` auf `/experiences`, `/30` auf `/community`, `/40` auf `/events`, `/25` in `ACCENTS`. `ACCENTS` nach `src/lib/accents.ts` heben und die fünf lokalen Maps darauf zeigen lassen. | M |
| 🔍 | **Sechs Pill-Treatments für dieselbe Rolle** — drei Radien, vier Paddings. Keine der handgebauten erbt den `focus-visible:ring` aus `button.tsx`, Tastaturfokus ist dort unsichtbar. Eine `quiet`-Variante in `button.tsx`. | M |
| 🔍 | **Die Brand-Page behauptet Unwahres über sich selbst**: `--oe-transition-base` hat null Konsumenten, alle 300ms sind hardcodierte `duration-300`. Wer die Tokens ändert, ändert nichts. | M |
| 🔍 | **Favicon ist noch das create-next-app-Dreieck.** Slack, Teams und Mailclients zeigen es neben dem Unfurl — ein Link an einen Geschäftskontakt trägt sichtbar Next.js-Branding. Kein `apple-icon`, kein Manifest. Achtung: das Quell-Logo ist 1,27 MB und muss runterskaliert werden. | M |

## C · Motion & Smoothness

| | Befund | Aufw. |
|---|---|---|
| 🔍 | **`data-intensity` steht erst nach der Hydration am `<html>`.** Bis dahin greift kein einziger CSS-Gate: Still-Mode-Nutzer sehen die volle Atmosphäre, und beim Umschalten schnappt die Seite sichtbar um. Die Seite, die am ruhigsten sein soll, hat den auffälligsten Hydration-Snap. Standard-No-Flash-Pattern: Inline-Script im `<head>`, das `localStorage['oe-intensity-mode']` plus `matchMedia` liest. **Löst gleichzeitig B, C und E** — die Atmosphären-Grafik wird dadurch auch für den Preload-Scanner sichtbar statt erst nach der Hydration nachzuladen. | M |
| 🔍 | **Die Hero-Headline wird mit `opacity: 0` ausgeliefert** und ist das LCP-Element. Sie kann erst malen, wenn React hydriert ist plus 400 ms Delay. Bei JS-Fehler bleibt der Hero dauerhaft leer. `opacity: 0` aus `initial` nehmen (nur `y` animieren) und mit `useMotionLevel('flow')` gaten. | M |
| 🔍 | **`StarField` liest `document.documentElement.scrollHeight` in jedem Scroll-Event.** Weil Lenis die Seite per `scrollTo` einmal pro Frame treibt, ist das ein erzwungener Reflow pro Frame auf der Startseite — zusammen mit Canvas-Repaint, Lenis-rAF und Hero-Transform. `maxScroll` in eine Ref, einmal in `handleResize`. | S |
| 🔍 | **`ScrollIndicator` hat keinen Gate und kein `data-motion-level`** — die eine dauerhaft hüpfende Sache auf der Landing Page ist die, die den Still-Mode überlebt. Plus hardcodiertes „Entdecken". | S |
| 🔍 | **`CustomCursor` animiert `width`/`height`/`boxShadow`** statt `scale` — nicht kompositierbar, auf einem Layer, der ohnehin jeden Frame bewegt wird. Nebenbei ein Bug: `scale` **und** `width` sind beide aktiv, der Ring springt auf 2,25× statt 1,5×. | S |
| 🔍 | **`MagneticButton` weicht dem Zeiger auch im Still-Mode aus.** Die Verschiebung ist ein direkter MotionValue-Write, den weder CSS-Gate noch `MotionConfig` erreichen. Für Menschen mit Tremor ein bewegliches Ziel in der Hauptnavigation — und mit `cursor: none` gibt es dann keinen Zeiger, nur einen mitwandernden 8px-Punkt. Explizit `useMotionLevel('flow')` nötig. | S |
| 🔍 | **`ParallaxImage` liest `matchMedia` während des Renders** → Hydration-Mismatch auf jedem Touch-Gerät. Den `useSyncExternalStore`-Hook aus `CustomCursor` nach `src/hooks/usePointerType.ts` ziehen. | S |
| 🔍 | **Lenis schluckt Nexts Scroll-to-Top**, wenn navigiert wird, während die Inertia noch läuft — man landet mitten in der frisch geöffneten Seite. Ein Konstruktor-Flag: `stopInertiaOnNavigate: true`. | S |
| 🔍 | **`template.tsx` läuft ungegated** und hält 400 ms lang einen Transform — der wird damit zum Containing Block für jedes `position: fixed` darin. Kurzfristig gaten. Next 16 View Transitions wären der bessere Ersatz, aber als eigene Aufgabe. | M |
| 🔍 | **`AmbientOrb` und `ParallaxLayer` rendern nirgends.** Ungegatete Endlos-Loops als Vorlage herumliegen zu lassen lädt zur Wiederverwendung ein. Löschen oder verdrahten. | S |

## D · Accessibility

| | Befund | Aufw. |
|---|---|---|
| 🔍 | **`cursor: none !important` auf `*`** trifft jeden Desktop-Besucher ab dem ersten Frame — Balanced ist Default. Drei konkrete Verluste: der vom Nutzer angepasste OS-Cursor (Größe, Farbe, Kontrast) ist weg; die vier Textfelder im Kontaktformular zeigen keinen I-Beam; der einzige Ausweg ist Still-Mode, der die gesamte Gestaltung mitabschaltet. In `forced-colors` bleibt gar kein Zeiger. Mindestens Formularfelder ausnehmen, `forced-colors`-Rückfall, und einen eigenen Schalter. Dazu: zwischen dem Setzen von `data-intensity` und dem ersten `mousemove` ist überhaupt kein Zeiger sichtbar — wer per Tastatur ankommt, sieht nie einen. | M |
| 🔍 | **Das Textfeld und der Senden-Button des AI-Guide haben keinen Namen** (SC 4.1.2/3.3.2). Screenreader hören „edit, blank" und „button". Das Kernfeature ist nicht nicht-visuell bedienbar. | S |
| 🔍 | **Der Guide-Verlauf hat keine Live-Region** (SC 4.1.3) — keine Ansage, dass gesendet wurde, dass geantwortet wurde oder dass es fehlschlug. Jetzt festlegen, bevor Phase 2 Token-Streaming einbaut, sonst wird daraus Stille oder ein Ansage-Sturm pro Token. | S |
| 🔍 | **Sechs Controls nutzen blankes `outline-none`** (nicht `focus-visible:outline-none`) und ersetzen es durch einen 1,3:1-Rahmen — Tastaturfokus ist praktisch unsichtbar, inklusive Guide-Composer und aller Map-Dialoge. | S |
| 🔍 | **Der `IntensityToggle` ist eine Radiogroup ohne Roving-Tabindex und ohne Pfeiltasten** — AT kündigt „Radio 1 von 3" an, und die Pfeiltasten tun nichts. `aria-checked` folgt `mode` statt `effectiveMode`: Wer OS-seitig reduzierte Bewegung hat, hört „Balanced, ausgewählt", während Still läuft. Alle Labels hardcodiert deutsch. Ausgerechnet das Bedienelement für Barrierefreiheit. | M |
| 🔍 | **Kontaktformular: Nach dem Absenden verschwindet der Fokus** — er fällt auf `<body>`, die einzige Rückmeldung ist visuell. Erfolgs-Container `role="status"` + `tabIndex={-1}` + fokussieren. | M |
| 🔍 | **Der axe-Scan kann an keinem dieser Befunde scheitern**: getaggt sind nur `wcag2a`/`wcag2aa` (also kein WCAG 2.1/2.2, kein `target-size`), gefiltert wird auf `critical\|serious` (also fällt `heading-order` raus), und gescannt wird nur im Balanced-Mode. Genau deshalb ist all das nie aufgefallen. | S |
| 🔍 | **h1→h3-Sprünge** auf der Startseite und `/experiences`; `/inner/guide` hat gar keine h1. | S |
| 🔍 | **Die Guide-Rollenauswahl kommuniziert Auswahl nur über Farbe** (SC 1.4.1) und exponiert keinen Pressed-State (SC 4.1.2). | S |
| 💭 | **Kein `prefers-contrast`- oder `forced-colors`-Layer.** In Windows High Contrast verschwinden alle Gradient-Wash-Ebenen, während die 5–15%-Alpha-Rahmen im erzwungenen Hintergrund kollabieren — Karten und Felder verlieren ihre Begrenzung. | M |

## E · Performance

| | Befund | Aufw. |
|---|---|---|
| 🔍 | **MDX wird pro Request zweimal kompiliert** — `generateMetadata` und der Page-Body rufen denselben Loader. Mit `cache()` aus `react` umschließen. *Einschränkung:* `cache()` dedupliziert nur innerhalb eines Render-Passes, nicht über den Build hinweg; gegen die wiederholten Verzeichnis-Scans hilft nur Modul-Level-Memoisierung. | S |
| 🔍 | **Drei komplette Marketing-Seiten sind Client-Islands, nur um `router.push` aufzurufen.** ~700 Zeilen statischer Text plus Hydration, wo ein `<Link>` genügt. `/contact` hat echten State und bleibt Client. | M |
| 🔍 | **`ContentGrid`-Cover haben kein `sizes`** — der Browser holt den 1920w-Kandidaten für einen ~440px-Slot, auf der Startseite, im LCP-Fenster. | S |
| 🔍 | **`next.config.ts` hat keinen `images`-Block** — AVIF ist site-weit aus, und ohne `remotePatterns` für den Supabase-Host bleiben drei Avatare bei rohem `<img>` samt eslint-disable. | S |
| 🔍 | **`ForceGraph` importiert das ganze `d3`-Meta-Paket** statt `d3-zoom`/`d3-selection`; unter pnpms striktem Layout hält der Umbrella alle Geschwister am Leben. Dazu ist die Consciousness Map statisch importiert — `next/dynamic` kommt im ganzen Repo nicht vor. | S |
| 🔍 | **`build:analyze` läuft auf der eigenen Plattform nicht** (`ANALYZE=true next build` ist keine PowerShell-Syntax). Vermutlich der Grund, warum der Sentry-Chunk nie auffiel. `cross-env`. | S |
| 💭 | **Der volle Message-Bundle liegt im Payload jeder Seite** — Portal-Routen tragen die Marketing-Namespaces mit und umgekehrt. | M |

## F · Shareability & SEO

| | Befund | Aufw. |
|---|---|---|
| 🔍 | **Journal-Artikel haben keine eigene OG-Karte.** Drei verschiedene Artikel erzeugen drei identische Unfurls mit „Journal \| OneEmergence". Die OG-Karten-JSX aus dem Story-Renderer nach `src/lib/og/card.tsx` heben und für Journal wiederverwenden — das Muster steht bereits. Den Site-Default als statisches PNG lassen (billiger für Unfurl-Bots). | M |
| 🔍 | **Sitemap-Widersprüche:** zwei `noindex`-Legal-Seiten werden aktiv eingereicht (Search Console wertet das als Fehler und misstraut der ganzen Sitemap), `/library` und `/experiences` fehlen, fünf der sechs Sacred-Content-Typen sind für Suche unsichtbar, und jedes `lastModified` ist der Build-Timestamp. | S |
| 🔍 | **Neun Dateien mit 16 hartcodierten `https://oneemergence.org`**, während `siteUrl` in `src/lib/env.ts` validiert bereitliegt. Jeder Preview-Deploy sendet Produktions-Canonicals. *Achtung:* `env.ts` überspringt die Prod-Prüfung während `next build` und fällt auf `localhost:3000` zurück — der Umbau braucht eine Build-Zeit-Zusicherung, sonst wird es schlechter als jetzt. | M |
| 💭 | **Kein JSON-LD.** Kein `Organization` (kein Knowledge Panel, kein Logo neben der Marke), kein `Article` (keine Autor/Datum-Anreicherung) — genau die Glaubwürdigkeitssignale, die zählen, wenn ein Geschäftskontakt einen Link prüft. Erst nach den Canonical-Fixes sinnvoll. Für unlistete Stories nicht ausgeben. | M |
| 🔍 | **Root-Metadata ist deutsch, auch für EN-Besucher** — `<html lang="en">` um einen deutschen `<title>` und `og:locale=de_DE`. Weil die Locale in einem Cookie steckt, gibt es ohnehin keine EN-URL und damit kein hreflang. | M |
| 💭 | **Kein RSS/Atom-Feed.** Ehrlich eingeordnet: bei drei Journal-Posts und zwei Stories der Punkt mit dem geringsten Ertrag. | M |

## G · Publishing-System

| | Befund | Aufw. |
|---|---|---|
| 🔍 | **Bei ungültigem Frontmatter nennt der Build die Datei nicht.** Ein fehlendes `excerpt` bricht `next build` mit einem nackten `ZodError: excerpt Required` aus der Sitemap heraus — der Autor muss von Hand bisektieren. Zusätzlich widersprechen sich zwei Pfade über dieselbe kaputte Datei: `getAllContent` bricht den Build ab, `getLibraryItems` schluckt sie. Ein `parseContentFile(schema, data, filePath)`-Helfer. | S |
| 🔍 | **`ContentMeta.published` ist per Default `false`.** Wer das Flag vergisst, ist in `/library` unsichtbar — aber `/library/<type>/<slug>` liefert die Seite trotzdem aus und indexiert sie. Versehentliche Veröffentlichung ist damit der wahrscheinliche Pfad, nicht das bewusste Entwerfen. | S |
| 🔍 | **Das MDX-Kit greift außerhalb von `/s` nicht.** Journal und Library setzen `.oe-prose` nicht, also fallen `oe-wide`/`oe-full` in sich zusammen. Noch niemandem aufgefallen, weil kein Journal-File das Kit nutzt — ein Vertrag, der auf den ersten Autor wartet. `oe-prose` in `ContentRenderer` und `journal/[slug]` ergänzen. | M |
| 🔍 | **Eine reine Infoseite braucht heute `.md` *und* `page.tsx` *und* hartcodierte deutsche Strings im TSX.** `getPage` wirft das Frontmatter weg, das diese Strings tragen würde. Ein Catch-All `legal/[slug]/page.tsx` mit `PageMeta`-Schema — dann ist auch das eine Datei. (Der `robots: noindex` der Datenschutzseite muss dabei mitwandern.) | M |
| 💭 | **Kein Preview für Unveröffentlichtes und keine Terminierung.** Kein Weg, eine Seite so anzusehen, wie sie aussehen wird, außer das Flag umzulegen und zu deployen. Wichtig: `draftMode()` ist eine Dynamic API — in den Loadern würde sie alle Content-Routen aus dem statischen Rendering kippen. Nur als eigene `/preview/[type]/[slug]`-Route. | L |
| 💭 | **GFM-Tabellen können nicht aus der 44rem-Spalte ausbrechen** und haben keinen Overflow-Wrapper — eine vierspaltige Vergleichstabelle läuft auf dem Handy seitlich heraus. Ein `<Table>`-Wrapper auf das Markdown-`table`-Element gemappt, mit `tabindex="0"` am Scroll-Container (sonst ist der Bereich per Tastatur nicht erreichbar). Der naheliegendste nächste Baustein für Business-Seiten. | S |

---

## Bewusst *nicht* tun

- **Die Marke „reparieren".** Dunkles Kosmos-Fundament, Aurora-Violett, Cormorant + Inter, drei Tiefen: das ist das Briefing, kein Default. Generische Design-Skills kalibrieren gegen „fast-schwarzer Hintergrund mit einem hellen Akzent" als KI-Signal — hier ist es Absicht.
- **GSAP oder `motion/react` einführen.** framer-motion v12 aus `"framer-motion"`, 42 Dateien. Der Import löst sonst nicht auf.
- **Den `*`-Reduced-Motion-Block durch einen breiteren ersetzen.** Reduzierte Bewegung erreicht jede JS-Animation bereits über den Store. Ein CSS-Nuke kann framer-motion prinzipiell nicht erreichen und trifft nur das Micro-Feedback.
- **Das Story-Scroll-System mit `useScroll` oder IntersectionObserver nachbauen.** Es ist bewusst CSS `animation-timeline: view()`: null Client-JS, compositor-only, und Fallback auf sichtbaren Inhalt statt auf unsichtbaren.
- **`<Video>` und `<Timeline>` ins MDX-Kit aufnehmen**, solange keine Seite sie braucht. Ein Lazy-`<iframe>`-Embed setzt zudem das LCP/CLS-Budget aufs Spiel.
- **Erst JSON-LD, dann Canonicals.** Strukturierte Daten auf Seiten, die auf die Startseite kanonisieren, sind verschwendet.

## Widersprüche zwischen Befunden

| Konflikt | Auflösung |
|---|---|
| „Root-Metadata lokalisieren" (async `generateMetadata` mit `getLocale()`) vs. „alles statisch vorrendern" | **Statisch gewinnt.** Ein `await getLocale()` im Root zementiert dynamisches Rendering. Erst Punkt 6 entscheiden. |
| „Journal-Detailseiten self-canonical" vs. „`/journal` und `/library/journal` deduplizieren" | **Erst deduplizieren.** Beide Varianten self-canonical zu machen zementiert das Duplikat. |
| „`getLibraryItems()` in die Sitemap mappen" vs. bestehende `/journal/<slug>`-Einträge | `getLibraryItems()` enthält Journal-Posts — ungefiltert gemappt steht jeder Post zweimal unter zwei URLs drin. |
| „`cache()` gegen wiederholte Verzeichnis-Scans" | Liefert das nicht: `cache()` ist Render-Pass-scoped. Der echte Gewinn ist nur `generateMetadata` + Body. |

---

## Methodischer Hinweis

Das Audit lief als Multi-Agent-Workflow. Zwei Durchläufe mussten abgebrochen
werden, weil Sub-Agenten Dateien *bearbeitet* statt nur gelesen haben; alle
diese Änderungen wurden zurückgesetzt. Ein Befund („`oe-aurora-violet-deep` ist
undefiniert") war ein Artefakt genau dieser Selbst-Edits und ist hier entfernt —
der wahre Kern bleibt: Weiß auf `#7C5CFF` erreicht nur 4,1:1, was die Brand-Page
selbst dokumentiert. Für Buttons mit weißem Text braucht es ein tieferes Violett.

Die drei Verify-Durchläufe für Visual, Performance und Publishing wurden vom
Abbruch getroffen — Befunde dieser Dimensionen sind als 🔍 markiert, nicht ✅.

---

## Umsetzungsstand (2026-07-27)

Verifiziert mit `pnpm build`, `pnpm typecheck`, `pnpm lint` und der vollen
Playwright-Suite (53 passed / 0 failed, chromium **und** mobile), plus
Browser-Prüfung der betroffenen Seiten.

### Die Top 10

| # | Punkt | Ergebnis |
|---|---|---|
| 1 | `/journal` war ein 404 | [journal/page.tsx](src/app/(marketing)/journal/page.tsx) angelegt; index-förmige Metadata aus dem Layout entfernt; jeder Artikel hat jetzt eigenen Canonical + vollständige OG-Karte |
| 2 | Root-Canonical | Aus [layout.tsx](src/app/layout.tsx) entfernt; `/`, `/library`, `/experiences` und beide Detail-Routen setzen ihren eigenen |
| 3 | Reduced-Motion-Nuke | `*`-Block ersetzt durch eine gezielte Regel auf die deklarierten Motion-Ebenen; Micro-Feedback und beide Ladespinner leben wieder |
| 4 | framer-motion ignorierte Still | `<MotionConfig reducedMotion>` in [IntensityProvider](src/components/providers/IntensityProvider.tsx) — wirkt auf alle 42 Komponenten |
| 5 | Lenis ohne Gate | [SmoothScroll](src/components/layout/SmoothScroll.tsx) liest `useMotionLevel('flow')`, importiert die Library erst im Effect und baut die Instanz beim Umschalten ab. Zusätzlich `stopInertiaOnNavigate` |
| 6 | Nichts statisch vorgerendert | **Alle** öffentlichen Routen sind jetzt `○`/`●`. Root-Layout intl-frei, [PublicIntlProvider](src/i18n/PublicIntlProvider.tsx) pinnt die Locale, das Portal liest weiter den Cookie |
| 7 | Kein robots.txt | [robots.ts](src/app/robots.ts) + `noindex` am Portal-Layout (einmal statt 18×) |
| 8 | Sentry Replay eager | Auf `lazyLoadIntegration` hinter `requestIdleCallback` umgestellt |
| 9 | `published: false` wirkungslos | Journal, Sacred Content und Stories folgen jetzt einer Regel: 404 |
| 10 | Kein `not-found.tsx` | Zwei: [(marketing)/not-found.tsx](src/app/(marketing)/not-found.tsx) mit Chrome und Übersetzung, [app/not-found.tsx](src/app/not-found.tsx) für Pfade ohne Route-Group |

### Themen A–G

- **A · Korrektheit** — `/content` → `/library` und `/library/journal/:slug` → `/journal/:slug` als permanente Redirects, eine URL pro Artikel; drei tote `href="#"` auf `/community` verdrahtet (der dritte ehrlich als „bald verfügbar"); Events nach ISO-Datum gefiltert mit echtem Empty State; doppelter Title-Suffix an allen vier Stellen weg; `TYPE_META` in [library-types.ts](src/lib/content/library-types.ts) vereinheitlicht, Filter zeigen nur Typen mit Inhalten; `tailwind.config.ts` gelöscht (wurde nie geladen); Deep Space ist Default statt Dark-Mode-Override.
- **B · Visual** — `color-scheme: dark` global statt Inline-Hack auf `/contact`; zwei zugängliche Violett-Ableitungen (`-deep` für Flächen mit weißem Text, `-ink` für Text auf Dunkel), beide auf der Brand-Page dokumentiert; `AmbientOrb` und `ParallaxLayer` gelöscht; Navigation hält den Burger bis `lg` (zwischen 768 und ~1100px kollidierten Wortmarke und erster Link).
- **C · Motion** — `data-intensity` per Pre-Paint-Script; Hero ohne `opacity: 0` (LCP); `StarField` liest `scrollHeight` nicht mehr pro Frame; `CustomCursor` animiert nur noch `scale`/`opacity`/`borderColor` (behebt auch den 2,25×-Bug); `ScrollIndicator`, `MagneticButton` und `template.tsx` gegatet; `ParallaxImage` über `useFinePointer` ohne Hydration-Mismatch.
- **D · A11y** — 179 Textstellen von sub-AA auf `/55` (5,91:1 auf Deep Space, 5,82:1 auf Warm); Guide-Composer und Senden-Button benannt, Verlauf mit `role="log"`; neun blanke `outline-none` durch sichtbare Fokus-Ringe ersetzt; `IntensityToggle` als echte APG-Radiogroup mit Pfeiltasten, `aria-checked` auf `effectiveMode`, übersetzt; `cursor: none` nimmt Formularfelder aus, respektiert `forced-colors` und greift erst, wenn der Ersatz sichtbar ist; axe-Scan auf WCAG 2.1/2.2 erweitert und `moderate` eingeschlossen; Touch-Targets in der Navigation auf 44px.
- **E · Performance** — `cache()` um die drei `*BySlug`-Loader (MDX wurde pro Request zweimal kompiliert); `sizes` an den ContentGrid-Covern; `images.formats` mit AVIF + Supabase-`remotePatterns`; `d3`-Barrel durch `d3-zoom`/`d3-selection` ersetzt; Consciousness Map über `next/dynamic`.
- **F · SEO** — Sitemap ohne die beiden `noindex`-Legal-Seiten, mit `/library`, `/experiences` und Sacred Content, ohne erfundenes `lastModified` und ohne Journal-Doppelung; alle Metadata-URLs relativ gegen `metadataBase`; `siteUrl` mit produktionssicherem Fallback.
- **G · Publishing** — `parseFrontmatter` nennt bei ungültigem Frontmatter die Datei; der schluckende `catch` in `getLibraryItems` ist weg (eine Policy: Build bricht).

### Bewusst offen

| Punkt | Warum |
|---|---|
| Kontakt- und Newsletter-Formular liefern nichts aus | Braucht eine Transport-Entscheidung (ESP/SMTP). **Der rechtlich relevante Teil bleibt: das Formular zeigt weiterhin Erfolg, ohne zuzustellen, und der Newsletter sammelt eine E-Mail ohne Consent-Checkbox.** Nächster Schritt vor jedem Launch. |
| Marketing-Texte nur auf Deutsch | Bewusste Entscheidung: der öffentliche Baum ist auf `defaultLocale` gepinnt, damit er statisch rendert. Echte Zweisprachigkeit braucht `/de`- und `/en`-Segmente. |
| `<PageHero>`, `.oe-eyebrow`, ein Container-Maßstab | Reine Konsistenzarbeit über neun Seiten mit sichtbarem Risiko — gehört in eine eigene Runde mit visueller Abnahme. |
| Fünf lokale Accent-Maps auf `ACCENTS` zusammenführen | Dito. `ACCENTS` liegt weiterhin in `mdx-kit.tsx`. |
| Favicon, `apple-icon`, Manifest | Braucht heruntergerechnete Assets aus dem 1,27 MB großen Logo — Bildarbeit, kein Code. |
| Sechs ungenutzte Sacred-Content-Renderer | Vor dem Löschen gegen die Inline-Blöcke der Route diffen, sonst geht Markup verloren. |
| JSON-LD, RSS, Preview-Route, `<Table>`-Wrapper, `prefers-contrast` | Sinnvoll, aber keine Defekte. Reihenfolge wie oben im Backlog. |
| Message-Bundle pro Route zuschneiden | ~10 KB, geringster Ertrag im Set. |
