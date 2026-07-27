---
name: story-pages
description: Use when creating, editing or polishing a standalone shareable page on oneemergence-website — a blog post, an information page, a one-pager for a client or partner, a landing page for a link you will send by mail/WhatsApp/LinkedIn, a whitepaper, a concept write-up, a pitch, an FAQ page. Anything that is "make me a page with its own link". Covers the /s/[slug] story system: frontmatter, the MDX kit, scroll backgrounds, private links, OG cards, and the verification loop.
---

# Story Pages

One `.mdx` file in `src/content/stories/` becomes one page at `/s/<filename>`.
That is the whole system. No route to add, no component to import, no build
step to configure.

Your job is not to "write a blog post". Your job is to build **one composed
page** that a person will open on a phone, in a meeting, from a link someone
sent them — and which makes them slow down. Read all of this before writing.

---

## 0. Before you write

Read `AGENTS.md` (stack + paradigms) and
`.agents/skills/frontend-workflow/SKILL.md` (constraints that override generic
design advice). Then answer three questions, out loud, in one line each:

1. **Who opens this link, in what situation?** A partner on a laptop, a client
   on a phone between meetings, a stranger from a search result. This decides
   length and tone more than anything else.
2. **What is the one thing they should still remember tomorrow?** Write it as
   a sentence. If you can't, the page has no spine yet — ask the user.
3. **What is this page's one signature moment?** The single element that makes
   it *this* page and not a template. A `<Stage>` where the world changes
   colour. A stat that lands hard. One pull quote in 5xl serif with nothing
   around it. **Exactly one.** Two signature moments is zero.

If the brief is thin, ask before building — one round of questions, then go.
Do not invent facts, numbers, testimonials, or client names. If a number is
needed and you don't have it, ask or leave a `TODO` the user can fill.

---

## 1. Create the file

```
src/content/stories/<slug>.mdx
```

The filename **is** the URL: `angebot-strategie-2026.mdx` → `/s/angebot-strategie-2026`.
Slugs are lowercase, hyphenated, German or English, no dates in the name
(the date is frontmatter; a slug should stay valid next year).

### Frontmatter

```yaml
---
title: Was OneEmergence baut            # required. The <h1> and the OG card headline.
subtitle: Eine Plattform für Erfahrungen, die nicht in ein Feed-Format passen.
eyebrow: Übersicht                       # small label above the title
description: Warum wir Räume für Einheit… # required. Meta + OG description, ≤160 chars.
date: 2026-07-27                         # required
updated: 2026-08-14                      # optional
author: Julius Harnack
atmosphere: cosmic                       # cosmic | solarpunk | transitional | warm
accent: violet                           # violet | gold | cyan | green | sand
hero: full                               # full | compact | cover
cover: /images/…                         # only used by hero: cover
tags: [Plattform, Vision]
published: true                          # false ⇒ the route 404s (draft)
listed: true                             # false ⇒ direct link only
noindex: false                           # true ⇒ robots noindex
cta:
  title: Sprich mit uns.
  label: Kontakt aufnehmen
  href: /contact
  note: Wir antworten persönlich.
locale: de
---
```

Schema: `StoryMeta` in [src/lib/schemas/content.ts](src/lib/schemas/content.ts).
Unknown keys are ignored; a wrong *type* fails the build with a Zod error
naming the field. Dates may be quoted or not — the schema normalises both.

### Choosing atmosphere and accent

| Page is about | atmosphere | accent |
|---|---|---|
| Vision, philosophy, the big frame | `cosmic` | `violet` or `cyan` |
| Building, community, method, process | `solarpunk` | `green` or `gold` |
| A journey, a transformation, before→after | `transitional` | `violet` → `sand` |
| Invitation, closeness, an offer, a personal letter | `warm` | `sand` or `gold` |

The accent is the page's one coloured voice. Use it for the eyebrow, the rule
under the hero, stat numbers, and the CTA. Body copy stays
`oe-pure-light/70`. **Do not use three accents on one page.**

### Hero

- `full` — hero fills ~68svh, title at 6xl–7xl. For pages that should feel
  like an arrival. Default.
- `compact` — title at 4xl–5xl, straight into the text. For reference pages,
  FAQs, documentation, anything a reader came to *use* rather than *feel*.
- `cover` — a photograph above the title. Only with a genuinely good image;
  a stock-looking cover is worse than none.

---

## 2. Write the body

Every kit component is globally available — **no imports in MDX**. Full source:
[src/components/content/mdx-kit.tsx](src/components/content/mdx-kit.tsx).

### Layout

| | |
|---|---|
| `<Stage atmosphere image align>` | A chapter with its own scroll background. See §3. |
| `<Wide>` | Break out of the 44rem reading column into the wide band. |
| `<Full>` | Edge to edge. One or two per page, maximum. |
| `<Columns>` | Two balanced columns on desktop, stacked on mobile. |
| `<Divider space="sm\|md\|lg" accent>` | Gradient hairline. |

### Editorial

| | |
|---|---|
| `<Lead>` | Oversized opening paragraph. **Exactly one**, right after the hero. |
| `<Eyebrow accent>` | Small uppercase label that opens a section, above the `##`. |
| `<PullQuote author role accent>` | Big serif quote in the wide band. Max 2 per page. |
| `<Stats>` + `<Stat value label note accent>` | 2–4 headline numbers. Never 5+. |
| `<Cards>` + `<Card title href accent>` | 2–6 soft cards, optionally linked. |
| `<Figure src alt caption ratio full priority>` | `next/image` + caption. |
| `<Steps>` + `<Step title>` | Numbered process. Numbers come from CSS — never type them. |
| `<FAQ>` + `<QA q>` | Native `<details>` accordion — keyboard and SR correct for free. |
| `<CTA title label href accent>` | Mid-page action block. The closing one comes from frontmatter. |
| `<Reveal>` | Fades + lifts its children on scroll-in. |
| `<Callout type="note\|warning\|insight">` | Aside. |

Plain markdown still works and should carry most of the page: `##`, `###`,
paragraphs, lists, `>` quotes, tables, links, `**bold**`.

### The composition rules that actually matter

1. **Rhythm beats richness.** A great page is mostly quiet text with three or
   four moments of change. If two kit components touch each other with no prose
   between them, delete one.
2. **Never open with a component.** `<Lead>`, then real sentences. Let the
   reader in before you decorate.
3. **Vary the container.** text → text → `<Wide>` → text → `<Stage>` → text.
   A page where everything sits in the same 44rem column reads as a document,
   not a designed page.
4. **One idea per `##`.** If a section needs three sub-points, that is
   `<Cards>` or `<Steps>`, not three `###`.
5. **Earn the ending.** The last thing before the CTA should be a short
   paragraph, not a component. Give the reader a breath before the ask.
6. **Length is a decision.** A partner one-pager is 250 words. A concept
   write-up is 900. Nothing on this site needs 2,500. Cut until every
   paragraph carries weight.
7. **Write German that a human wrote.** No "In der heutigen schnelllebigen
   Zeit". No triads of adjectives. No em-dash-heavy AI cadence. Short
   sentences. Concrete nouns.

---

## 3. Scroll backgrounds — `<Stage>`

This is the signature capability. A `<Stage>` is a chapter that brings its own
background: it fades up as the section enters, holds still while the copy
scrolls past it, and hands off to the next one.

```mdx
<Stage atmosphere="solarpunk">

<Eyebrow accent="green">Der Ansatz</Eyebrow>

## Drei Tiefen statt einer Oberfläche

Fließtext hier. Der Hintergrund bleibt stehen, während dieser Text an ihm
vorbeizieht.

<Cards>
  <Card title="Kosmisch" accent="cyan">Weite, Stille, Orientierung.</Card>
  <Card title="Warm" accent="sand">Nähe, Ruhe, Abschluss.</Card>
</Cards>

</Stage>
```

**Blank lines matter.** MDX needs an empty line after the opening tag and
before the closing tag, or the markdown inside is not parsed.

With a photograph:

```mdx
<Stage atmosphere="warm" image="/images/backgrounds/depth-warm.webp">
```

The image is masked, screen-blended and drifts on scroll in immersive mode —
it is a texture under the type, not a hero photo. Choose something dark and
low-contrast, or the text loses legibility.

### How it works, and what that means for you

Pure CSS `animation-timeline: view()` — no scroll listener, no client
component, no framer-motion. The whole kit ships **zero client JavaScript**.
Consequences you must respect:

- **Never** rebuild this with `useScroll`, an `IntersectionObserver`, or a
  `'use client'` wrapper. It would be slower and would bypass the intensity
  gates.
- Browsers without view timelines get a static background — content is never
  hidden waiting for an animation. Keep it that way: any new effect must
  animate *from* the visible state, never *to* it.
- Still mode keeps the colour field and drops the photograph and the drift.
  Immersive adds the drift. This is automatic.

### Dosage

Two, maybe three stages on a long page. One on a short one. Zero is a
legitimate choice for a compact reference page. A page where every section is
a `<Stage>` is a slideshow, and the effect stops meaning anything.

Do not put two stages with the *same* `atmosphere` next to each other — the
handoff becomes invisible and you have paid for nothing.

---

## 4. Private and draft links

| Goal | Frontmatter |
|---|---|
| Public, in the `/s` index and the sitemap | `listed: true` (default) |
| A link only for the people you send it to | `listed: false` |
| Not live at all yet | `published: false` |

`listed: false` keeps the page out of `/s`, out of `sitemap.xml`, and sets
`robots: noindex, nofollow` — but the URL works forever and still renders a
full preview card in WhatsApp, Slack, LinkedIn and mail clients.

This is **obscurity, not access control.** Anyone with the link can read it.
Never put contract terms, personal data, credentials, or anything under NDA on
an unlisted story. If it needs real protection it belongs behind the portal in
`src/app/(portal)/`, not here — say so instead of shipping it.

---

## 5. The OG card

[src/app/(marketing)/s/[slug]/opengraph-image.tsx](src/app/(marketing)/s/[slug]/opengraph-image.tsx)
generates a 1200×630 card per story at build time, coloured by the story's own
`atmosphere` and `accent`. You get it for free — but it is the first thing the
recipient sees, so:

- Keep `title` short enough to breathe at 82px. Over ~58 characters it drops
  to 62px; over ~80 it will look cramped. Shorten the title, don't fight it.
- `subtitle` (falling back to `description`) is the card's second line and is
  hard-truncated at 130 characters.
- `eyebrow` becomes the kicker. A page with no eyebrow shows "OneEmergence".

---

## 6. Verify — do not skip this

```bash
pnpm typecheck && pnpm lint     # frontmatter type errors surface here
pnpm dev                        # then open /s/<slug>
```

Then actually look at it, with Playwright MCP or `agent-browser`:

1. **Mobile first — 390×844.** Most shared links open on a phone. Check the
   hero doesn't push the first paragraph below the fold, that `<Stats>` and
   `<Cards>` stack cleanly, and that no `<Wide>` element causes horizontal
   scroll.
2. **Desktop — 1440.** Check the reading column, and that `<Stage>` handoffs
   land where the section boundaries are.
3. **Scroll the whole page slowly.** Stage fades should be invisible as
   *events* — you should notice the colour has changed, not that a thing
   faded.
4. **All three intensity modes** via the toggle: Still (no photo, no drift,
   fully readable), Balanced, Immersive.
5. `pnpm build` before you call it done — the Zod parse and the OG image both
   run at build time, and both can fail on content that renders fine in dev.

Optional polish pass: `impeccable critique` on the rendered page, then
`impeccable polish`. Ignore any advice to change the brand palette or replace
framer-motion — see the frontend-workflow constraints.

---

## 7. Hand the link over

Report to the user as:

```
/s/<slug>   →   https://oneemergence.org/s/<slug>
```

and state plainly whether it is `listed` (public + in the index) or unlisted
(link-only). If it is `published: false`, say that it is not live yet and what
to flip.

---

## Reference page

[src/content/stories/was-oneemergence-baut.mdx](src/content/stories/was-oneemergence-baut.mdx)
uses every component in the kit and is kept working. Read it before writing
your first story; copy its shape, not its words.

## Anti-patterns

- Using every component because they exist. The kit is a vocabulary, not a checklist.
- Three accents, five stats, a stage per section. Loud is not the same as designed.
- `'use client'` anywhere in this system.
- Raw hex, arbitrary `text-[19px]`, or a new colour. Tokens only —
  `@theme` in [src/app/globals.css](src/app/globals.css).
- Inventing numbers, quotes, or client names to fill a layout.
- Shipping without opening the page at 390px wide.
