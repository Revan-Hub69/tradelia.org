# Gamification System - Implementation Guide

## ✅ IMPLEMENTATO

### 1. Achievement Engine
- ✅ `lib/gamification/achievement-engine.ts`
- ✅ Funzione `checkAndUnlockAchievements()`
- ✅ Check automatico condizioni
- ✅ Unlock automatico achievement

### 2. XP System
- ✅ Funzione `awardXP()`
- ✅ Calcolo livelli dinamico
- ✅ Log transazioni XP
- ✅ Tabella `user_stats` e `xp_transactions`

### 3. Streak System
- ✅ Funzione `updateStreak()`
- ✅ Tracking giorni consecutivi
- ✅ Reset automatico se streak rotto

### 4. API Routes
- ✅ `/api/gamification/check-achievements` - Check e unlock
- ✅ `/api/gamification/award-xp` - Assegna XP
- ✅ `/api/gamification/stats` - Statistiche utente

### 5. UI Components
- ✅ `AchievementNotification.tsx` - Notifica achievement sbloccato
- ✅ `UserStats.tsx` - Display XP, level, streak

---

## 🔧 INTEGRAZIONE NECESSARIA

### 1. Chiamare check-achievements dopo azioni

**Dopo lesson completed**:
```typescript
// In API route o componente che gestisce completamento lezione
await fetch('/api/gamification/award-xp', {
  method: 'POST',
  body: JSON.stringify({ amount: 10, source: 'lesson_completed' }),
});

await fetch('/api/gamification/check-achievements', {
  method: 'POST',
  body: JSON.stringify({ actionType: 'lesson_completed' }),
});
```

**Dopo course completed**:
```typescript
await fetch('/api/gamification/award-xp', {
  method: 'POST',
  body: JSON.stringify({ amount: 100, source: 'course_completed' }),
});

await fetch('/api/gamification/check-achievements', {
  method: 'POST',
  body: JSON.stringify({ actionType: 'course_completed' }),
});
```

**Dopo report viewed**:
```typescript
await fetch('/api/gamification/award-xp', {
  method: 'POST',
  body: JSON.stringify({ amount: 5, source: 'report_viewed' }),
});

await fetch('/api/gamification/check-achievements', {
  method: 'POST',
  body: JSON.stringify({ actionType: 'report_viewed' }),
});
```

**Daily login**:
```typescript
// In middleware o layout
await fetch('/api/gamification/award-xp', {
  method: 'POST',
  body: JSON.stringify({ amount: 5, source: 'daily_login' }),
});

await fetch('/api/gamification/update-streak', {
  method: 'POST',
});

await fetch('/api/gamification/check-achievements', {
  method: 'POST',
  body: JSON.stringify({ actionType: 'daily_login' }),
});
```

### 2. Mostrare notifica achievement

**In `DashboardShell.tsx` o layout**:
```typescript
const [unlockedAchievement, setUnlockedAchievement] = useState(null);

useEffect(() => {
  const handleAchievementUnlocked = async (event: CustomEvent) => {
    const achievementId = event.detail;
    // Fetch achievement details
    const { data } = await fetch(`/api/achievements/${achievementId}`);
    setUnlockedAchievement(data);
  };

  window.addEventListener('achievement-unlocked', handleAchievementUnlocked);
  return () => window.removeEventListener('achievement-unlocked', handleAchievementUnlocked);
}, []);

// Render
{unlockedAchievement && (
  <AchievementNotification
    achievement={unlockedAchievement}
    onClose={() => setUnlockedAchievement(null)}
  />
)}
```

---

## 📊 SCHEMA DATABASE COMPLETO

### Tabelle da creare in Supabase:

1. **user_stats** - Statistiche utente
2. **xp_transactions** - Log transazioni XP
3. **achievements** - Aggiungere campi `xp_reward` e `rarity`

### Trigger da creare:

1. **Auto-check achievements** quando:
   - `course_progress` viene aggiornato
   - `user_activities` viene inserito
   - `user_stats` viene aggiornato

---

## 🎯 BEST PRACTICES IMPLEMENTATE

### ✅ Self-Determination Theory
- **Autonomy**: Utente sceglie corsi/attività
- **Competence**: Feedback immediato (XP, level, progress)
- **Relatedness**: (Da implementare: leaderboard)

### ✅ Flow Theory
- **Clear Goals**: Obiettivi chiari (completare corso)
- **Immediate Feedback**: XP, level, achievement notifications
- **Balance**: Livelli scalano con XP (non troppo facili/difficili)

### ✅ Octalysis Framework
- **Epic Meaning**: Educazione finanziaria
- **Accomplishment**: Achievement system
- **Ownership**: Collezione achievement
- **Social Influence**: (Da implementare: leaderboard)
- **Scarcity**: Rarity system (common, rare, epic, legendary)
- **Unpredictability**: Achievement sbloccati automaticamente
- **Avoidance**: Streak system (paura perdere streak)

---

## 🚀 PROSSIMI PASSI

1. **Integrare chiamate API** dopo azioni utente
2. **Creare tabelle** in Supabase
3. **Popolare achievement** iniziali
4. **Testare sistema** completo
5. **Aggiungere leaderboard** (opzionale)

---

## 📈 METRICHE DA TRACCIARE

- Completion rate corsi
- Average XP per utente
- Top achievement sbloccati
- Streak medio utenti
- Engagement giornaliero

