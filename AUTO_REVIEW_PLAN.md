# AUTO_REVIEW_PLAN

Stand: 2026-04-22 07:02 UTC
Branch: `main`
Morning-Run: Cron `c3a8ff45-9145-4786-b60b-2885c5ef3b0c`

## Repo-Snapshot
- Arbeitsbranch: `main`
- Unstaged changes in `src/components/layout/Footer.tsx`, `src/features/map/components/ForceGraph.tsx` and `AUTO_REVIEW_PLAN.md`.

## Morning Findings
- `NEXT_STEPS_MASTERPLAN.md` existiert nicht (wurde bereits gelöst/gelöscht).
- `Footer.tsx` hat Änderungen für aria-labels und Semantik, die reviewt und gestaged werden müssen.
- `ForceGraph.tsx` hat Pointer Events Updates (pointercancel), die reviewt und gestaged werden müssen.

## Laufende Aufgaben (Asynchron via Claude Code gestartet)
1. **Footer-Landmark-Semantik**: Review, Fix und Commit der Änderungen an `src/components/layout/Footer.tsx`. Fokus auf Barrierefreiheit (aria-label/nav). (Job: Opus)
2. **`pointercancel`-Resilienz im ForceGraph**: Review, Fix und Commit der Änderungen an `src/features/map/components/ForceGraph.tsx`. Behandeln von Edge Cases wie pointercancel. (Job: Sonnet)

## Lösch-/Commit-Prüfung
- `NEXT_STEPS_MASTERPLAN.md`: nicht vorhanden.
- `AUTO_REVIEW_PLAN.md`: aktiv, wartet auf Abschluss der Agenten.
