# Paper Trading Tournaments - Academic Compliance & Best Practices

## Overview
Tournament system per paper trading con regole professionali, scoring accademico e gamification integrata.

## Academic References

### 1. **Scoring Methods**
- **Sharpe Ratio**: Sharpe (1964) - "Capital Asset Prices: A Theory of Market Equilibrium"
  - Risk-adjusted return metric
  - Standard in institutional trading evaluation
- **Calmar Ratio**: Young (1991) - "Calmar Ratio: A Better Measure of Risk-Adjusted Return"
  - Return / Max Drawdown
  - Better for high-volatility strategies
- **Total Return**: Standard performance metric
- **Composite Score**: Weighted combination of multiple metrics
  - 40% Sharpe, 30% Return, 20% Calmar, 10% Drawdown (inverse)

### 2. **Tournament Rules**
- **Minimum Trades**: Ensures statistical significance
- **Max Drawdown Limit**: Risk management (Prado, 2018)
- **Min Sharpe Ratio**: Quality filter (Chan, 2013)
- **Min Win Rate**: Consistency requirement
- **Position Size Limits**: Risk management (Tharp, 1998)
- **Leverage Limits**: Capital preservation

### 3. **Competitive Analysis**
- **Leaderboard Systems**: Standard in trading competitions
- **Real-time Rankings**: Motivational and educational
- **Historical Snapshots**: Performance analysis over time

## Database Schema

### Core Tables
1. **paper_trading_tournaments**: Tournament configuration
2. **paper_trading_tournament_rules**: Detailed rules per tournament
3. **paper_trading_tournament_participants**: Isolated portfolios per tournament
4. **paper_trading_tournament_leaderboard**: Ranking snapshots
5. **paper_trading_tournament_positions**: Tournament-specific positions
6. **paper_trading_tournament_history**: Closed trades in tournament

### Key Features
- **Isolated Portfolios**: Each tournament has separate capital and positions
- **Real-time Scoring**: Automatic score calculation based on metrics
- **Ranking System**: Dynamic rankings updated during tournament
- **Rule Enforcement**: Database-level constraints for rule violations

## Tournament Formats

### Daily Tournaments
- Duration: 24 hours
- Quick engagement
- Lower capital requirements

### Weekly Tournaments
- Duration: 7 days
- Balanced competition
- Standard format

### Monthly Tournaments
- Duration: 30 days
- Comprehensive evaluation
- Higher stakes

### Custom Tournaments
- Flexible duration
- Custom rules
- Special events

## Scoring Methods

### 1. Sharpe Ratio (Default)
- **Formula**: (Return - Risk-Free Rate) / Standard Deviation
- **Advantage**: Industry standard, risk-adjusted
- **Use Case**: General purpose, institutional comparison

### 2. Total Return
- **Formula**: (Final Equity - Initial Capital) / Initial Capital * 100
- **Advantage**: Simple, intuitive
- **Use Case**: Beginner-friendly tournaments

### 3. Calmar Ratio
- **Formula**: Annual Return / Max Drawdown
- **Advantage**: Better for volatile strategies
- **Use Case**: High-risk tournaments

### 4. Composite Score
- **Formula**: Weighted combination
  - 40% Sharpe Ratio
  - 30% Total Return
  - 20% Calmar Ratio
  - 10% Drawdown (inverse)
- **Advantage**: Balanced evaluation
- **Use Case**: Professional tournaments

## Professional Rules

### Risk Management
- **Max Position Size**: 20% default (configurable)
- **Max Leverage**: 2x default (configurable)
- **Max Drawdown Limit**: 20% default (configurable)
- **Violation Penalty**: Disqualification, score penalty, or warning

### Performance Requirements
- **Min Trades**: 5 default (ensures statistical significance)
- **Min Sharpe Ratio**: 0.5 default (quality filter)
- **Min Win Rate**: 40% default (consistency)
- **Min Daily Trades**: Optional (engagement)

### Eligibility
- **Min Level**: User level requirement
- **Pro Required**: Optional Pro subscription requirement
- **Max Participants**: Optional cap

## Gamification Integration

### Achievements
- **Tournament Winner**: First place
- **Top 10**: Top 10 finish
- **Consistent Performer**: Multiple top finishes
- **Tournament Participant**: Join first tournament
- **Perfect Score**: Maximum score in tournament

### XP Rewards
- **Registration**: 10 XP
- **Participation**: 5 XP per day active
- **Top 10 Finish**: 50 XP
- **Winner**: 100 XP

### Prizes
- **XP Pool**: Distributed to winners
- **Achievement Badges**: Special tournament achievements
- **Leaderboard Recognition**: Public recognition

## API Endpoints

### Tournament Management
- `GET /api/tournaments` - List tournaments
- `GET /api/tournaments/[id]` - Get tournament details
- `POST /api/tournaments` - Create tournament (admin)
- `PATCH /api/tournaments/[id]` - Update tournament (admin)

### Participation
- `POST /api/tournaments/[id]/register` - Register for tournament
- `GET /api/tournaments/[id]/leaderboard` - Get leaderboard

### Tournament Trading (Future)
- `POST /api/tournaments/[id]/positions` - Open position in tournament
- `DELETE /api/tournaments/[id]/positions/[id]` - Close position
- `GET /api/tournaments/[id]/stats` - Get participant stats

## Status Flow

```
draft → open_registration → in_progress → completed
  ↓           ↓                ↓
cancelled  cancelled      cancelled
```

### Status Transitions
- **draft**: Admin can edit, not visible to users
- **open_registration**: Users can register
- **in_progress**: Tournament active, trading allowed
- **completed**: Tournament ended, final rankings
- **cancelled**: Tournament cancelled

## Real-time Updates

### Leaderboard Updates
- Automatic ranking updates on position close
- Score recalculation on metrics change
- Snapshot creation for historical analysis

### Performance Tracking
- Real-time P&L updates
- Metric calculations (Sharpe, Calmar, etc.)
- Rule violation detection

## Future Enhancements

### Advanced Features
- **Team Tournaments**: Multi-user teams
- **Strategy Categories**: Separate rankings per strategy
- **Live Streaming**: Real-time leaderboard updates
- **Social Features**: Sharing, comments, following

### Analytics
- **Performance Reports**: Detailed post-tournament analysis
- **Strategy Comparison**: Compare strategies across participants
- **Risk Analysis**: Risk metrics per participant

### Integration
- **Backtesting**: Pre-tournament strategy testing
- **Paper Trading**: Seamless transition from practice to tournament
- **Education**: Tournament-specific learning resources

## MIFID Compliance

### Disclaimers
- **Educational Purpose**: Tournaments are for educational purposes
- **No Real Money**: No actual financial risk
- **Not Investment Advice**: Results do not guarantee future performance
- **Simulated Environment**: Results may not reflect real trading

### Risk Warnings
- Displayed prominently in tournament UI
- Included in registration confirmation
- Referenced in leaderboard

## Testing & Validation

### Unit Tests
- Score calculation accuracy
- Ranking algorithm correctness
- Rule enforcement logic

### Integration Tests
- Tournament lifecycle (creation → completion)
- Registration flow
- Leaderboard updates
- Position management

### User Testing
- Tournament experience
- Leaderboard clarity
- Rule understanding
- Engagement metrics

## Conclusion

Il sistema di tornei è progettato per essere:
- **Accademicamente Valido**: Basato su metriche professionali standard
- **Competitivo**: Leaderboard e ranking in tempo reale
- **Educativo**: Regole professionali insegnano best practices
- **Engaging**: Gamification e premi aumentano partecipazione
- **Scalabile**: Supporta multiple tournament formats e regole custom

Questa implementazione fornisce una base solida per competizioni di trading educative che mantengono standard professionali e accademici.
