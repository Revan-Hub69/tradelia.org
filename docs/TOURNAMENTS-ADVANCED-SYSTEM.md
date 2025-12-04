# Tournaments Advanced System - Complete Documentation

## Overview
Sistema avanzato di tornei con entry fee in XP, premi Pro/Desk, template predefiniti e gestione admin completa.

## Key Features

### 1. Entry Fee System (XP Payment)
- **Entry Fee**: Tornei possono richiedere XP per partecipare
- **XP Sources**: Paper trading, lezioni, achievements
- **Payment**: Automatico al momento della registrazione
- **Refund**: Non disponibile (XP speso)

### 2. Prize System
- **Pro Access**: Accesso Pro per N giorni (top N)
- **Desk Access**: Accesso Desk per N giorni (top N)
- **XP Pool**: Distribuzione XP dal pool (proporzionale al rank)
- **Achievements**: Badge speciali torneo
- **Custom**: Premi personalizzati descritti dall'admin

### 3. Tournament Templates
- **Predefined Types**: 7 template predefiniti
- **Quick Setup**: Admin seleziona template e personalizza
- **Default Values**: Capital, leverage, rules, prizes pre-configurati

### 4. Admin Management
- **Template Selection**: Scegli template base
- **Customization**: Personalizza regole, premi, date
- **Launch**: Avvia torneo con un click
- **Completion**: Completa e distribuisci premi automaticamente

## Tournament Templates

### 1. Daily Quick
- **Format**: Daily (24h)
- **Capital**: €5,000
- **Entry Fee**: 25 XP
- **Prize**: 7 giorni Pro (top 5)
- **Scoring**: Total Return
- **Min Trades**: 3
- **Target**: Trading veloce e intensivo

### 2. Weekly Standard
- **Format**: Weekly (7 giorni)
- **Capital**: €10,000
- **Entry Fee**: 50 XP
- **Prize**: 30 giorni Pro (top 10)
- **Scoring**: Sharpe Ratio
- **Min Trades**: 5
- **Target**: Torneo standard professionale

### 3. Monthly Professional
- **Format**: Monthly (30 giorni)
- **Capital**: €20,000
- **Entry Fee**: 100 XP
- **Prize**: 14 giorni Desk (top 10)
- **Scoring**: Composite
- **Min Trades**: 10
- **Target**: Torneo professionale avanzato

### 4. Elite Championship
- **Format**: Monthly (30 giorni)
- **Capital**: €50,000
- **Entry Fee**: 200 XP
- **Prize**: 30 giorni Desk (top 5)
- **Scoring**: Composite
- **Min Trades**: 20
- **Target**: Campionato premium

### 5. Beginner Friendly
- **Format**: Weekly (7 giorni)
- **Capital**: €5,000
- **Entry Fee**: 10 XP
- **Prize**: XP Pool (top 10)
- **Scoring**: Total Return
- **Min Trades**: 2
- **Target**: Principianti

### 6. Risk Management Master
- **Format**: Weekly (7 giorni)
- **Capital**: €10,000
- **Entry Fee**: 75 XP
- **Prize**: 21 giorni Pro (top 8)
- **Scoring**: Calmar Ratio
- **Min Trades**: 8
- **Target**: Gestione rischio

### 7. Sharpe Ratio Challenge
- **Format**: Weekly (7 giorni)
- **Capital**: €10,000
- **Entry Fee**: 60 XP
- **Prize**: 14 giorni Pro (top 10)
- **Scoring**: Sharpe Ratio
- **Min Trades**: 5
- **Target**: Miglior Sharpe Ratio

## Entry Fee & XP System

### XP Sources
1. **Paper Trading**: 5-10 XP per trade
2. **Lessons**: 10-25 XP per lezione completata
3. **Courses**: 50-100 XP per corso completato
4. **Achievements**: 10-150 XP per achievement
5. **Daily Streak**: 5 XP per giorno consecutivo
6. **Tournament Prizes**: XP dal pool torneo

### Entry Fee Examples
- **Beginner**: 10-25 XP (tornei entry-level)
- **Standard**: 50-75 XP (tornei settimanali)
- **Professional**: 100-150 XP (tornei mensili)
- **Elite**: 200+ XP (campionati premium)

### Payment Flow
1. User seleziona torneo
2. Sistema verifica XP disponibile
3. Se sufficiente, deduce XP e registra
4. Se insufficiente, mostra errore con XP richiesto/disponibile

## Prize Distribution

### Pro Access Prize
- **Winner (1st)**: Full duration
- **Top 3**: Full duration
- **Top 10**: Full duration
- **Stacking**: Se già Pro, estende scadenza

### Desk Access Prize
- **Winner (1st)**: Full duration
- **Top 3**: Full duration
- **Top 10**: Full duration
- **Upgrade**: Se Pro, upgrade a Desk

### XP Pool Prize
- **Winner (1st)**: 40% del pool
- **2nd Place**: 20% del pool
- **3rd Place**: 15% del pool
- **4th-10th**: 25% diviso equamente

### Automatic Award
- **Trigger**: Quando torneo completa
- **Function**: `award_tournament_prizes()`
- **Update**: `user_profiles` per Pro/Desk
- **Update**: `user_stats` per XP
- **Log**: `paper_trading_tournament_participants.prize_awarded`

## Admin Workflow

### 1. Create Tournament
```
1. Admin va a Dashboard → Tournaments → Create
2. Seleziona Template (opzionale)
3. Personalizza:
   - Nome, descrizione
   - Date (registration, start, end)
   - Capital, leverage, rules
   - Entry fee XP
   - Prize type e dettagli
4. Salva come Draft
```

### 2. Launch Tournament
```
1. Admin reviewa torneo Draft
2. Clicca "Launch" → status = 'open_registration'
3. Users possono registrarsi (pagano XP)
4. Admin può monitorare registrazioni
```

### 3. Start Tournament
```
1. Quando registration period finisce
2. Admin clicca "Start" → status = 'in_progress'
3. Users possono fare trading
4. Leaderboard aggiornato in real-time
```

### 4. Complete Tournament
```
1. Quando tournament period finisce
2. Admin clicca "Complete" → status = 'completed'
3. Sistema calcola final rankings
4. Premi distribuiti automaticamente:
   - Pro/Desk access granted
   - XP awarded
   - Achievements unlocked
```

## API Endpoints

### Templates
- `GET /api/tournaments/templates` - Lista template disponibili
- `GET /api/tournaments/templates?format=weekly` - Filtra per format

### Tournaments
- `GET /api/tournaments` - Lista tornei
- `GET /api/tournaments/[id]` - Dettagli torneo
- `POST /api/tournaments` - Crea torneo (admin, con template opzionale)
- `PATCH /api/tournaments/[id]` - Aggiorna torneo (admin)

### Registration
- `POST /api/tournaments/[id]/register` - Registrati (paga XP se richiesto)

### Management
- `POST /api/tournaments/[id]/complete` - Completa torneo e distribuisci premi (admin)

### Leaderboard
- `GET /api/tournaments/[id]/leaderboard` - Classifica torneo

## Database Schema Updates

### Tournaments Table
- `entry_fee_xp`: Costo iscrizione in XP
- `prize_type`: Tipo premio (pro_access, desk_access, xp_pool, achievement, custom)
- `prize_pro_access_duration_days`: Giorni Pro access
- `prize_desk_access_duration_days`: Giorni Desk access
- `prize_pool_xp`: Pool XP da distribuire
- `prize_top_n`: Top N che ricevono premi
- `prize_custom_description`: Descrizione premio custom

### Participants Table
- `entry_fee_paid`: Se entry fee pagato
- `entry_fee_xp_amount`: Importo XP pagato
- `entry_fee_paid_at`: Quando pagato
- `prize_awarded`: Se premio assegnato
- `prize_type`: Tipo premio ricevuto
- `prize_details`: Dettagli premio (JSONB)
- `prize_awarded_at`: Quando premio assegnato

### Templates Table
- Template predefiniti con default values
- Admin può creare template custom

## Academic Compliance

### Entry Fee Rationale
- **Sunk Cost Effect**: Entry fee aumenta commitment
- **Quality Filter**: Filtra partecipanti seri
- **Resource Management**: Limita numero partecipanti

### Prize System
- **Pro/Desk Access**: Valore reale per utenti
- **XP Pool**: Mantiene engagement
- **Achievements**: Riconoscimento sociale

### Tournament Design
- **Multiple Formats**: Daily, Weekly, Monthly
- **Progressive Difficulty**: Beginner → Elite
- **Specialized Tournaments**: Risk, Sharpe, etc.

## Best Practices

### Entry Fee Setting
- **Too Low**: Troppi partecipanti, qualità bassa
- **Too High**: Pochi partecipanti, engagement basso
- **Optimal**: Bilanciato per target audience

### Prize Distribution
- **Top Heavy**: Winner prende molto (motivazione)
- **Broad**: Top 10 ricevono qualcosa (engagement)
- **Balanced**: Mix di entrambi

### Template Usage
- **Quick Start**: Usa template per setup veloce
- **Customization**: Personalizza per eventi speciali
- **Consistency**: Template mantengono standard

## Future Enhancements

### Advanced Features
- **Team Tournaments**: Multi-user teams
- **Seasonal Championships**: Serie di tornei
- **Qualification Rounds**: Pre-qualificazione
- **Wildcard Entries**: Entry gratuite per top performers

### Analytics
- **Entry Fee Optimization**: Analisi entry fee vs partecipazione
- **Prize Effectiveness**: Analisi premi vs engagement
- **Template Performance**: Quali template funzionano meglio

## Conclusion

Il sistema avanzato di tornei fornisce:
- **Entry Fee System**: XP payment per qualità e commitment
- **Prize System**: Pro/Desk access, XP, achievements
- **Template System**: Quick setup per admin
- **Admin Management**: Workflow completo per gestione
- **Automatic Prizes**: Distribuzione automatica premi
- **Academic Compliance**: Basato su best practices

Questo sistema crea un ecosistema completo di competizioni educative che mantiene engagement, qualità e valore per gli utenti.
