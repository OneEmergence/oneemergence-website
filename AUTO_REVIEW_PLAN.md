# AUTO_REVIEW_PLAN

Stand: 2026-04-02 06:04 UTC
Branch: `main` (`origin/main` voraus um 24 Commits)
Repo-Status: Worktree sauber; laufende Morgenkoordination in dieser Datei
Morning-Run: Cron `c3a8ff45-9145-4786-b60b-2885c5ef3b0c`

## Repo-Snapshot

### Git / Verlauf
- `git status --short --branch`: `## main...origin/main [ahead 24]`
- letzte Commits:
  - `7bb56be` — `docs(review): refresh morning auto review kickoff`
  - `926bd7e` — `docs(review): refresh morning auto review plan for 2026-04-02`
  - `2837d4e` — `docs(review): update morning auto review plan`
  - `d95611d` — `docs(orchestration): truth-sync 00-orchestration.md to repo state as of 2026-04-01`
  - `f6e5d8d` — `test(quality): add library detail route smoke tests for /library/[type]/[slug]`

### Planquellen
- `NEXT_STEPS_MASTERPLAN.md` **fehlt im Repo-Root**
- kanonische Master-Quelle bleibt aktuell: `docs/plans/agents/00-orchestration.md`
- wichtigste Detailpläne für diese Schicht:
  - `docs/plans/agents/04-public-experience.md`
  - `docs/plans/agents/07-consciousness-map.md`

## Morning Findings

### P0 — Masterplan / Quellenklarheit
- `NEXT_STEPS_MASTERPLAN.md` existiert nicht; damit gibt es aktuell keinen Root-Masterplan zum Pflegen oder Löschen.
- `docs/plans/agents/00-orchestration.md` ist konsistent mit dem Repo-Zustand und benennt die verbleibenden Tracks korrekt: Public-Experience-Polish, Map-Polish, wenige Portal-Restpunkte.
- `AUTO_REVIEW_PLAN.md` bleibt sinnvoll als operative Tages-/Schichtdatei und ist klar **nicht** 100% abgeschlossen.

### P0 — Public Experience bleibt der stärkste offene Produkthebel
Offen laut `04-public-experience.md` / `00-orchestration.md`:
- Panel-Navigation statt harter Routenwechsel
- Visual-Essay-Engine + echte Essay-Inhalte
- WebGL progressive enhancement
- formaler Performance-/Lighthouse-Pass
- Return-Visit-/Ambient-Audio-Polish

**Schichtentscheidung:** Kein großer Architektureingriff im Main-Tree. Stattdessen ein kleiner, konfliktarmer Review-/Polish-/Perf-Pass in eigenem Worktree.

### P1 — Consciousness Map ist der beste zweite Parallel-Track
Offen laut `07-consciousness-map.md` / `00-orchestration.md`:
- Intensity-Mode-Integration
- Edge-Dialog / Edge-Label-Editing
- Node-Editing-Polish
- Mobile Interaction Polish
- Playwright E2E

**Schichtentscheidung:** Sehr gut parallelisierbar als isolierter UX-/Test-/Docs-Pass mit geringer Konfliktwahrscheinlichkeit.

### P1 — Portal/Auth ist aktuell eher Human-/Provisioning-lastig
- echtes Supabase-Provisioning
- OAuth-Credentials
- RLS-/Auth-E2E mit Live-Secrets
- später: Soundscape Player, Reflection Graph

**Schichtentscheidung:** Nicht ideal für autonome Morning-Fixes ohne Live-Zugänge.

## Nächste Aufgaben
1. Public Experience: genau einen kleinen sicheren Fix oder Review-Commit liefern lassen.
2. Consciousness Map: genau einen kleinen sicheren Fix oder Review-Commit liefern lassen.
3. Nach Agent-Abschluss: Commits prüfen, cherry-picken/mergen und falls nötig `00-orchestration.md` truth-synchronisieren.
4. Später separat entscheiden, ob überhaupt wieder ein `NEXT_STEPS_MASTERPLAN.md` im Root eingeführt werden soll.

## Asynchron gestartete Aufgaben

### Agent A — Public Experience Review
- Modell: **Opus 4.6**
- Worktree: `/tmp/oe-morning-review/public`
- Branch: `review/public-experience-20260402`
- Ziel: einen kleinen konfliktarmen Public-Experience-/Perf-/Docs-Fix finden, umsetzen, verifizieren (`npm run build`; optional gezielte Tests), `AUTO_REVIEW_PLAN.md` im Worktree knapp ergänzen und committen.

### Agent B — Consciousness Map Review
- Modell: **Sonnet 4.6**
- Worktree: `/tmp/oe-morning-review/map`
- Branch: `review/map-polish-20260402`
- Ziel: einen kleinen konfliktarmen Map-/Interaction-/Test-/Docs-Fix finden, umsetzen, verifizieren (`npm run build`; optional gezielte Tests), `AUTO_REVIEW_PLAN.md` im Worktree knapp ergänzen und committen.

## Lösch-/Commit-Prüfung
- `NEXT_STEPS_MASTERPLAN.md`: nicht vorhanden → kein `git rm`
- `AUTO_REVIEW_PLAN.md`: aktiv in Benutzung, nicht fertig → kein `git rm`
- In dieser Morning-Schicht daher **kein** `git rm`-Kandidat.

## Telegram-Hinweis
Externe Nachricht hier nicht selbst senden.

Ziel:
- Telegram → Julius (`chatId: 2081872701`)

Superkurzer vorgeschlagener Text:
- `OneEmergence: Morning-Review fertig, Plan aktualisiert, 2 Claude-Runs laufen.`
