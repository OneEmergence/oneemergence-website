# AUTO_REVIEW_PLAN

Stand: 2026-04-04 05:01 UTC
Branch: `main`
Repo-Status: `main` ahead of `origin/main` by 33; `MORNING_AGENT_HANDOFF.md` lokal modifiziert
Morning-Run: Cron `c3a8ff45-9145-4786-b60b-2885c5ef3b0c`

## Repo-Snapshot

### Git / Verlauf
- `git status --short --branch`: `## main...origin/main [ahead 33]` plus lokales `M MORNING_AGENT_HANDOFF.md`
- letzte relevante Commits:
  - `5eb12e3` — `fix(a11y): add skip-to-content link in root layout`
  - `189fa1d` — `feat(map): render edge labels at line midpoints in ForceGraph`
  - `52f9875` — `docs(review): refresh morning auto review plan for 2026-04-04 04:00 UTC`
- `claude` CLI ist verfügbar: `/home/opclaw/.local/bin/claude`

### Planquellen
- `NEXT_STEPS_MASTERPLAN.md` fehlt weiterhin im Repo
- kanonische Master-Quelle bleibt: `docs/plans/agents/00-orchestration.md`
- ergänzende operative Quellen:
  - `docs/plans/agents/04-public-experience.md`
  - `docs/plans/agents/07-consciousness-map.md`

## Morning Findings

### P0 — Root-Masterplan bleibt nicht vorhanden
- Es gibt weiterhin keine Root-Datei `NEXT_STEPS_MASTERPLAN.md`.
- Damit gibt es in dieser Schicht weder einen Update- noch einen Löschkandidaten auf Root-Ebene.
- `docs/plans/agents/00-orchestration.md` bleibt die operative Quelle für den verbliebenen Scope.

### P0 — Restscope bleibt fokussiert und bestätigt
`docs/plans/agents/00-orchestration.md` bestätigt die verbleibenden Haupttracks:
- **Public Experience Polish**: Panel-Navigation, Visual Essays, WebGL progressive enhancement, Performance-Audit
- **Portal Restpunkte**: Soundscape Player, Reflection Graph, mensch-/secret-lastige Provisioning-Themen
- **Consciousness Map Polish**: Intensity-Integration, mobile polish, Canvas-Fallback, E2E

### P0 — Zwei kleine Morning-Fixes sind bereits auf `main` gelandet
- **Public Experience**: Skip-to-content-Link in `src/app/layout.tsx` ist bereits committed (`5eb12e3`).
- **Consciousness Map**: Edge-Labels werden in `src/features/map/components/ForceGraph.tsx` gerendert (`189fa1d`).
- Beide Änderungen sind klein, konfliktarm und konsistent mit den offenen Restpunkten der Agent-Pläne.

### P1 — Handoff-Datei ist aktuell kein sauberer Truth-Source-Zustand
- `MORNING_AGENT_HANDOFF.md` ist lokal modifiziert und enthält aktuell zwei Morning-Handoffs in einer Datei.
- Das ist als Zwischenzustand brauchbar, aber nicht die zuverlässigste langfristige Review-Quelle.
- Vor späterem Merge/Push sollte entschieden werden, ob die Datei als Tageslog bewusst so bleiben soll oder erneut kuratiert wird.

### P1 — Nächste sinnvolle Parallelspur bleibt klein und konfliktarm
Für diese Schicht sind 2 weitere kleine, klar getrennte Async-Spuren sinnvoll:
1. **Public Nav / Layout A11y-Semantik** — ein einzelner kleiner Fix rund um Landmarken, Mobile-Menü-Semantik oder Fokus-Polish
2. **Map Label Polish** — ein einzelner kleiner Fix rund um Edge-Label-Lesbarkeit oder Overflow in `ForceGraph`

### P1 — Was bewusst außerhalb der Frühschicht bleibt
Folgende Themen werden weiterhin nicht autonom auf `main` angefasst:
- Live-Supabase-/OAuth-/Secrets-Themen
- RLS-/Auth-E2E mit echten Credentials
- große WebGL-Umbauten oder harte Navigations-Architekturwechsel
- asset-abhängige Soundscape-/Reflection-Graph-Lieferungen

## Nächste Aufgaben
1. Ergebnisse der beiden frisch gestarteten Claude-Code-Worktrees abwarten.
2. Danach deren Commits, Verifikation und `MORNING_AGENT_HANDOFF.md` im jeweiligen Worktree prüfen.
3. Nur kleine konfliktarme Änderungen gezielt nach `main` übernehmen.
4. Anschließend `MORNING_AGENT_HANDOFF.md` auf `main` sauber kuratieren, falls die Datei dauerhaft als Review-Log behalten werden soll.
5. Weiter beobachten, ob künftig wieder eine Root-Datei `NEXT_STEPS_MASTERPLAN.md` eingeführt werden soll.

## Asynchron gestartete Aufgaben

### Agent A — Public Nav / Layout A11y Follow-up
- Modell: **Claude Opus 4.6** (`--model opus`)
- Worktree: `/tmp/oe-morning-review/public-20260404-b`
- Branch: `review/public-a11y-followup-20260404`
- Session: `wild-sable`
- Ziel:
  - genau **einen** kleinen konfliktarmen Accessibility-/Semantik-Fix im Public-Layout/Nav identifizieren
  - umsetzen
  - gezielt verifizieren
  - committen
  - `MORNING_AGENT_HANDOFF.md` im Worktree überschreiben
- Status: **asynchron gestartet**

### Agent B — Map Label Polish Follow-up
- Modell: **Claude Sonnet 4.6** (`--model sonnet`)
- Worktree: `/tmp/oe-morning-review/map-20260404-b`
- Branch: `review/map-label-polish-20260404`
- Session: `wild-trail`
- Ziel:
  - genau **einen** kleinen konfliktarmen Map-Polish-Fix rund um Edge-Labels / Lesbarkeit identifizieren
  - umsetzen
  - gezielt verifizieren
  - committen
  - `MORNING_AGENT_HANDOFF.md` im Worktree überschreiben
- Status: **asynchron gestartet**

## Lösch-/Commit-Prüfung
- `NEXT_STEPS_MASTERPLAN.md`: nicht vorhanden → kein `git rm`
- `AUTO_REVIEW_PLAN.md`: operative Datei, nicht 100% fertig → kein `git rm`
- Ergebnis: in dieser Morning-Schicht aktuell kein `git rm`-Kandidat

## Telegram-Hinweis
Externe Nachricht laut Task nicht selbst senden.

Ziel:
- Telegram → Julius (`chatId: 2081872701`)

Superkurzer vorgeschlagener Text:
- `OneEmergence: Review aktualisiert, 2 Claude-Runs gestartet.`
