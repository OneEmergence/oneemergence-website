# AUTO_REVIEW_PLAN

Stand: 2026-04-22 04:00 UTC
Branch: `main`
Repo-Status: 41 commits ahead of origin/main. Unstaged changes in `src/components/layout/Footer.tsx`, `src/features/map/components/ForceGraph.tsx` and `AUTO_REVIEW_PLAN.md`.
Morning-Run: Cron `c3a8ff45-9145-4786-b60b-2885c5ef3b0c`

## Repo-Snapshot
- Arbeitsbranch: `main`
- Ahead/behind gegen `origin/main`: 41 ahead
- Unstaged changes in Footer.tsx, ForceGraph.tsx, and AUTO_REVIEW_PLAN.md

## Morning Findings
- `NEXT_STEPS_MASTERPLAN.md` existiert nicht.
- `AUTO_REVIEW_PLAN.md` aktiv aktualisiert.

## Laufende Aufgaben (Asynchron via Claude Code gestartet)
1. **Footer-Landmark-Semantik**: Weiterhin Review und Fix der ungespeicherten Änderungen an `src/components/layout/Footer.tsx`. Sicherstellen, dass `<nav aria-label="...">`-Landmarks korrekt implementiert sind. (Job: Opus)
2. **`pointercancel`-Resilienz im ForceGraph**: Weiterhin Review und Fix der ungespeicherten Änderungen an `src/features/map/components/ForceGraph.tsx`. Behandeln von `pointercancel`. (Job: Sonnet)

## Lösch-/Commit-Prüfung
- `NEXT_STEPS_MASTERPLAN.md`: nicht vorhanden → kein `git rm`
- `AUTO_REVIEW_PLAN.md`: aktiv aktualisiert, nicht 100% "fertig" → kein `git rm`
