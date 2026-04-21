# AUTO_REVIEW_PLAN

Stand: 2026-04-21 04:00 UTC
Branch: `main`
Repo-Status: lokale Änderungen in `AUTO_REVIEW_PLAN.md`; `main` ist `39` Commits vor `origin/main`
Morning-Run: Cron `c3a8ff45-9145-4786-b60b-2885c5ef3b0c`

## Repo-Snapshot

### Git / Verlauf
- `git status --short --branch` beim Review-Start:
  - `M AUTO_REVIEW_PLAN.md`
- Arbeitsbranch: `main`
- Ahead/behind gegen `origin/main`: `0 behind / 39 ahead`
- Morning-Lesart: Der bestehende Review-Flow funktioniert gut für kleine, konfliktarme Qualitäts-Fixes. Große Produktarbeit bleibt außerhalb dieses Cron-Slots.

### Planquellen
- Root-Datei `NEXT_STEPS_MASTERPLAN.md` ist **nicht vorhanden**.
- Kanonische Masterquelle bleibt `docs/plans/agents/00-orchestration.md`.
- Zusätzliche Review-Quellen dieser Schicht:
  - `MORNING_AGENT_HANDOFF.md`
  - `src/components/layout/Footer.tsx`
  - `src/features/map/components/ForceGraph.tsx`

## Morning Findings

### P0 — Root-Masterplan fehlt weiterhin
- Es gibt weiterhin **keine** Datei `NEXT_STEPS_MASTERPLAN.md` im Repo-Root.
- Entsprechend gibt es heute weder einen Update-Pfad noch einen `git rm`-Pfad für diese Datei.
- Operative Wahrheit für offene Tracks bleibt `docs/plans/agents/00-orchestration.md`.

### P1 — Heute sichtbare Mini-Fix-Kandidaten
1. **Footer-Landmark-Semantik**
   - `src/components/layout/Footer.tsx` nutzt aktuell Linkspalten ohne eigene `<nav aria-label="...">`-Landmarks.
   - Sehr wahrscheinlich ein kleiner, sicherer A11y-/Semantik-Fix mit geringem Konfliktrisiko.
2. **`pointercancel`-Resilienz im ForceGraph**
   - `src/features/map/components/ForceGraph.tsx` behandelt `pointerup`, aber nicht `pointercancel`.
   - Das ist ein direkter Anschluss an den letzten Tap-vs-drag-Fix und passt exakt zu Mobile-/Touch-Polish.

## Nächste Aufgaben
1. Ergebnisse der heute gestarteten asynchronen Claude-Code-Runs abwarten.
2. Danach je Run prüfen:
   - welche Dateien geändert wurden
   - ob Commit + kurze Verifikation vorhanden sind
   - ob `MORNING_AGENT_HANDOFF.md` sinnvoll ergänzt wurde
3. Nur kleine, konfliktarme Änderungen selektiv nach `main` übernehmen.
4. Weiter beobachten, ob künftig wieder eine Root-Datei `NEXT_STEPS_MASTERPLAN.md` eingeführt wird.

## Asynchron gestartete Aufgaben

### Agent A — Footer Landmark / Semantik Mini-Fix
- Modell: **Claude Opus 4.6**
- Ziel: Footer-Landmarks / semantische Navigation in `src/components/layout/Footer.tsx` fixen.

### Agent B — Map Pointercancel / Resilience Mini-Fix
- Modell: **Claude Sonnet 3.7**
- Ziel: `pointercancel`-Handling in `src/features/map/components/ForceGraph.tsx` ergänzen.

## Lösch-/Commit-Prüfung
- `NEXT_STEPS_MASTERPLAN.md`: **nicht vorhanden** → kein `git rm`
- `AUTO_REVIEW_PLAN.md`: **nicht 100% fertig**, aktive Arbeitsdatei → kein `git rm`
