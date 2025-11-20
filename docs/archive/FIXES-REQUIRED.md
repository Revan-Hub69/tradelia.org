# Fixes Richiesti - User Area

## ✅ Completati
1. ✅ Rimossi bio e desk links (profilo pubblico)
2. ✅ Aggiunte preferenze interne (notifiche email, dashboard alerts)
3. ✅ Desk ha accesso a community proposals
4. ✅ Aggiunto campo valid_until per scadenza piano
5. ✅ Verifica scadenza piano in fetchUserRole

## 🔄 In Corso
1. ⚠️ Rivedere completamente analisi on demand
   - Problema: Un solo input/pulsante gestisce due funzionalità diverse
   - Institutional → analysis_requests (richieste on-demand, scalano crediti)
   - Trial/Pro → asset_proposals (proposte community, non scalano crediti)
   - Soluzione: Separare meglio le due funzionalità o chiarire meglio cosa fa ogni pulsante

## 📋 Da Fare
1. ❌ Dashboard admin per gestione utenti collegata a Supabase
   - Visualizzare tutti gli utenti
   - Modificare ruoli
   - Impostare scadenze piani
   - Gestire crediti
   - Visualizzare statistiche

2. ❌ Rimuovere tutte le funzioni desk links dal codice
   - fetchDeskLinks()
   - renderDeskLinksSection()
   - handleAddDeskLink()
   - handleRemoveDeskLink()
   - saveDeskLinks()

3. ❌ Migliorare logica analisi on demand
   - Chiarire cosa fa ogni pulsante
   - Separare meglio le due funzionalità
   - Mostrare messaggi più chiari

4. ❌ Aggiungere CSS per preferenze profilo
   - Stili per .profile-preferences
   - Stili per .preference-checkbox

