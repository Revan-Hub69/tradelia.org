# Script PowerShell per push automatico a GitHub
# Uso: .\scripts\push-to-github.ps1 "messaggio commit"

param(
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

Write-Host "🚀 Push automatico a GitHub" -ForegroundColor Green
Write-Host ""

# Verifica se Git è installato
try {
    $gitVersion = git --version
    Write-Host "✅ Git trovato: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git non trovato! Installa Git da: https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

# Verifica se siamo in un repository Git
if (-not (Test-Path .git)) {
    Write-Host "⚠️  Repository Git non inizializzato" -ForegroundColor Yellow
    Write-Host "Vuoi inizializzare il repository? (S/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq "S" -or $response -eq "s") {
        git init
        Write-Host "✅ Repository inizializzato" -ForegroundColor Green
        Write-Host "⚠️  Ricorda di configurare il remote:" -ForegroundColor Yellow
        Write-Host "   git remote add origin https://github.com/TUO-USERNAME/TUO-REPO.git" -ForegroundColor Cyan
    } else {
        exit 1
    }
}

# Verifica se ci sono modifiche
$status = git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "ℹ️  Nessuna modifica da committare" -ForegroundColor Yellow
    exit 0
}

# Mostra le modifiche
Write-Host "📝 Modifiche rilevate:" -ForegroundColor Cyan
git status --short
Write-Host ""

# Aggiungi tutti i file (rispetta .gitignore)
Write-Host "➕ Aggiungo file..." -ForegroundColor Cyan
git add .

# Commit
Write-Host "💾 Creo commit: '$CommitMessage'" -ForegroundColor Cyan
git commit -m $CommitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Errore durante il commit" -ForegroundColor Red
    exit 1
}

# Verifica remote
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "⚠️  Remote 'origin' non configurato" -ForegroundColor Yellow
    Write-Host "Configura il remote con:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/TUO-USERNAME/TUO-REPO.git" -ForegroundColor Cyan
    exit 1
}

Write-Host "🌐 Remote configurato: $remote" -ForegroundColor Green

# Determina branch (default: main o master)
$branch = git branch --show-current
if ([string]::IsNullOrWhiteSpace($branch)) {
    $branch = "main"
    git checkout -b main 2>$null
}

Write-Host "📤 Push su branch: $branch" -ForegroundColor Cyan
git push origin $branch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Push completato con successo!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Errore durante il push" -ForegroundColor Red
    Write-Host "Verifica:" -ForegroundColor Yellow
    Write-Host "  1. Credenziali GitHub configurate" -ForegroundColor Yellow
    Write-Host "  2. Permessi sul repository" -ForegroundColor Yellow
    Write-Host "  3. Branch corretto" -ForegroundColor Yellow
    exit 1
}

