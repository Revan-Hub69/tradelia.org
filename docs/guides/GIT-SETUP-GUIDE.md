# 🚀 Guida Setup Git per Push Automatici a GitHub

## 📋 Problema

Da **mobile** i push vanno direttamente a GitHub, ma da **desktop** no perché:
- Git non è installato o non è nel PATH
- Il repository Git non è inizializzato
- Il remote GitHub non è configurato

## ✅ Soluzione: Setup Completo

### **Step 1: Installa Git**

#### Windows:
1. Scarica Git da: https://git-scm.com/download/win
2. Installa con le opzioni predefinite
3. Riavvia il terminale/PowerShell

#### Verifica installazione:
```powershell
git --version
```

---

### **Step 2: Configura Git (prima volta)**

```powershell
# Configura nome e email
git config --global user.name "Tuo Nome"
git config --global user.email "tua-email@example.com"

# Configura editor (opzionale)
git config --global core.editor "code --wait"  # VS Code
```

---

### **Step 3: Inizializza Repository Git**

Se il repository non è ancora inizializzato:

```powershell
# Inizializza Git
git init

# Aggiungi tutti i file (rispetta .gitignore)
git add .

# Crea primo commit
git commit -m "Initial commit"
```

---

### **Step 4: Configura Remote GitHub**

#### Opzione A: HTTPS (più semplice)
```powershell
# Sostituisci con il tuo repository GitHub
git remote add origin https://github.com/TUO-USERNAME/TUO-REPO.git

# Verifica
git remote -v
```

#### Opzione B: SSH (più sicuro, richiede setup chiavi)
```powershell
git remote add origin git@github.com:TUO-USERNAME/TUO-REPO.git
```

**Per SSH:**
1. Genera chiave SSH: `ssh-keygen -t ed25519 -C "tua-email@example.com"`
2. Aggiungi chiave pubblica a GitHub: Settings → SSH and GPG keys

---

### **Step 5: Push Iniziale**

```powershell
# Determina branch (di solito 'main' o 'master')
git branch -M main

# Push iniziale
git push -u origin main
```

---

## 🎯 Push Automatici (come da mobile)

### **Metodo 1: Script PowerShell (Windows)**

```powershell
# Push automatico con messaggio predefinito
npm run push

# Push automatico con messaggio personalizzato
npm run push:msg "Mio messaggio commit"
```

Oppure direttamente:
```powershell
.\scripts\push-to-github.ps1 "Mio messaggio commit"
```

### **Metodo 2: Script Bash (Linux/Mac/Git Bash)**

```bash
# Rendi eseguibile
chmod +x scripts/push-to-github.sh

# Esegui
./scripts/push-to-github.sh "Mio messaggio commit"
```

### **Metodo 3: Comandi Git Manuali**

```powershell
# Aggiungi modifiche
git add .

# Commit
git commit -m "Mio messaggio"

# Push
git push origin main
```

---

## 🔧 Troubleshooting

### **Errore: "Git non trovato"**
- Installa Git: https://git-scm.com/download/win
- Riavvia il terminale
- Verifica PATH: `where.exe git`

### **Errore: "Repository non inizializzato"**
```powershell
git init
git add .
git commit -m "Initial commit"
```

### **Errore: "Remote non configurato"**
```powershell
git remote add origin https://github.com/TUO-USERNAME/TUO-REPO.git
git remote -v  # Verifica
```

### **Errore: "Autenticazione fallita"**

#### Per HTTPS:
1. GitHub non accetta più password, usa **Personal Access Token**
2. Crea token: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
3. Usa token come password quando richiesto

#### Per SSH:
```powershell
# Test connessione
ssh -T git@github.com

# Se fallisce, aggiungi chiave SSH a GitHub
```

### **Errore: "Branch non trovato"**
```powershell
# Crea branch main
git checkout -b main

# Oppure usa master
git checkout -b master
git push origin master
```

---

## 📝 Workflow Consigliato

1. **Fai modifiche** ai file
2. **Esegui push automatico:**
   ```powershell
   npm run push "Descrizione modifiche"
   ```
3. **Lo script fa automaticamente:**
   - ✅ Verifica modifiche
   - ✅ Aggiunge file (rispetta .gitignore)
   - ✅ Crea commit
   - ✅ Push a GitHub

---

## 🎨 Personalizzazione

### **Modifica script per push automatico dopo commit**

Puoi creare un hook Git per push automatico:

```powershell
# Crea hook post-commit
New-Item -Path .git\hooks\post-commit -ItemType File -Force

# Aggiungi contenuto (Windows)
@"
#!/bin/sh
git push origin main
"@ | Out-File -FilePath .git\hooks\post-commit -Encoding utf8
```

**⚠️ Attenzione:** Push automatici possono essere pericolosi. Usa con cautela!

---

## ✅ Checklist Setup

- [ ] Git installato e nel PATH
- [ ] Git configurato (nome, email)
- [ ] Repository Git inizializzato
- [ ] Remote GitHub configurato
- [ ] Push iniziale completato
- [ ] Script di push testato

---

## 🆘 Supporto

Se hai problemi:
1. Verifica che Git sia installato: `git --version`
2. Verifica remote: `git remote -v`
3. Verifica branch: `git branch`
4. Controlla log: `git log --oneline`

---

**Ora puoi fare push automatici a GitHub come da mobile! 🚀**

