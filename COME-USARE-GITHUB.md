# ðŸŽ¯ Come Usare GitHub - Guida Semplice

## Cosa significa "collegato con GitHub"?

Significa che il tuo progetto locale (sul tuo computer) Ã¨ collegato al repository GitHub online. Puoi:
- **Caricare** le tue modifiche su GitHub (push)
- **Scaricare** le modifiche da GitHub (pull)

---

## ðŸš€ Come Caricare le Modifiche su GitHub

### Metodo 1: Comando Semplice (CONSIGLIATO)

Apri PowerShell nella cartella del progetto e scrivi:

```powershell
npm run push
```

Questo comando:
1. âœ… Trova tutte le modifiche che hai fatto
2. âœ… Le aggiunge a Git
3. âœ… Crea un "salvataggio" (commit) con data e ora
4. âœ… Le carica su GitHub

**Fatto!** Le tue modifiche sono su GitHub.

---

### Metodo 2: Con Messaggio Personalizzato

Se vuoi scrivere un messaggio personalizzato per il salvataggio:

```powershell
npm run push:msg "Ho aggiunto la nuova funzione di login"
```

---

## ðŸ“ Esempio Pratico

Immagina che hai modificato il file `index.html`:

1. **Apri PowerShell** nella cartella del progetto
2. **Scrivi**: `npm run push`
3. **Premi Invio**
4. **Aspetta** qualche secondo
5. **Fatto!** Il file modificato Ã¨ su GitHub

Puoi verificare andando su: https://github.com/Revan-Hub69/tradelia.org

---

## â“ Domande Frequenti

### "Cosa succede se non ho modifiche?"
Lo script ti dirÃ  "Nessuna modifica da committare" e non farÃ  nulla. Tutto ok!

### "Cosa succede se ho errori?"
Lo script ti dirÃ  cosa non va. Di solito Ã¨ perchÃ©:
- Non hai modificato nulla
- C'Ã¨ un problema di connessione
- Le credenziali GitHub non sono configurate

### "Devo fare qualcosa prima di usare `npm run push`?"
No! Basta che tu sia nella cartella del progetto e che Git sia installato (giÃ  fatto).

---

## ðŸ” Verificare che Funzioni

Per verificare che tutto sia collegato correttamente:

```powershell
# Vedi lo stato del repository
git status

# Vedi il collegamento GitHub
git remote -v
```

Dovresti vedere:
```
origin  https://github.com/Revan-Hub69/tradelia.org.git
```

---

## âœ… Riassunto

**Per caricare modifiche su GitHub:**
```powershell
npm run push
```

**Fine!** Ãˆ tutto quello che ti serve sapere. ðŸŽ‰
