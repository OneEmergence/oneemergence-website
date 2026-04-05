# AUTO_REVIEW_PLAN

Stand: 2026-04-05 04:00 UTC
Branch: `main`
Repo-Status: `main` ahead of `origin/main` by 35; lokal modifiziert: `AUTO_REVIEW_PLAN.md`, `MORNING_AGENT_HANDOFF.md`
Morning-Run: Cron `c3a8ff45-9145-4786-b60b-2885c5ef3b0c`

## Repo-Snapshot

### Git / Verlauf
- `git status --short --branch`: `## main...origin/main [ahead 35]`
- lokale Änderungen: `M AUTO_REVIEW_PLAN.md`, `M MORNING_AGENT_HANDOFF.md`
- letzte relevante Commits:
  - `480409a` — `docs(review): refresh morning auto review plan for 2026-04-04 07:05 UTC`
  - `eb979e5` — `docs(review): refresh morning auto review plan for 2026-04-04 05:01 UTC`
  - `5eb12e3` — `fix(a11y): add skip-to-content link in root layout`
  - `189fa1d` — `feat(map): render edge labels at line midpoints in ForceGraph`
  - `52f9875` — `docs(review): refresh morning auto review plan for 2026-04-04 04:00 UTC`

### Planquellen
- `NEXT_STEPS_MASTERPLAN.md` fehlt weiterhin im Repo.
- Kanonische Master-Quelle bleibt: `docs/plans/agents/00-orchestration.md`.
- Zusätzliche operative Detailquellen:
  - `docs/plans/agents/04-public-experience.md`
  - `docs/plans/agents/07-consciousness-map.md`

## Morning Findings

### P0 — Root-Masterplan fehlt weiterhin
- `NEXT_STEPS_MASTERPLAN.md` ist aktuell nicht vorhanden.
- Entsprechend gibt es keinen Update- oder Löschpfad für diese Datei in dieser Schicht.
- Die operative Truth-Source für offene Website-Arbeit bleibt `docs/plans/agents/00-orchestration.md`.

### P0 — Verbleibender Scope ist weiterhin klar und gut parallelisierbar
Aus `00-orchestration.md` ergeben sich als relevante Resttracks:
- **Public Experience Polish**: Panel-Navigation, Visual Essays, WebGL progressive enhancement, formaler Performance-Audit
- **Portal Restpunkte**: Soundscape Player, Reflection Graph sowie menschliche Live-Provisioning-/OAuth-Themen
- **Consciousness Map Polish**: Intensity-Mode-Integration, Mobile-Polish, Canvas-Fallback, E2E

### P0 — Die jüngsten Main-Commits schließen kleine sinnvolle Gaps, nicht den gesamten Restplan
- `5eb12e3` ergänzt einen **Skip-to-content-Link** in `src/app/layout.tsx`.
- `189fa1d` ergänzt **sichtbare Edge-Labels** in `src/features/map/components/ForceGraph.tsx`.
- Diese Schritte sind gute inkrementelle Verbesserungen, aber die großen offenen Tracks aus Public Experience und Map-Polish bleiben bestehen.

### P1 — `MORNING_AGENT_HANDOFF.md` bleibt offener Handoff-/Log-Puffer
- Die Datei ist lokal modifiziert und offenbar bewusst kumulativ genutzt.
- In dieser Schicht daher **kein** autonomer Bereinigungs- oder Rewrite-Versuch auf `main`.
- Vor einem späteren Push/Merge sollte bewusst entschieden werden, ob sie als fortlaufendes Log bestehen bleibt oder kuratiert wird.

### P1 — Beste nächste Morning-Spuren für Parallelisierung
Für diese Schicht bleiben zwei kleine, voneinander weitgehend unabhängige Tracks sinnvoll:
1. **Public Nav / Layout A11y-Semantik**  
   Ein einzelner kleiner, konfliktarmer Fix rund um Landmarken, Mobile-Menü-Semantik, Fokusführung oder Heading-Polish.
2. **Map Polish / Intensity- oder Mobile-Verhalten**  
   Ein einzelner kleiner, konfliktarmer Fix rund um Touch-/Mobile-Verhalten, Rendering-Resilienz, Intensity-Mode-Verhalten oder Edge-Label-Lesbarkeit.

### P1 — Themen, die bewusst nicht autonom auf `main` gezogen werden
- Live-Supabase-/OAuth-/Secrets-Themen
- RLS-/Auth-E2E mit echten Credentials
- große WebGL-Umbauten
- harte Navigations-Architekturwechsel
- asset-abhängige Soundscape-/Reflection-Graph-Lieferungen

## Nächste Aufgaben
1. Ergebnisse der zwei neuen Claude-Code-Worktree-Runs abwarten.
2. Danach jeweils Commit, Verifikation und `MORNING_AGENT_HANDOFF.md` in den Worktrees prüfen.
3. Nur kleine, konfliktarme Änderungen gezielt nach `main` übernehmen.
4. Anschließend `MORNING_AGENT_HANDOFF.md` auf `main` kuratieren, falls die Datei als dauerhaftes Morning-Log bestehen soll.
5. Weiter beobachten, ob künftig wieder eine Root-Datei `NEXT_STEPS_MASTERPLAN.md` eingeführt wird.

## Asynchron gestartete Aufgaben

### Agent A — Public Nav / Layout A11y Follow-up
- Modell: **Claude Opus 4.6**
- Ziel:
  - genau **einen** kleinen konfliktarmen Accessibility-/Semantik-Fix im Public-Layout/Nav identifizieren
  - umsetzen
  - gezielt verifizieren
  - committen
  - `MORNING_AGENT_HANDOFF.md` im Worktree mit einer kompakten Übergabe aktualisieren
- Status: **in dieser Schicht asynchron gestartet**

### Agent B — Map Polish Follow-up
- Modell: **Claude Sonnet 4.6**
- Ziel:
  - genau **einen** kleinen konfliktarmen Map-Polish-Fix identifizieren
  - umsetzen
  - gezielt verifizieren
  - committen
  - `MORNING_AGENT_HANDOFF.md` im Worktree mit einer kompakten Übergabe aktualisieren
- Status: **in dieser Schicht asynchron gestartet**

## Lösch-/Commit-Prüfung
- `NEXT_STEPS_MASTERPLAN.md`: nicht vorhanden → kein `git rm`
- `AUTO_REVIEW_PLAN.md`: operative Review-Datei, klar nicht 100% fertig → kein `git rm`
- Ergebnis: in dieser Morning-Schicht aktuell kein `git rm`-Kandidat

## Telegram-Hinweis
Externe Nachricht laut Task hier **nicht selbst senden**.

Ziel:
- Telegram → Julius (`chatId: 2081872701`)

Superkurzer vorgeschlagener Text:
- `OneEmergence: Review aktualisiert, 2 Claude-Runs gestartet.`
