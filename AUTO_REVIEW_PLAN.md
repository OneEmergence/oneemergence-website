# AUTO_REVIEW_PLAN

Stand: 2026-04-03 05:02 UTC
Branch: `main` (`origin/main` voraus um 27 Commits)
Repo-Status: Worktree sauber; Morning-Run aktiv
Morning-Run: Cron `c3a8ff45-9145-4786-b60b-2885c5ef3b0c`

## Repo-Snapshot

### Git / Verlauf
- `git status --short --branch`: `## main...origin/main [ahead 27]`
- Worktree: sauber vor dieser Aktualisierung
- letzte Commits:
  - `c6d297f` — `docs(review): refresh morning auto review plan for 2026-04-03 04:00 UTC`
  - `6875d6d` — `docs(review): refresh morning auto review plan for 2026-04-02 07:05 UTC`
  - `dac79fd` — `docs(review): refresh morning auto review plan for 2026-04-02 06:04 UTC`
  - `7bb56be` — `docs(review): refresh morning auto review kickoff`
  - `926bd7e` — `docs(review): refresh morning auto review plan for 2026-04-02`

### Planquellen
- `NEXT_STEPS_MASTERPLAN.md` **fehlt weiterhin im Repo**
- kanonische Master-Quelle bleibt: `docs/plans/agents/00-orchestration.md`
- wichtigste Review-Quellen in dieser Schicht:
  - `docs/plans/agents/04-public-experience.md`
  - `docs/plans/agents/07-consciousness-map.md`

## Morning Findings

### P0 — Quellenlage bleibt stabil
- Es gibt weiterhin **keine** Root-Datei `NEXT_STEPS_MASTERPLAN.md`; heute daher weder Update- noch Löschkandidat.
- `docs/plans/agents/00-orchestration.md` bestätigt den aktuellen Restscope klar:
  - **Public Experience Polish**: Panel-Navigation, Visual Essays, WebGL progressive enhancement, formaler Performance-Pass
  - **Portal Restpunkte**: vor allem provisioning-/asset-lastig (`soundscape player`, `reflection graph`, OAuth/DB live setup)
  - **Consciousness Map Polish**: intensity integration, mobile polish, edge/node editing polish, E2E

### P0 — Public Experience bleibt der stärkste offene Public-Facing Hebel
Laut `04-public-experience.md` ist schon viel gelandet (Living Portal v2, Experiences-Landingpage, Bibliothek + Detailrouten), aber offen bleiben die sichtbarsten UX-/Experience-Lücken:
- Panel-Navigation statt normaler Seitenwechsel
- Visual-Essay-Engine plus echte Essay-Inhalte
- WebGL/R3F progressive enhancement
- Performance-/Lighthouse-Audit
- Return-Visit-/Ambient-Audio-Polish

**Schichtentscheidung:** kleiner konfliktarmer Review-/Polish-Track in separatem Worktree statt großer Main-Tree-Umbauten.

### P1 — Consciousness Map ist der beste zweite Parallel-Track
Laut `07-consciousness-map.md` ist der Kern geliefert, aber folgende Restpunkte sind gut parallelisierbar:
- Intensity-Mode-Integration (still = statisch)
- Edge-Dialog / Edge-Label-Editing
- Node-Editing-Polish
- Mobile-Interaction-Polish
- Playwright-E2E

**Schichtentscheidung:** isolierter kleiner UX-/Test-/Docs-/Mini-Fix-Track mit geringer Konfliktwahrscheinlichkeit.

### P1 — Portal/Auth ist aktuell kein guter autonomer Morning-Track
- echter Supabase-Live-Setup
- OAuth-Credentials
- RLS-/Auth-E2E mit Live-Secrets
- Audio-/Graph-Features mit externen Inputs

**Schichtentscheidung:** heute nicht als autonomer Parallel-Run geeignet.

## Nächste Aufgaben
1. Public Experience: **einen** kleinen sicheren, review-fähigen Fix oder Quality-Pass liefern lassen.
2. Consciousness Map: **einen** kleinen sicheren, review-fähigen Fix oder Test-/UX-Pass liefern lassen.
3. Nach Agent-Abschluss: Commits prüfen, cherry-picken/mergen und bei Bedarf `00-orchestration.md` truth-synchronisieren.
4. Später separat entscheiden, ob wieder ein Root-`NEXT_STEPS_MASTERPLAN.md` eingeführt werden soll.

## Asynchron gestartete Aufgaben

### Agent A — Public Experience Review
- Modell: **claude-opus-4-6**
- Worktree: `/tmp/oe-morning-review/public`
- Branch: `review/public-experience-20260403`
- Ziel:
  - kleinen konfliktarmen Public-Experience-/Perf-/Docs-Fix identifizieren
  - umsetzen
  - verifizieren (`npm run build`, optional gezielte Tests)
  - committen
  - Kurznotiz im Worktree hinterlassen
- Status: **wird in dieser Schicht asynchron gestartet**

### Agent B — Consciousness Map Review
- Modell: **claude-sonnet-4-6**
- Worktree: `/tmp/oe-morning-review/map`
- Branch: `review/map-polish-20260403`
- Ziel:
  - kleinen konfliktarmen Map-/Interaction-/Test-/Docs-Fix identifizieren
  - umsetzen
  - verifizieren (`npm run build`, optional gezielte Tests)
  - committen
  - Kurznotiz im Worktree hinterlassen
- Status: **wird in dieser Schicht asynchron gestartet**

## Lösch-/Commit-Prüfung
- `NEXT_STEPS_MASTERPLAN.md`: nicht vorhanden → kein `git rm`
- `AUTO_REVIEW_PLAN.md`: operative Datei, klar **nicht** 100% fertig → kein `git rm`
- Ergebnis: in dieser Morning-Schicht **kein** `git rm`-Kandidat

## Telegram-Hinweis
Externe Nachricht hier nicht selbst senden.

Ziel:
- Telegram → Julius (`chatId: 2081872701`)

Superkurzer vorgeschlagener Text:
- `OneEmergence: Morning-Review aktualisiert, 2 Claude-Runs gestartet.`
