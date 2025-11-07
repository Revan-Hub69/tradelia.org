#!/bin/bash
# Script Bash per push automatico a GitHub
# Uso: ./scripts/push-to-github.sh "messaggio commit"

COMMIT_MESSAGE="${1:-Update: $(date '+%Y-%m-%d %H:%M:%S')}"

echo "🚀 Push automatico a GitHub"
echo ""

# Verifica se Git è installato
if ! command -v git &> /dev/null; then
    echo "❌ Git non trovato! Installa Git"
    exit 1
fi

echo "✅ Git trovato: $(git --version)"
echo ""

# Verifica se siamo in un repository Git
if [ ! -d .git ]; then
    echo "⚠️  Repository Git non inizializzato"
    read -p "Vuoi inizializzare il repository? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        git init
        echo "✅ Repository inizializzato"
        echo "⚠️  Ricorda di configurare il remote:"
        echo "   git remote add origin https://github.com/TUO-USERNAME/TUO-REPO.git"
    else
        exit 1
    fi
fi

# Verifica se ci sono modifiche
if [ -z "$(git status --porcelain)" ]; then
    echo "ℹ️  Nessuna modifica da committare"
    exit 0
fi

# Mostra le modifiche
echo "📝 Modifiche rilevate:"
git status --short
echo ""

# Aggiungi tutti i file (rispetta .gitignore)
echo "➕ Aggiungo file..."
git add .

# Commit
echo "💾 Creo commit: '$COMMIT_MESSAGE'"
git commit -m "$COMMIT_MESSAGE"

if [ $? -ne 0 ]; then
    echo "❌ Errore durante il commit"
    exit 1
fi

# Verifica remote
REMOTE=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE" ]; then
    echo "⚠️  Remote 'origin' non configurato"
    echo "Configura il remote con:"
    echo "   git remote add origin https://github.com/TUO-USERNAME/TUO-REPO.git"
    exit 1
fi

echo "🌐 Remote configurato: $REMOTE"

# Determina branch (default: main o master)
BRANCH=$(git branch --show-current)
if [ -z "$BRANCH" ]; then
    BRANCH="main"
    git checkout -b main 2>/dev/null
fi

echo "📤 Push su branch: $BRANCH"
git push origin "$BRANCH"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Push completato con successo!"
else
    echo ""
    echo "❌ Errore durante il push"
    echo "Verifica:"
    echo "  1. Credenziali GitHub configurate"
    echo "  2. Permessi sul repository"
    echo "  3. Branch corretto"
    exit 1
fi

