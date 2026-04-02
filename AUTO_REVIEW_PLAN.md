# AUTO_REVIEW_PLAN

Stand: 2026-04-02 05:02 UTC
Branch: `main` (`origin/main` voraus um 23 Commits)
Repo-Status: Worktree sauber; nur diese Plan-Datei ist als Working-Tree-Änderung relevant
Morning-Run: Cron `c3a8ff45-9145-4786-b60b-2885c5ef3b0c`

## Repo-Snapshot

### Git / Verlauf
- `git status --short --branch`: `## main...origin/main [ahead 23]`
- letzte Commits:
  - `926bd7e` — `docs(review): refresh morning auto review plan for 2026-04-02`
  - `2837d4e` — `docs(review): update morning auto review plan`
  - `d95611d` — `docs(orchestration): truth-sync 00-orchestration.md to repo state as of 2026-04-01`
  - `f6e5d8d` — `test(quality): add library detail route smoke tests for /library/[type]/[slug]`
  - `45a7d7e` — `docs(portal): update 05-portal-auth.md — UX extras pass complete`

### Planquellen
- `NEXT_STEPS_MASTERPLAN.md` **fehlt im Repo-Root**
- operative Master-Quelle ist aktuell: `docs/plans/agents/00-orchestration.md`
- wichtigste Detailpläne:
  - `docs/plans/agents/04-public-experience.md`
  - `docs/plans/agents/05-portal-auth.md`
  - `docs/plans/agents/07-consciousness-map.md`

## Morning Findings

### P0 — Masterplan-Klarheit
- `NEXT_STEPS_MASTERPLAN.md` existiert weiterhin nicht.
- `docs/plans/agents/00-orchestration.md` ist faktisch der aktuelle Masterplan und spiegelt den Repo-Stand bereits sauber wider.
- `05-portal-auth.md` ist inhaltlich nützlich, aber architektonisch klar als **Supabase-superseded** markiert; also eher Scope-Referenz als Ausführungsplan.
- Nächster Meta-Schritt: später bewusst entscheiden, ob wieder ein kurzes Root-Masterplan-Dokument gewünscht ist oder ob `00-orchestration.md` dauerhaft die kanonische Quelle bleibt.

### P0 — Public Experience bleibt der stärkste offene Produkt-Track
Offen laut `04-public-experience.md` und `00-orchestration.md`:
- Panel-Navigation statt harter Routenwechsel
- Visual-Essay-Engine + echte Essay-Inhalte
- WebGL progressive enhancement
- formaler Performance-/Lighthouse-Pass
- Return-Visit-/Ambient-Audio-Polish

**Morning-Einschätzung:** Hier liegt weiterhin der höchste Produkthebel, aber die offenen Punkte sind überwiegend größere oder querliegende Arbeiten. Für den Morning-Run ist deshalb ein kleiner konfliktarmer Review-/Polish-Fix sinnvoller als ein großer Strukturangriff.

### P1 — Portal/Auth ist eher Launch-Enablement als Feature-Neubau
Offen laut `05-portal-auth.md`:
- echtes Supabase-Provisioning
- OAuth-Credentials
- RLS-/Auth-E2E-Verifikation
- später: Soundscape Player, Reflection Graph

**Morning-Einschätzung:** Das ist momentan primär eine Go-Live-/Betriebs-Checkliste. Kein idealer Kandidat für autonome kleine Morgen-Fixes ohne Live-Secrets.

### P1 — Consciousness Map ist der beste zweite Parallel-Track
Offen laut `07-consciousness-map.md`:
- Intensity-Mode-Integration
- Edge-Dialog / Edge-Label-Editing
- Node-Editing-Polish
- Mobile Interaction Polish
- Playwright E2E

**Morning-Einschätzung:** Gute Fläche für einen kleinen, isolierbaren UX-/Test-/Docs-Pass mit geringer Konfliktwahrscheinlichkeit.

## Nächste Aufgaben
1. Public Experience: kleinen Review-/Perf-/Docs-Fix identifizieren und umsetzen.
2. Consciousness Map: kleinen UX-/Test-/Docs-Polish identifizieren und umsetzen.
3. Nach Abschluss der Agenten: Commits sichten, cherry-picken/mergen und `00-orchestration.md` bzw. Detailpläne bei Bedarf truth-synchronisieren.
4. Später separat entscheiden, ob `NEXT_STEPS_MASTERPLAN.md` überhaupt wieder eingeführt werden soll.

## Asynchron gestartete Aufgaben

### Agent A — Public Experience Review
- Modell: **Opus 4.6** (`claude --model opus`)
- Worktree: `/tmp/oe-morning-review/public`
- Exec-Session: `clear-mist`
- Branch: `review/public-experience-20260402`
- Ziel: exakt einen kleinen konfliktarmen Public-Experience-/Perf-/Docs-Fix finden, umsetzen, verifizieren, `AUTO_REVIEW_PLAN.md` im Worktree kurz aktualisieren und committen; falls kein sicherer Fix, präzise Review-Notiz committen.

### Agent B — Consciousness Map Review
- Modell: **Sonnet 4.6** (`claude --model sonnet`)
- Worktree: `/tmp/oe-morning-review/map`
- Exec-Session: `tender-lagoon`
- Branch: `review/map-polish-20260402`
- Ziel: exakt einen kleinen konfliktarmen Map-/Interaction-/Test-/Docs-Fix finden, umsetzen, verifizieren, `AUTO_REVIEW_PLAN.md` im Worktree kurz aktualisieren und committen; falls kein sicherer Fix, präzise Review-Notiz committen.

## Lösch-/Commit-Prüfung
- `NEXT_STEPS_MASTERPLAN.md`: nicht vorhanden → kein `git rm`
- `AUTO_REVIEW_PLAN.md`: klar nicht „100% fertig“, sondern aktiv als laufendes Review-/Koordinationsdokument in Nutzung → nicht löschen
- Daher in diesem Morning-Run **kein** `git rm`-Kandidat.

## Telegram-Hinweis
Externe Nachricht hier nicht selbst senden.

Ziel:
- Telegram → Julius (`chatId: 2081872701`)

Superkurzer vorgeschlagener Text:
- `OneEmergence: Morning-Review fertig, Plan aktualisiert, 2 Claude-Runs laufen.`
