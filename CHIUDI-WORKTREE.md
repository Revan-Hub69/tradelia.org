# Chiudi Worktree - Comandi da Eseguire

## Comandi Git da Eseguire in Cursor

Copia e incolla questi comandi nel terminale integrato di Cursor (o usa l'interfaccia Git se supporta worktree):

```bash
cd "C:\Users\Utente\.cursor\worktrees\tradelia.org-main\pjt"

git worktree remove ../fkf5l
git worktree remove ../Ijucn
git worktree remove ../jb9c3
git worktree remove ../soAkG
git worktree remove ../uDy32
```

## Verifica

Dopo aver eseguito i comandi, verifica che rimanga solo `pjt`:

```bash
git worktree list
```

Dovresti vedere solo il worktree `pjt`.

## Se un Worktree Ha Modifiche

Se Git rifiuta di chiudere un worktree perché ha modifiche, usa `--force`:

```bash
git worktree remove --force ../nome-worktree
```

⚠️ **Attenzione**: `--force` elimina le modifiche non committate!

---

**Worktree da chiudere**: fkf5l, Ijucn, jb9c3, soAkG, uDy32  
**Worktree da mantenere**: pjt

