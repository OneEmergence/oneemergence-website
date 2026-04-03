# AUTO_REVIEW_PLAN

Stand: 2026-04-03 04:00 UTC
Branch: `main` (`origin/main` voraus um 26 Commits)
Repo-Status: Worktree sauber; laufende Morgenkoordination in dieser Datei
Morning-Run: Cron `c3a8ff45-9145-4786-b60b-2885c5ef3b0c`

## Repo-Snapshot

### Git / Verlauf
- `git status --short --branch`: `## main...origin/main [ahead 26]`
- letzte Commits:
  - `6875d6d` — `docs(review): refresh morning auto review plan for 2026-04-02 07:05 UTC`
  - `dac79fd` — `docs(review): refresh morning auto review plan for 2026-04-02 06:04 UTC`
  - `7bb56be` — `docs(review): refresh morning auto review kickoff`
  - `926bd7e` — `docs(review): refresh morning auto review plan for 2026-04-02`
  - `2837d4e` — `docs(review): update morning auto review plan`

### Planquellen
- `NEXT_STEPS_MASTERPLAN.md` **fehlt im Repo**
- kanonische Master-Quelle bleibt: `docs/plans/agents/00-orchestration.md`
- wichtigste Detailpläne für diese Schicht:
  - `docs/plans/agents/04-public-experience.md`
  - `docs/plans/agents/07-consciousness-map.md`

## Morning Findings

### P0 — Masterplan / Quellenklarheit
- Es gibt weiterhin **keine** Root-Datei `NEXT_STEPS_MASTERPLAN.md`; entsprechend gibt es heute keinen Kandidaten zum Aktualisieren oder per `git rm` zu löschen.
- `docs/plans/agents/00-orchestration.md` ist weiterhin die belastbare Masterquelle und beschreibt den Restscope stimmig: Public-Experience-Polish, Map-Polish, wenige Portal-Restpunkte.
- `AUTO_REVIEW_PLAN.md` bleibt als operative Morning-Datei sinnvoll und ist klar **nicht** 100% abgeschlossen.

### P0 — Public Experience ist weiter der größte offene Nutzerhebel
Offen laut `04-public-experience.md` / `00-orchestration.md`:
- Panel-Navigation statt harter Routenwechsel
- Visual-Essay-Engine + echte Essay-Inhalte
- WebGL progressive enhancement
- formaler Performance-/Lighthouse-Pass
- Return-Visit-/Ambient-Audio-Polish

**Schichtentscheidung:** kein großer Main-Tree-Umbau; stattdessen ein kleiner, konfliktarmer Review-/Perf-/UX-Pass im eigenen Worktree.

### P1 — Consciousness Map bleibt der beste zweite Parallel-Track
Offen laut `07-consciousness-map.md` / `00-orchestration.md`:
- Intensity-Mode-Integration
- Edge-Dialog / Edge-Label-Editing
- Node-Editing-Polish
- Mobile Interaction Polish
- Playwright E2E

**Schichtentscheidung:** parallelisierbar als isolierter UX-/Test-/Docs-/Mini-Fix-Track mit geringer Konfliktwahrscheinlichkeit.

### P1 — Portal/Auth bleibt eher provisioning- als code-getrieben
- echtes Supabase-Provisioning
- OAuth-Credentials
- RLS-/Auth-E2E mit Live-Secrets
- später: Soundscape Player, Reflection Graph

**Schichtentscheidung:** nicht ideal für autonome Morning-Fixes ohne Live-Zugänge.

## Nächste Aufgaben
1. Public Experience: genau **einen** kleinen sicheren Fix oder Review-Commit liefern lassen.
2. Consciousness Map: genau **einen** kleinen sicheren Fix oder Review-Commit liefern lassen.
3. Nach Agent-Abschluss: Commits prüfen, cherry-picken/mergen und bei Bedarf `00-orchestration.md` truth-synchronisieren.
4. Später separat entscheiden, ob überhaupt wieder ein `NEXT_STEPS_MASTERPLAN.md` im Root eingeführt werden soll.

## Asynchron gestartete Aufgaben

### Agent A — Public Experience Review
- Modell: **Opus 4.1 / highest available complex Claude model**
- Worktree: `/tmp/oe-morning-review/public`
- Branch: `review/public-experience-20260403`
- Ziel: einen kleinen konfliktarmen Public-Experience-/Perf-/Docs-Fix finden, umsetzen, verifizieren (`npm run build`; optional gezielte Tests), in eigenem Branch committen und kurz im Worktree dokumentieren.
- Status: **startet in dieser Schicht**

### Agent B — Consciousness Map Review
- Modell: **Sonnet / fast Claude model**
- Worktree: `/tmp/oe-morning-review/map`
- Branch: `review/map-polish-20260403`
- Ziel: einen kleinen konfliktarmen Map-/Interaction-/Test-/Docs-Fix finden, umsetzen, verifizieren (`npm run build`; optional gezielte Tests), in eigenem Branch committen und kurz im Worktree dokumentieren.
- Status: **startet in dieser Schicht**

## Lösch-/Commit-Prüfung
- `NEXT_STEPS_MASTERPLAN.md`: nicht vorhanden → kein `git rm`
- `AUTO_REVIEW_PLAN.md`: aktiv in Benutzung, nicht fertig → kein `git rm`
- In dieser Morning-Schicht daher **kein** `git rm`-Kandidat.

## Telegram-Hinweis
Externe Nachricht hier nicht selbst senden.

Ziel:
- Telegram → Julius (`chatId: 2081872701`)

Superkurzer vorgeschlagener Text:
- `OneEmergence: Morning-Review aktualisiert, 2 Claude-Runs gestartet.`
