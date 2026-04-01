# AUTO_REVIEW_PLAN

Stand: 2026-04-01 07:05 UTC
Branch: `main` (`origin/main` voraus um 21 Commits)
Repo-Status: nur `AUTO_REVIEW_PLAN.md` ist lokal neu/untracked
Morning-Run: Cron `c3a8ff45-9145-4786-b60b-2885c5ef3b0c`
Asynchrone Review-Sessions:
- Public Experience / Perf Review → Claude Opus (`session: wild-comet`, Worktree `/tmp/oe-morning-public`)
- Consciousness Map Review → Claude Sonnet (`session: brisk-cove`, Worktree `/tmp/oe-morning-map`)

## Repo Signals geprüft
- `git status --short --branch`: `main...origin/main [ahead 21]`, nur `AUTO_REVIEW_PLAN.md` untracked
- `git log --oneline -8` zeigt den jüngsten Truth-Sync direkt im Repo:
  - `d95611d` — `docs(orchestration): truth-sync 00-orchestration.md to repo state as of 2026-04-01`
  - `f6e5d8d` — Library-Detailroute-Smoke-Tests
  - `45a7d7e` — Portal-Plan auf UX-Extras-Stand aktualisiert
  - davor Landing von Practice-History, Journal-Autosave, Onboarding, Library-Detailrouten, Agent-02-Residual-Pass
- `NEXT_STEPS_MASTERPLAN.md` fehlt aktuell im Repo-Root
- aktive Planquellen:
  - `docs/plans/agents/00-orchestration.md`
  - `docs/plans/agents/04-public-experience.md`
  - `docs/plans/agents/05-portal-auth.md`
  - `docs/plans/agents/07-consciousness-map.md`

## Morning Review Snapshot

### Ist-Zustand
- Die zentrale Orchestrierung wurde **heute bereits truth-synchronisiert**.
- Das Repo wirkt **geordnet und fortgeschritten**, nicht mehr foundation-chaotisch.
- Offene Arbeit ist jetzt vor allem:
  - **Public Experience Polish**
  - **Map/UI/Test-Polish**
  - **Portal-Restthemen mit externen Abhängigkeiten**
  - **Quality-Hardening statt großer Architektur-Sprünge**

## Höchste Review-Punkte

### 1) Masterplan-Lücke: `NEXT_STEPS_MASTERPLAN.md` existiert nicht
**Priorität:** P0

**Befund:**
- Der Cron-Run fragt explizit nach diesem Plan, aber im Repo-Root gibt es aktuell keine Datei mit diesem Namen.
- Die operative Wahrheit liegt stattdessen verteilt in den Agent-Plänen und dem bereits aktualisierten `00-orchestration.md`.

**Nächste Aufgabe:**
- Entscheiden, ob `00-orchestration.md` bewusst die Rolle des Masterplans übernimmt
- optional später: kompaktes `NEXT_STEPS_MASTERPLAN.md` als menschlich lesbare Top-Level-Zusammenfassung anlegen

### 2) Public Experience ist jetzt klar der größte offene Produkt-Track
**Priorität:** P0

**Befund:**
- `04-public-experience.md` zeigt: Homepage v2, Experiences-Landingpage, Manifesto-Upgrade, Library-Listing und Library-Detailrouten sind da.
- Die offenen Punkte sind fokussiert und produktnah:
  - Panel-Navigation statt harter Routenwechsel
  - Visual-Essay-Engine + echte Inhalte
  - WebGL progressive enhancement
  - formaler Lighthouse-/Bundle-/Perf-Pass
  - Return-Visit- und Ambient-Audio-Polish

**Nächste Aufgabe:**
- Nicht wieder breit redsignen
- Stattdessen einen **eng umrissenen Public-Polish-Pass** priorisieren: Perf-Audit oder Panel-Nav-Vorbereitung

### 3) Portal/Auth ist weit, aber Live-Readiness hängt an externen Schritten
**Priorität:** P1

**Befund:**
- `05-portal-auth.md` ist in der UX-Basis sehr weit: Onboarding, Autosave, Practice-History sind erledigt.
- Die wirklich offenen/unsicheren Punkte liegen eher bei:
  - echtem Supabase-Provisioning
  - OAuth-Credentials
  - RLS-/Auth-E2E-Verifikation
  - späterem v2-Scope (Reflection Graph, Soundscape Player)

**Nächste Aufgabe:**
- Portal-Restarbeiten als **go-live checklist + targeted QA** rahmen, nicht als Foundation-Neubau

### 4) Consciousness Map ist ein guter paralleler Polish-Track
**Priorität:** P1

**Befund:**
- `07-consciousness-map.md` zeigt: Core ist da, Rest ist sauber abgegrenzt.
- Gute Nebenbahn-Aufgaben:
  - Intensity-Mode-Integration
  - Edge-Label-Dialog / Editing
  - Node-Editing-Polish
  - Mobile-Interaction-Polish
  - E2E-Test-Pass

**Nächste Aufgabe:**
- Map als konfliktarmen Parallel-Track behalten, ideal für kleine, abgeschlossene Verbesserungen

### 5) Quality-Plattform ist nicht mehr Blocker, sondern Verstärker
**Priorität:** P2

**Befund:**
- Quality-Residuals und Route-Smoke-Tests sind bereits gelandet.
- Offen sind eher nachgelagerte Härtungen:
  - strengere Perf-Schwellen
  - visuelle Regression
  - Portal-CI mit echten Secrets

**Nächste Aufgabe:**
- nur zusammen mit konkretem Public-/Portal-Ziel anfassen, nicht isoliert aufblasen

## Empfohlene Priorisierung

### P0 — jetzt verfolgen
1. **Public Experience enger Quality-/Perf-Pass**
   - formal messen, Engpässe benennen, kleinsten wirksamen Fix identifizieren
2. **Masterplan-Klarheit sichern**
   - `00-orchestration.md` als Master referenzieren oder später Top-Level-Masterplan ergänzen

### P1 — direkt danach
1. **Map Polish / Interaction UX**
2. **Portal Go-Live Checklist (Supabase/OAuth/RLS/E2E)**

### P2 — später
1. Visual essays + echte Inhalte
2. Ambient audio / return-visit mood system
3. Reflection graph / soundscape player

## Asynchron gestartete Parallelaufgaben

### Agent A — Public Experience / Perf Review
- **Modell:** Claude Opus 4.6
- **Worktree:** `/tmp/oe-morning-public`
- **Branch:** `chore/morning-public-review-20260401`
- **Ziel:** Repo prüfen, genau einen kleinen konfliktarmen Public-/Perf- oder Docs-Fix identifizieren, umsetzen, verifizieren, committen; sonst saubere TODO-Doku hinterlassen

### Agent B — Consciousness Map Polish Review
- **Modell:** Claude Sonnet 4.6
- **Worktree:** `/tmp/oe-morning-map`
- **Branch:** `chore/morning-map-review-20260401`
- **Ziel:** einen kleinen konfliktarmen Map-/Interaction-/Docs-/Test-Polish-Pass identifizieren, umsetzen, verifizieren, committen; sonst konkrete nächste Schritte dokumentieren

## Lösch-/Commit-Prüfung
- `NEXT_STEPS_MASTERPLAN.md`: **nicht vorhanden** → kein `git rm` möglich
- `AUTO_REVIEW_PLAN.md`: **nicht 100% fertig/obsolet**, sondern das aktuelle Morning-Review-Artefakt → nicht löschen
- `00-orchestration.md` wurde bereits separat truth-synchronisiert und committed
- Ergebnis: **In diesem Morning-Run keine Datei qualifiziert sich sauber für `git rm` + Commit**

## Morning Verdict
**OneEmergence ist in der Phase von gezielter Verdichtung, nicht von Neuaufbau.**

Der sinnvollste Fokus heute Morgen ist:
- Public Experience präzise härten
- Map als parallelen kleinen Polish-Track nutzen
- Portal-Restarbeiten als Live-Readiness statt als Großbaustelle behandeln

## Telegram-Hinweis
Externe Zustellung hier nicht direkt ausgeführt.

Ziel:
- **Telegram → Julius (`chatId: 2081872701`)**

Vorgeschlagener superkurzer Text:
- `OneEmergence: Morning-Review fertig, Plan aktualisiert, 2 Claude-Runs gestartet.`
