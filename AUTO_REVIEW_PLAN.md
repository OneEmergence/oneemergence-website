# AUTO_REVIEW_PLAN

Stand: 2026-04-02 04:00 UTC
Branch: `main` (`origin/main` voraus um 22 Commits)
Repo-Status: Worktree sauber; nur diese Plan-Datei ist als Working-Tree-Änderung relevant
Morning-Run: Cron `c3a8ff45-9145-4786-b60b-2885c5ef3b0c`

## Repo-Snapshot

### Git / Verlauf
- `git status --short --branch`: `## main...origin/main [ahead 22]`
- letzte Commits:
  - `2837d4e` — `docs(review): update morning auto review plan`
  - `d95611d` — `docs(orchestration): truth-sync 00-orchestration.md to repo state as of 2026-04-01`
  - `f6e5d8d` — `test(quality): add library detail route smoke tests for /library/[type]/[slug]`
  - `45a7d7e` — `docs(portal): update 05-portal-auth.md — UX extras pass complete`
  - `818baf5` — `feat(portal): add practice history page`

### Planquellen
- `NEXT_STEPS_MASTERPLAN.md` **fehlt im Repo-Root**
- operative Master-Quelle ist aktuell: `docs/plans/agents/00-orchestration.md`
- wichtigste Detailpläne:
  - `docs/plans/agents/04-public-experience.md`
  - `docs/plans/agents/05-portal-auth.md`
  - `docs/plans/agents/07-consciousness-map.md`

## Morning Findings

### P0 — Masterplan-Klarheit
- `NEXT_STEPS_MASTERPLAN.md` existiert nicht.
- `00-orchestration.md` ist faktisch der aktuelle Masterplan und wurde gestern truth-synchronisiert.
- Nächster Schritt: entweder bewusst dabei bleiben oder später eine knappe Top-Level-Zusammenfassung anlegen.

### P0 — Public Experience bleibt der wichtigste offene Produkt-Track
Offen laut `04-public-experience.md`:
- Panel-Navigation statt harter Routenwechsel
- Visual-Essay-Engine + echte Essays
- WebGL progressive enhancement
- formaler Performance-/Lighthouse-Pass
- Return-Visit-/Ambient-Audio-Polish

**Empfehlung:** kein breiter Redesign-Loop, sondern ein enger Review-/Polish-Pass mit einem kleinen konfliktarmen Fix.

### P1 — Portal/Auth ist funktional, Rest ist eher Go-Live als Neubau
Offen laut `05-portal-auth.md`:
- echtes Supabase-Provisioning
- OAuth-Credentials
- RLS-/Auth-E2E-Verifikation
- später: Soundscape Player, Reflection Graph

**Empfehlung:** als Go-Live-/QA-Checklist behandeln, nicht als großen Feature-Track.

### P1 — Consciousness Map eignet sich gut für parallelen kleinen Polish
Offen laut `07-consciousness-map.md`:
- Intensity-Mode-Integration
- Edge-Dialog / Edge-Label-Editing
- Node-Editing-Polish
- Mobile Interaction Polish
- Playwright E2E

**Empfehlung:** konfliktarmen Mini-Pass parallel fahren.

## Nächste Aufgaben
1. Public Experience: kleinen Review-/Perf-/Docs-Fix identifizieren und umsetzen.
2. Consciousness Map: kleinen UX-/Test-/Docs-Polish identifizieren und umsetzen.
3. Danach Ergebnisse mergen bzw. in Plan/Orchestration rückspiegeln.
4. Später separat entscheiden, ob `NEXT_STEPS_MASTERPLAN.md` überhaupt wieder eingeführt werden soll.

## Asynchron gestartete Aufgaben

### Agent A — Public Experience Review
- Modell: **Opus 4.6**
- Ziel: exakt einen kleinen konfliktarmen Public-Experience-/Perf-/Docs-Fix finden, umsetzen, verifizieren, committen; falls kein sicherer Fix, präzise Review-Notiz im Worktree hinterlassen.

### Agent B — Consciousness Map Review
- Modell: **Sonnet 4.6**
- Ziel: exakt einen kleinen konfliktarmen Map-/Interaction-/Test-/Docs-Fix finden, umsetzen, verifizieren, committen; falls kein sicherer Fix, präzise Review-Notiz im Worktree hinterlassen.

## Lösch-/Commit-Prüfung
- `NEXT_STEPS_MASTERPLAN.md`: nicht vorhanden → kein `git rm`
- `AUTO_REVIEW_PLAN.md`: aktiv benötigt → nicht löschen
- Daher in diesem Morning-Run **kein** `git rm`-Kandidat.

## Telegram-Hinweis
Externe Nachricht hier nicht selbst senden.

Ziel:
- Telegram → Julius (`chatId: 2081872701`)

Superkurzer vorgeschlagener Text:
- `OneEmergence: Morning-Review fertig, Plan aktualisiert, 2 Claude-Runs gestartet.`
