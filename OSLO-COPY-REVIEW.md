# Oslo - Review Completo Copy

## 📋 Indice Copy per Sezione

### 1. Common (Azioni Base)
### 2. Events (Gestione Eventi)
### 3. Notifications (Sistema Notifiche)
### 4. Alliance (Gestione Alleanza)
### 5. Dashboard (Dashboard Membri)
### 6. Gaming (Terminologia Gaming)

---

## 1. COMMON - Azioni Base

### IT
```json
{
  "save": "Salva",
  "cancel": "Annulla",
  "delete": "Elimina",
  "edit": "Modifica",
  "create": "Crea",
  "loading": "Caricamento...",
  "error": "Errore",
  "success": "Successo",
  "confirm": "Conferma",
  "close": "Chiudi"
}
```

### EN
```json
{
  "save": "Save",
  "cancel": "Cancel",
  "delete": "Delete",
  "edit": "Edit",
  "create": "Create",
  "loading": "Loading...",
  "error": "Error",
  "success": "Success",
  "confirm": "Confirm",
  "close": "Close"
}
```

**Note:**
- ✅ Copy breve e diretto
- ❓ "Successo" → "Completato" più gaming?
- ❓ "Caricamento" → "Caricamento..." con ellipsis ok?

---

## 2. EVENTS - Gestione Eventi

### IT
```json
{
  "title": "Eventi",
  "create": "Nuovo Evento",
  "edit": "Modifica Evento",
  "delete": "Elimina Evento",
  "name": "Nome Evento",
  "description": "Descrizione",
  "type": "Tipo Evento",
  "startTime": "Data e Ora Inizio",
  "endTime": "Data e Ora Fine",
  "recurring": "Evento Ricorrente",
  "recurrencePattern": "Pattern Ricorrenza",
  "recurrenceEnd": "Data Fine Ricorrenza",
  "types": {
    "raid": "Raid",
    "war": "Guerra",
    "donation": "Donazione",
    "meeting": "Riunione",
    "general": "Generale",
    "other": "Altro"
  },
  "patterns": {
    "daily": "Giornaliero",
    "weekly": "Settimanale",
    "monthly": "Mensile"
  },
  "noEvents": "Nessun evento programmato",
  "scheduled": "Eventi Programmati",
  "today": "Oggi",
  "upcoming": "Prossimi",
  "past": "Passati"
}
```

### EN
```json
{
  "title": "Events",
  "create": "New Event",
  "edit": "Edit Event",
  "delete": "Delete Event",
  "name": "Event Name",
  "description": "Description",
  "type": "Event Type",
  "startTime": "Start Date & Time",
  "endTime": "End Date & Time",
  "recurring": "Recurring Event",
  "recurrencePattern": "Recurrence Pattern",
  "recurrenceEnd": "Recurrence End Date",
  "types": {
    "raid": "Raid",
    "war": "War",
    "donation": "Donation",
    "meeting": "Meeting",
    "general": "General",
    "other": "Other"
  },
  "patterns": {
    "daily": "Daily",
    "weekly": "Weekly",
    "monthly": "Monthly"
  },
  "noEvents": "No scheduled events",
  "scheduled": "Scheduled Events",
  "today": "Today",
  "upcoming": "Upcoming",
  "past": "Past"
}
```

**Note:**
- ❓ "Pattern Ricorrenza" → "Frequenza Ricorrenza" più chiaro?
- ❓ "Eventi Programmati" → "Eventi in Programma"?
- ❓ Aggiungere placeholder per form? Es: "Es: Raid Serale alle 20:00"
- ❓ "Riunione" → "Meeting" o "Riunione Strategica"?

---

## 3. NOTIFICATIONS - Sistema Notifiche

### IT
```json
{
  "pushAll": "Push a Tutti",
  "sending": "Invio...",
  "title": "Titolo Notifica",
  "message": "Messaggio Notifica",
  "sent": "Notifica inviata a {count} membri!",
  "dailySummary": "Riepilogo Giornaliero",
  "preEvent": "Evento tra 40 minuti",
  "eventStarted": "Evento Iniziato",
  "eventEnded": "Evento Terminato"
}
```

### EN
```json
{
  "pushAll": "Push to All",
  "sending": "Sending...",
  "title": "Notification Title",
  "message": "Notification Message",
  "sent": "Notification sent to {count} members!",
  "dailySummary": "Daily Summary",
  "preEvent": "Event in 40 minutes",
  "eventStarted": "Event Started",
  "eventEnded": "Event Ended"
}
```

**Note:**
- ❓ "Push a Tutti" → "Notifica a Tutti" più chiaro?
- ❓ "Invio..." → "Invio in corso..." più esplicito?
- ❓ Aggiungere copy per notifiche push reali? Es:
  - "🎮 Raid Serale tra 40 minuti! Unisciti ora"
  - "📊 Riepilogo eventi di oggi: 3 eventi programmati"
- ❓ "Evento tra 40 minuti" → "Evento tra 40 min - [Nome Evento]"?

---

## 4. ALLIANCE - Gestione Alleanza

### IT
```json
{
  "title": "Alleanza",
  "members": "Membri",
  "events": "Eventi",
  "admin": "Amministrazione",
  "role": {
    "admin": "Amministratore",
    "officer": "Ufficiale",
    "member": "Membro"
  }
}
```

### EN
```json
{
  "title": "Alliance",
  "members": "Members",
  "events": "Events",
  "admin": "Administration",
  "role": {
    "admin": "Administrator",
    "officer": "Officer",
    "member": "Member"
  }
}
```

**Note:**
- ✅ Copy chiaro
- ❓ "Ufficiale" → "Officer" (termine gaming standard)?
- ❓ Aggiungere "Leader" come ruolo?

---

## 5. DASHBOARD - Dashboard Membri

### IT
```json
{
  "title": "Dashboard",
  "welcome": "Benvenuto",
  "todayEvents": "Eventi di Oggi",
  "upcomingEvents": "Prossimi Eventi",
  "myEvents": "I Miei Eventi"
}
```

### EN
```json
{
  "title": "Dashboard",
  "welcome": "Welcome",
  "todayEvents": "Today's Events",
  "upcomingEvents": "Upcoming Events",
  "myEvents": "My Events"
}
```

**Note:**
- ❓ "Benvenuto" → "Benvenuto, [Nome]" personalizzato?
- ❓ "I Miei Eventi" → "Eventi a cui Partecipo"?
- ❓ Aggiungere "Prossimo Evento" (singolare) per highlight?

---

## 6. GAMING - Terminologia Gaming

### IT
```json
{
  "raid": "Raid",
  "war": "Guerra",
  "battle": "Battaglia",
  "donation": "Donazione",
  "alliance": "Alleanza",
  "member": "Membro",
  "level": "Livello",
  "power": "Potenza",
  "contribution": "Contributo",
  "participation": "Partecipazione",
  "victory": "Vittoria",
  "defeat": "Sconfitta",
  "join": "Unisciti",
  "leave": "Lascia",
  "confirm": "Conferma Partecipazione",
  "decline": "Rifiuta"
}
```

### EN
```json
{
  "raid": "Raid",
  "war": "War",
  "battle": "Battle",
  "donation": "Donation",
  "alliance": "Alliance",
  "member": "Member",
  "level": "Level",
  "power": "Power",
  "contribution": "Contribution",
  "participation": "Participation",
  "victory": "Victory",
  "defeat": "Defeat",
  "join": "Join",
  "leave": "Leave",
  "confirm": "Confirm Participation",
  "decline": "Decline"
}
```

**Note:**
- ✅ Terminologia gaming standard
- ❓ "Sconfitta" → "Sconfitta" o "Sconfitta" più gaming?
- ❓ "Rifiuta" → "Rifiuta" o "Non Partecipo"?

---

## 📱 COPY PER NOTIFICHE PUSH (Da Definire)

### Riepilogo Giornaliero
**IT:**
```
"📊 Riepilogo Eventi di Oggi
• Raid Serale - 20:00
• Guerra Alleanza - 21:30
• Donazione - 22:00
Apri per dettagli"
```

**EN:**
```
"📊 Today's Events Summary
• Evening Raid - 8:00 PM
• Alliance War - 9:30 PM
• Donation - 10:00 PM
Tap for details"
```

### Pre-Evento (40 min prima)
**IT:**
```
"⚔️ Raid Serale tra 40 minuti!
Inizia alle 20:00
Unisciti ora"
```

**EN:**
```
"⚔️ Evening Raid in 40 minutes!
Starts at 8:00 PM
Join now"
```

### Push Immediato
**IT:**
```
"[Titolo personalizzato]
[Messaggio personalizzato]
Apri per dettagli"
```

**EN:**
```
"[Custom Title]
[Custom Message]
Tap for details"
```

---

## 🔔 MESSAGGI DI ERRORE/SUCCESSO

### Attualmente nel codice:
- `alert(t('oslo.common.error') + ': ' + data.error)` - Generico
- `alert(t('oslo.notifications.sent', { count: data.sent }))` - OK

### Da Aggiungere:
**IT:**
```json
{
  "errors": {
    "notMember": "Non sei membro di questa alleanza",
    "noPermission": "Non hai i permessi per questa azione",
    "eventNotFound": "Evento non trovato",
    "networkError": "Errore di connessione. Riprova.",
    "saveError": "Errore durante il salvataggio",
    "deleteError": "Errore durante l'eliminazione"
  },
  "success": {
    "eventCreated": "Evento creato con successo!",
    "eventUpdated": "Evento aggiornato!",
    "eventDeleted": "Evento eliminato!",
    "participationConfirmed": "Partecipazione confermata!",
    "participationDeclined": "Partecipazione rifiutata"
  }
}
```

---

## 💬 PLACEHOLDER E HINT TEXT

### Form Creazione Evento
**IT:**
- Nome: "Es: Raid Serale alle 20:00"
- Descrizione: "Dettagli sull'evento, obiettivi, strategia..."
- Tipo: (dropdown, no placeholder)

**EN:**
- Name: "E.g.: Evening Raid at 8:00 PM"
- Description: "Event details, objectives, strategy..."
- Type: (dropdown)

---

## ❓ DOMANDE PER REVIEW

1. **Tone of Voice:**
   - Più formale o più gaming/casual?
   - Usare emoji nelle notifiche? (🎮 ⚔️ 🛡️)

2. **Terminologia:**
   - "Pattern Ricorrenza" → "Frequenza"?
   - "Ufficiale" → "Officer" (termine inglese)?
   - "Sconfitta" → altro termine?

3. **Messaggi:**
   - Aggiungere più contesto ai messaggi di errore?
   - Personalizzare "Benvenuto" con nome utente?
   - Aggiungere copy per stati vuoti (empty states)?

4. **Notifiche:**
   - Template predefiniti per notifiche push?
   - Aggiungere emoji nelle notifiche?
   - Lunghezza massima messaggi?

5. **Placeholder:**
   - Più esempi concreti nei placeholder?
   - Hint text più dettagliati?

---

## 📝 COPY MANCANTI (Da Aggiungere)

1. **Empty States:**
   - "Nessun evento programmato"
   - "Nessun membro nell'alleanza"
   - "Nessuna notifica"

2. **Conferme:**
   - "Sei sicuro di voler eliminare questo evento?"
   - "Conferma partecipazione a [Nome Evento]?"

3. **Validazione:**
   - "Nome evento richiesto"
   - "Data di inizio deve essere futura"
   - "Data di fine deve essere dopo la data di inizio"

4. **Loading States:**
   - "Caricamento eventi..."
   - "Invio notifica..."
   - "Salvataggio in corso..."

5. **Statistiche:**
   - "X membri confermati"
   - "X eventi questa settimana"
   - "Partecipazione: X%"

---

## 🎯 PROSSIMI STEP

1. ✅ Review copy attuale
2. ⏳ Definire tone of voice
3. ⏳ Aggiungere copy mancanti
4. ⏳ Creare template notifiche
5. ⏳ Testare in tutte le lingue

---

**Fammi sapere cosa vuoi modificare o migliorare!** 🚀

