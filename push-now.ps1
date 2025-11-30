# Script per push automatico senza editor
cd C:\Users\Utente\.cursor\worktrees\tradelia.org-main\hyi

# Configura Git per non usare editor
$env:GIT_EDITOR = "true"
git config core.editor "true"
git config --global core.editor "true"

# Verifica stato
Write-Host "=== Stato Git ===" -ForegroundColor Cyan
git status

# Se c'è un rebase in corso, abortilo
if (Test-Path .git/rebase-merge) {
    Write-Host "Abortendo rebase in corso..." -ForegroundColor Yellow
    git rebase --abort
}

# Pull con merge (non rebase)
Write-Host "`n=== Pull da origin ===" -ForegroundColor Cyan
git pull origin Tradelia-Main --no-edit

# Push
Write-Host "`n=== Push a origin ===" -ForegroundColor Cyan
git push origin Tradelia-Main

Write-Host "`n=== Completato! ===" -ForegroundColor Green

