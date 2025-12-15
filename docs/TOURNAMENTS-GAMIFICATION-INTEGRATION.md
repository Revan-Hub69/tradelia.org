# Tournaments - Gamification Integration

## Overview
Integrazione completa tra sistema tornei e gamification per massimizzare engagement e valore educativo.

## XP Rewards

### Registration
- **Tournament Registration**: 10 XP
- **First Tournament**: Bonus 5 XP

### Participation
- **Daily Active**: 5 XP per giorno di trading attivo nel torneo
- **Minimum Trades Met**: 10 XP quando si raggiunge il minimo di trade richiesti

### Performance
- **Top 50%**: 15 XP
- **Top 25%**: 25 XP
- **Top 10**: 50 XP
- **Top 3**: 75 XP
- **Winner**: 100 XP

### Special Achievements
- **Perfect Score**: 150 XP (massimo score possibile)
- **Sharpe Master**: 150 XP (vincere con Sharpe > 2.0)
- **Consistency King**: 100 XP (top 10 in 3+ tornei)

## Achievements

### Base
- **Primo Torneo** (`tournament-first`): Partecipa al primo torneo
  - XP: 20
  - Condition: `tournaments_joined >= 1`

### Performance
- **Campione** (`tournament-winner`): Vinci un torneo
  - XP: 100
  - Condition: `tournaments_won >= 1`
  
- **Top 10** (`tournament-top-10`): Finisci nei top 10
  - XP: 50
  - Condition: `tournaments_top10 >= 1`

- **Consistente** (`tournament-consistent`): Top 10 in 3 tornei
  - XP: 75
  - Condition: `tournaments_top10 >= 3`

### Engagement
- **Partecipante Attivo** (`tournament-participant`): Partecipa a 5 tornei
  - XP: 30
  - Condition: `tournaments_joined >= 5`

### Special
- **Sharpe Master** (`tournament-sharpe-master`): Vinci con Sharpe > 2.0
  - XP: 150
  - Condition: `tournament_sharpe_winner >= 2.0`

## Integration Points

### Tournament Registration
```typescript
// On successful registration
await handleUserAction('tournament_registered', 10);
await checkAndUnlockAchievements(userId, 'tournament_registered');
```

### Tournament Completion
```typescript
// On tournament end
const rank = participant.final_rank;
if (rank === 1) {
  await handleUserAction('tournament_won', 100);
} else if (rank <= 10) {
  await handleUserAction('tournament_completed', 50);
} else if (rank <= 25) {
  await handleUserAction('tournament_completed', 25);
} else {
  await handleUserAction('tournament_completed', 15);
}

await checkAndUnlockAchievements(userId, 'tournament_completed');
```

### Daily Participation
```typescript
// On daily active trading in tournament
await handleUserAction('tournament_participation', 5);
```

## Prize Distribution

### XP Pool
- Distributed to top 10 participants
- Winner: 40% of pool
- 2nd-3rd: 20% each
- 4th-10th: 20% split equally

### Achievement Badges
- Special tournament achievement badges
- Displayed on profile
- Leaderboard recognition

## Leaderboard Integration

### Real-time Updates
- XP updates on position close
- Achievement unlocks trigger notifications
- Leaderboard shows XP gains

### Social Features (Future)
- Share tournament results
- Compare with friends
- Follow top performers

## Analytics

### Engagement Metrics
- Tournament participation rate
- Average XP earned per tournament
- Achievement unlock rate
- Retention after first tournament

### Performance Metrics
- Correlation between XP and performance
- Achievement impact on engagement
- Prize effectiveness

## Best Practices

### Motivation
- Clear XP rewards for all actions
- Progressive achievements (easy → hard)
- Special recognition for winners

### Education
- Achievements teach trading concepts
- XP rewards encourage learning
- Leaderboard shows best practices

### Retention
- Daily participation rewards
- Multiple tournament formats
- Consistent performer recognition

## Conclusion

L'integrazione gamification-tornei crea un sistema completo che:
- **Motiva**: XP e achievements chiari
- **Educa**: Achievements insegnano concetti
- **Ritiene**: Engagement continuo
- **Premia**: Riconoscimento per performance

Questa integrazione massimizza il valore educativo e l'engagement degli utenti nei tornei.
