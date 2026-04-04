# AUTO_REVIEW_PLAN

Stand: 2026-04-04 04:00 UTC
Branch: `main`
Repo-Status: Worktree sauber; Morning-Run aktiv
Morning-Run: Cron `c3a8ff45-9145-4786-b60b-2885c5ef3b0c`

## Repo-Snapshot

### Git / Verlauf
- `git status --short`: sauber vor dieser Aktualisierung
- Branch: `main`
- letzte Commits:
  - `4d57360` — `docs(review): refresh morning auto review plan for 2026-04-03 07:06 UTC`
  - `6d6f639` — `docs(review): refresh morning auto review plan for 2026-04-03 06:04 UTC`
  - `8604f81` — `docs(review): refresh morning auto review plan for 2026-04-03 05:02 UTC`
  - `c6d297f` — `docs(review): refresh morning auto review plan for 2026-04-03 04:00 UTC`
  - `6875d6d` — `docs(review): refresh morning auto review plan for 2026-04-02 07:05 UTC`

### Planquellen
- `NEXT_STEPS_MASTERPLAN.md` **fehlt weiterhin im Repo**
- kanonische Master-Quelle bleibt: `docs/plans/agents/00-orchestration.md`
- ergänzende operative Quellen:
  - `docs/plans/agents/04-public-experience.md`
  - `docs/plans/agents/07-consciousness-map.md`

## Morning Findings

### P0 — Root-Masterplan bleibt nicht vorhanden
- Es gibt weiterhin **keine** Root-Datei `NEXT_STEPS_MASTERPLAN.md`.
- Damit gibt es heute weder einen Update-Kandidaten noch einen Löschkandidaten auf Root-Ebene.
- `docs/plans/agents/00-orchestration.md` bleibt die operative Wahrheit für den verbliebenen Scope.

### P0 — Verbliebener Scope ist sauber konzentriert
`docs/plans/agents/00-orchestration.md` bestätigt die aktuell wichtigsten Resttracks:
- **Public Experience Polish**: Panel-Navigation, Visual Essays, WebGL progressive enhancement, Performance-Audit
- **Portal Restpunkte**: Soundscape Player, Reflection Graph sowie mensch-/secret-lastige Provisioning-Themen
- **Consciousness Map Polish**: Intensity-Integration, mobile polish, Canvas-Fallback, E2E

### P1 — Konfliktarme Morning-Tracks für Parallelisierung
Für diese Schicht sind weiterhin 2 kleine, gut parallelisierbare Review-Linien sinnvoll:
1. **Public Experience** — ein kleiner UX-/A11y-/Perf-/content-naher Fix in isoliertem Worktree
2. **Consciousness Map** — ein kleiner Interaction-/UX-/test-naher Fix in isoliertem Worktree

### P1 — Was bewusst außerhalb der Frühschicht bleibt
Folgende Themen werden weiterhin **nicht** autonom auf `main` angefasst:
- Live-Supabase-/OAuth-/Secrets-Themen
- RLS-/Auth-E2E mit echten Credentials
- große WebGL-Umbauten oder harte Navigations-Architekturwechsel
- asset-abhängige Soundscape-/Reflection-Graph-Lieferungen

## Nächste Aufgaben
1. Ergebnisse der beiden asynchronen Claude-Code-Reviews abwarten.
2. Danach deren Diffs, Verifikation und Handoff-Notizen prüfen.
3. Nur kleine konfliktarme Änderungen nach Review in `main` übernehmen.
4. Falls ein Agent neue Wahrheit über Restscope erzeugt, `00-orchestration.md` danach truth-syncen.
5. Weiter beobachten, ob künftig wieder eine Root-Datei `NEXT_STEPS_MASTERPLAN.md` eingeführt werden soll.

## Asynchron gestartete Aufgaben

### Agent A — Public Experience Review
- Modell: **Claude Opus 4.6**
- Worktree: `/tmp/oe-morning-review/public-20260404`
- Branch: `review/public-experience-20260404`
- Ziel:
  - genau **einen** kleinen konfliktarmen Public-Experience-Fix identifizieren
  - umsetzen
  - gezielt verifizieren
  - committen
  - `MORNING_AGENT_HANDOFF.md` hinterlassen
- Status: **wird in dieser Schicht asynchron gestartet**

### Agent B — Consciousness Map Review
- Modell: **Claude Sonnet 4.6**
- Worktree: `/tmp/oe-morning-review/map-20260404`
- Branch: `review/map-polish-20260404`
- Ziel:
  - genau **einen** kleinen konfliktarmen Map-Fix identifizieren
  - umsetzen
  - gezielt verifizieren
  - committen
  - `MORNING_AGENT_HANDOFF.md` hinterlassen
- Status: **wird in dieser Schicht asynchron gestartet**

## Lösch-/Commit-Prüfung
- `NEXT_STEPS_MASTERPLAN.md`: nicht vorhanden → kein `git rm`
- `AUTO_REVIEW_PLAN.md`: operative Datei, **nicht** 100% fertig → kein `git rm`
- Ergebnis: in dieser Morning-Schicht aktuell **kein** `git rm`-Kandidat

## Telegram-Hinweis
Externe Nachricht laut Task **nicht selbst senden**.

Ziel:
- Telegram → Julius (`chatId: 2081872701`)

Superkurzer vorgeschlagener Text:
- `OneEmergence: Morning-Review aktualisiert, 2 Claude-Runs laufen.`
