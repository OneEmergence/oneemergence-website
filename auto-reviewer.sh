#!/bin/bash
# Auto-Review Script für Cronjob
cd /home/opclaw/.openclaw/workspace/oneemergence-website

# Löst einen Agent-Turn aus, der das Repo reviewt und Claude Code spawnt.
openclaw agent --message "Führe den Auto-Review-Prozess im oneemergence-website Repo aus. Lies REVIEW_INSTRUCTIONS.md. Analysiere das Repo (inklusive Pläne wie NEXT_STEPS_MASTERPLAN.md), schreibe ein AUTO_REVIEW_PLAN.md. Spawne dann parallel 1-2 Claude Code Instanzen für kleine machbare Aufgaben. Falls eine Datei 100% fertig ist, lösche sie. Melde dich danach super kurz per Telegram bei Julius (2081872701) mit dem Status."
