# 🔍 Informazioni Worktree

## Worktree Trovati

Vedo che ci sono **6 worktree** nella directory `.cursor/worktrees/tradelia.org-main/`:

1. **fkf5l** - Sembra contenere file di deploy (netlify.toml, render.yaml)
2. **Ijucn** - Contiene solo vercel.json
3. **jb9c3** - Worktree completo con vecchio progetto (report/, supabase/, etc.)
4. **pjt** - **Worktree attivo** (quello che stiamo usando ora)
5. **soAkG** - Vuoto o minimo
6. **uDy32** - Contiene vecchi file (api/, assets/, docs/)

## Possibili Problemi

Se più worktree puntano allo stesso branch o hanno modifiche non committate, possono causare:
- ❌ Conflitti durante push
- ❌ Build che falliscono
- ❌ Stato Git confuso

## Soluzione

### 1. Verifica Stato
Esegui `check-worktrees.bat` per vedere lo stato di tutti i worktree.

### 2. Chiudi Worktree Non Necessari
```bash
cd "C:\Users\Utente\.cursor\worktrees\tradelia.org-main\pjt"
git worktree remove ../jb9c3  # Se non serve più
git worktree remove ../uDy32  # Se non serve più
git worktree remove ../soAkG  # Se vuoto
```

### 3. Verifica Branch
Assicurati che ogni worktree sia su un branch diverso:
```bash
git worktree list
```

### 4. Se Serve, Ricrea Worktree Pulito
```bash
# Rimuovi tutti i worktree non necessari
# Poi lavora solo su pjt
```

## Worktree Attuale

Stiamo lavorando su: **pjt**
- Path: `C:\Users\Utente\.cursor\worktrees\tradelia.org-main\pjt`
- Branch: `notifications-system` (da verificare)

## Raccomandazione

Per evitare conflitti, mantieni solo il worktree **pjt** attivo e chiudi gli altri se non servono più.

