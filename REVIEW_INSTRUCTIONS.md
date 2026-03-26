# Auto-Review Agent Instructions

Du wirst jede halbe Stunde aufgerufen. Deine Aufgabe:
1. **Analysieren:** Prüfe den aktuellen Git-Status, offene TODOs in Plänen (z.B. NEXT_STEPS_MASTERPLAN.md) und den Code in `src/`.
2. **Planen:** Erstelle oder update eine `AUTO_REVIEW_PLAN.md` mit den nächsten isolierbaren, parallelisierbaren Aufgaben.
3. **Delegieren:** Ruf für die größten 1-2 anstehenden Tasks asynchron Claude Code auf. 
   - Befehl: `nohup npx @anthropic-ai/claude-code -p 'DEIN PROMPT HIER. Beende mit git commit' --dangerously-skip-permissions > /tmp/claude-$(date +%s).log 2>&1 &`
   - Nutze den Standard-Model von Claude Code, er reicht für die meisten Aufgaben.
4. **Aufräumen:** Wenn ein Plan (z.B. MASTERPLAN) 100% abgehakt ist, lösche ihn und committe die Löschung.
5. **Reporten:** Berichte kurz via Telegram an Julius (Chat-ID: 2081872701) was gefunden wurde und welche Agents gestartet wurden.
