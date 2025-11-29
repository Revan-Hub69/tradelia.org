# 🗑️ Chiusura Worktree

## Script Creato

Ho creato `close-all-worktrees.bat` che chiude automaticamente tutti i worktree tranne `pjt`.

## Cosa Fa lo Script

1. Mostra la lista dei worktree attuali
2. Chiede conferma (premi un tasto per continuare)
3. Chiude in sequenza:
   - `fkf5l`
   - `Ijucn`
   - `jb9c3`
   - `soAkG`
   - `uDy32`
4. Mantiene solo `pjt` (worktree principale)

## Come Usare

1. **Esegui** `close-all-worktrees.bat` dalla directory del progetto
2. **Conferma** quando richiesto
3. **Verifica** che rimanga solo `pjt`

## Nota

Se un worktree ha modifiche non committate, Git potrebbe rifiutare di chiuderlo. In quel caso:
- Committa o scarta le modifiche prima
- Oppure usa `git worktree remove --force` (ma perdi le modifiche!)

## Dopo la Chiusura

Dopo aver chiuso i worktree, puoi:
- Pushare normalmente su GitHub
- Lavorare solo su `pjt` senza conflitti
- Evitare problemi di build su Render

---

**Worktree da mantenere**: `pjt`  
**Worktree da chiudere**: `fkf5l`, `Ijucn`, `jb9c3`, `soAkG`, `uDy32`

