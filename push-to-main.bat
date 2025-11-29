@echo off
cd /d "C:\Users\Utente\.cursor\worktrees\tradelia.org-main\pjt"
git checkout Tradelia-Main
git merge notifications-system
git push origin Tradelia-Main
pause

