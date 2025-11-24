# Debug Sistema Modali di Registrazione

## Attivazione Debug

Il sistema di debug può essere attivato in due modi:

### 1. Via URL Parameter
Aggiungi `?debug=auth` all'URL:
```
https://tradelia.org/dashboard.html?debug=auth
```

### 2. Via LocalStorage
Apri la console del browser e esegui:
```javascript
localStorage.setItem("auth-debug", "true");
```
Poi ricarica la pagina.

## Utilizzo

### Console Commands

Una volta attivato il debug, puoi usare questi comandi nella console:

```javascript
// Visualizza tutti i log
window.authModalDebug.getLogs()

// Pulisci i log
window.authModalDebug.clearLogs()

// Abilita/disabilita debug
window.authModalDebug.enabled = true  // o false
```

### Cosa viene loggato

Il sistema di debug registra:

1. **Apertura/Chiusura modale**
   - Quando il modale viene aperto
   - Quale tab è attivo (login/signup)
   - Se il modale è già aperto

2. **Setup Event Listeners**
   - Elementi DOM trovati/mancanti
   - Event listeners configurati

3. **Validazione Form**
   - Campi validati
   - Errori di validazione
   - Motivo del fallimento

4. **Submit Form**
   - Dati raccolti (senza password in chiaro)
   - Richiesta API inviata
   - Risposta API ricevuta
   - Errori durante il processo

5. **Errori**
   - Stack trace completi
   - Dettagli errori API
   - Problemi di stato

## Problemi Comuni e Debug

### Modale non si apre

**Check:**
```javascript
// Verifica se il modale esiste
document.getElementById("auth-modal")

// Verifica se initAuthModal è stato chiamato
// Controlla i log per "Modal not found, creating..."
```

### Form non si invia

**Check:**
```javascript
// Verifica se signupInProgress è true
// Nei log cerca "Signup already in progress"

// Verifica elementi DOM
document.getElementById("signup-email")
document.getElementById("signup-password")
document.getElementById("signup-password-confirm")
document.getElementById("signup-privacy")
```

### Errori API

**Check:**
```javascript
// Nei log cerca "API error:" per vedere:
// - Status code
// - Error message
// - Response data
```

### Doppio Submit

Il sistema previene automaticamente doppi submit con il flag `signupInProgress`. Se vedi "Signup already in progress" nei log, significa che il sistema sta funzionando correttamente.

## Log Structure

Ogni log entry contiene:
```javascript
{
  timestamp: "2025-11-24T10:30:00.000Z",
  level: "info|warn|error",
  component: "[AuthModal:handleSignupSubmit]",
  message: "Signup form submitted",
  data: { /* dati aggiuntivi */ }
}
```

## Best Practices

1. **Attiva debug solo quando necessario** - I log occupano memoria
2. **Pulisci i log regolarmente** - Usa `clearLogs()` per evitare accumulo
3. **Cerca pattern nei log** - Errori ripetuti indicano problemi sistemici
4. **Verifica timestamp** - Per capire sequenza di eventi

## Troubleshooting

### Debug non si attiva
- Verifica che `localStorage.getItem("auth-debug") === "true"` o URL contiene `debug=auth`
- Controlla console per errori JavaScript

### Log non appaiono
- Verifica che il debug sia attivo: `window.authModalDebug.enabled`
- Controlla che non ci siano errori che bloccano l'esecuzione

### Troppi log
- Usa `clearLogs()` periodicamente
- Filtra i log per livello: `window.authModalDebug.getLogs().filter(l => l.level === 'error')`
