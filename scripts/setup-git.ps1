# Script di Setup Git Completo
# Questo script configura Git e inizializza il repository

Write-Host "🚀 Setup Git per Push Automatici a GitHub" -ForegroundColor Green
Write-Host ""

# Verifica se Git è installato
Write-Host "📋 Step 1: Verifica installazione Git..." -ForegroundColor Cyan
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git trovato: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git non trovato!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Installa Git da: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "   Oppure usa: winget install Git.Git" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Dopo l'installazione:" -ForegroundColor Yellow
    Write-Host "  1. Riavvia PowerShell" -ForegroundColor Yellow
    Write-Host "  2. Esegui di nuovo: .\scripts\setup-git.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Verifica configurazione Git
Write-Host "📋 Step 2: Verifica configurazione Git..." -ForegroundColor Cyan
$userName = git config --global user.name 2>$null
$userEmail = git config --global user.email 2>$null

if ([string]::IsNullOrWhiteSpace($userName)) {
    Write-Host "⚠️  Nome utente non configurato" -ForegroundColor Yellow
    $newName = Read-Host "Inserisci il tuo nome (per i commit)"
    if (-not [string]::IsNullOrWhiteSpace($newName)) {
        git config --global user.name $newName
        Write-Host "✅ Nome configurato: $newName" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Nome configurato: $userName" -ForegroundColor Green
}

if ([string]::IsNullOrWhiteSpace($userEmail)) {
    Write-Host "⚠️  Email non configurata" -ForegroundColor Yellow
    $newEmail = Read-Host "Inserisci la tua email (per i commit)"
    if (-not [string]::IsNullOrWhiteSpace($newEmail)) {
        git config --global user.email $newEmail
        Write-Host "✅ Email configurata: $newEmail" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Email configurata: $userEmail" -ForegroundColor Green
}

Write-Host ""

# Verifica se repository Git esiste
Write-Host "📋 Step 3: Verifica repository Git..." -ForegroundColor Cyan
if (-not (Test-Path .git)) {
    Write-Host "⚠️  Repository Git non inizializzato" -ForegroundColor Yellow
    $init = Read-Host "Vuoi inizializzare il repository Git? (S/N)"
    if ($init -eq "S" -or $init -eq "s") {
        git init
        Write-Host "✅ Repository Git inizializzato" -ForegroundColor Green
        
        # Aggiungi file iniziali
        Write-Host "➕ Aggiungo file iniziali..." -ForegroundColor Cyan
        git add .
        
        # Crea commit iniziale
        $initialCommit = Read-Host "Messaggio per il commit iniziale (premi Invio per usare default)"
        if ([string]::IsNullOrWhiteSpace($initialCommit)) {
            $initialCommit = "Initial commit"
        }
        git commit -m $initialCommit
        Write-Host "✅ Commit iniziale creato" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Repository Git già inizializzato" -ForegroundColor Green
}

Write-Host ""

# Verifica remote GitHub
Write-Host "📋 Step 4: Verifica remote GitHub..." -ForegroundColor Cyan
$remote = git remote get-url origin 2>$null

if ([string]::IsNullOrWhiteSpace($remote)) {
    Write-Host "⚠️  Remote GitHub non configurato" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Esempi di URL GitHub:" -ForegroundColor Cyan
    Write-Host "  HTTPS: https://github.com/username/repository.git" -ForegroundColor Gray
    Write-Host "  SSH:   git@github.com:username/repository.git" -ForegroundColor Gray
    Write-Host ""
    $prompt = 'Inserisci l''URL del tuo repository GitHub (o premi Invio per saltare)'
    $remoteUrl = Read-Host $prompt
    
    if (-not [string]::IsNullOrWhiteSpace($remoteUrl)) {
        git remote add origin $remoteUrl
        Write-Host "✅ Remote configurato: $remoteUrl" -ForegroundColor Green
        
        # Chiedi se fare push iniziale
        Write-Host ""
        $pushNow = Read-Host "Vuoi fare il push iniziale ora? (S/N)"
        if ($pushNow -eq "S" -or $pushNow -eq "s") {
            $branch = git branch --show-current
            if ([string]::IsNullOrWhiteSpace($branch)) {
                $branch = "main"
                git checkout -b main 2>$null
            }
            
            Write-Host "📤 Push su branch: $branch" -ForegroundColor Cyan
            git push -u origin $branch
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Push iniziale completato!" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Push fallito. Verifica:" -ForegroundColor Yellow
                Write-Host "  1. Credenziali GitHub configurate" -ForegroundColor Yellow
                Write-Host "  2. Permessi sul repository" -ForegroundColor Yellow
                Write-Host "  3. Branch corretto" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "ℹ️  Remote non configurato. Puoi configurarlo dopo con:" -ForegroundColor Yellow
        Write-Host "   git remote add origin https://github.com/USERNAME/REPO.git" -ForegroundColor Cyan
    }
} else {
    Write-Host "✅ Remote configurato: $remote" -ForegroundColor Green
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Setup Git completato!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prossimi passi:" -ForegroundColor Cyan
Write-Host "  1. Per push automatici: npm run push" -ForegroundColor White
$msgCmd = '  2. Per push con messaggio: npm run push:msg "Mio messaggio"'
Write-Host $msgCmd -ForegroundColor White
Write-Host ""
Write-Host "📚 Leggi GIT-SETUP-GUIDE.md per maggiori dettagli" -ForegroundColor Cyan
Write-Host ""
