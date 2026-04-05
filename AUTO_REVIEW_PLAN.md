# AUTO_REVIEW_PLAN

Stand: 2026-04-05 05:01 UTC
Branch: `main`
Repo-Status: `main` ahead of `origin/main` by 36; lokal modifiziert: `MORNING_AGENT_HANDOFF.md`
Morning-Run: Cron `c3a8ff45-9145-4786-b60b-2885c5ef3b0c`

## Repo-Snapshot

### Git / Verlauf
- `git status --short --branch`: `## main...origin/main [ahead 36]`
- lokale Änderungen: `M MORNING_AGENT_HANDOFF.md`
- letzte relevante Commits:
  - `e9a1883` — `docs(review): refresh morning auto review plan for 2026-04-05 04:00 UTC`
  - `480409a` — `docs(review): refresh morning auto review plan for 2026-04-04 07:05 UTC`
  - `eb979e5` — `docs(review): refresh morning auto review plan for 2026-04-04 05:01 UTC`
  - `5eb12e3` — `fix(a11y): add skip-to-content link in root layout`
  - `189fa1d` — `feat(map): render edge labels at line midpoints in ForceGraph`

### Planquellen
- `NEXT_STEPS_MASTERPLAN.md` fehlt weiterhin im Repo.
- Kanonische Master-Quelle bleibt: `docs/plans/agents/00-orchestration.md`.
- Zusätzliche operative Detailquellen:
  - `docs/plans/agents/04-public-experience.md`
  - `docs/plans/agents/07-consciousness-map.md`

## Morning Findings

### P0 — Root-Masterplan fehlt weiterhin
- `NEXT_STEPS_MASTERPLAN.md` ist auch in dieser Schicht nicht vorhanden.
- Entsprechend gibt es weder Update- noch Löschpfad für diese Datei.
- Die operative Truth-Source für offene Website-Arbeit bleibt `docs/plans/agents/00-orchestration.md`.

### P0 — Restscope bleibt klar: Public-Polish + Map-Polish
Aus `00-orchestration.md` bleiben vor allem diese Tracks offen:
- **Public Experience Polish**: Panel-Navigation, Visual Essays, WebGL progressive enhancement, formaler Performance-Audit.
- **Portal-Restpunkte**: Soundscape Player, Reflection Graph sowie menschliche Live-Provisioning-/OAuth-Themen.
- **Consciousness Map Polish**: Intensity-Mode-Integration, Mobile-Polish, Canvas-Fallback, E2E.

### P0 — Jüngste Main-Commits schließen kleine Gaps, nicht die großen Resttracks
- `5eb12e3` ergänzt einen **Skip-to-content-Link** in `src/app/layout.tsx`.
- `189fa1d` ergänzt **sichtbare Edge-Labels** in `src/features/map/components/ForceGraph.tsx`.
- Beides sind gute inkrementelle Verbesserungen, aber weder Public-Polish noch Map-Polish sind damit abgeschlossen.

### P1 — `MORNING_AGENT_HANDOFF.md` bleibt offener, bewusst kumulativer Log-Puffer
- Die Datei ist lokal modifiziert und wird weiterhin als fortlaufender Handoff-/Review-Speicher genutzt.
- In dieser Schicht daher **kein** autonomes Kuratieren oder Aufräumen auf `main`.
- Bei späterer Integration von Worktree-Ergebnissen sollte bewusst entschieden werden, ob einzelne ältere Blöcke verdichtet werden.

### P1 — Beste Morning-Parallelisierung für diese Schicht
Zwei kleine, voneinander weitgehend unabhängige Tracks bleiben sinnvoll:
1. **Public Nav / Layout A11y-Semantik**  
   Ein einzelner kleiner, konfliktarmer Fix rund um Landmarken, Fokusführung, Mobile-Menü-Semantik oder Headings.
2. **Map Polish / Intensity- oder Mobile-Verhalten**  
   Ein einzelner kleiner, konfliktarmer Fix rund um Touch-/Mobile-Verhalten, Intensity-Mode-Verhalten oder Rendering-Resilienz.

### P1 — Themen, die bewusst nicht autonom auf `main` gezogen werden
- Live-Supabase-/OAuth-/Secrets-Themen
- RLS-/Auth-E2E mit echten Credentials
- große WebGL-Umbauten
- harte Navigations-Architekturwechsel
- asset-abhängige Soundscape-/Reflection-Graph-Lieferungen

## Nächste Aufgaben
1. Ergebnisse der zwei frisch gestarteten Claude-Code-Worktree-Runs abwarten.
2. Danach je Run Commit, Verifikation und `MORNING_AGENT_HANDOFF.md` prüfen.
3. Nur kleine, konfliktarme Änderungen gezielt nach `main` übernehmen.
4. Danach `MORNING_AGENT_HANDOFF.md` auf `main` bewusst kuratieren, falls die Datei als dauerhaftes Morning-Log bestehen soll.
5. Weiter beobachten, ob künftig wieder eine Root-Datei `NEXT_STEPS_MASTERPLAN.md` eingeführt wird.

## Asynchron gestartete Aufgaben

### Agent A — Public Nav / Layout A11y Follow-up
- Modell: **Claude Opus 4.6**
- Worktree: `/tmp/oe-morning-review/public-20260405-b`
- Branch: `review/public-a11y-followup-20260405-b`
- Exec-Session: `fast-valley`
- Ziel:
  - genau **einen** kleinen konfliktarmen Accessibility-/Semantik-Fix im Public-Layout/Nav identifizieren
  - umsetzen
  - gezielt verifizieren
  - `MORNING_AGENT_HANDOFF.md` im Worktree prependen
  - committen
- Status: **in dieser Schicht asynchron gestartet**

### Agent B — Map Polish Follow-up
- Modell: **Claude Sonnet 4.6**
- Worktree: `/tmp/oe-morning-review/map-20260405-b`
- Branch: `review/map-polish-20260405-b`
- Exec-Session: `tidy-river`
- Ziel:
  - genau **einen** kleinen konfliktarmen Map-Polish-Fix identifizieren
  - umsetzen
  - gezielt verifizieren
  - `MORNING_AGENT_HANDOFF.md` im Worktree prependen
  - committen
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
