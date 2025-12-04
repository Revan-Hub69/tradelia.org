# Groq AI Integration - Tradelia

## Overview
Integrazione Groq AI per analisi avanzate con conformità accademica e stile Tradelia.

## System Prompts

### Portfolio Risk Analysis
- **Focus**: Analisi rischio portafoglio
- **Style**: Tradelia (chiaro, professionale, educativo)
- **Compliance**: MIFID, accademico
- **References**: Markowitz (1952), Sharpe (1964), Modern Portfolio Theory

### Crypto Market Analysis
- **Focus**: Analisi trend crypto top 400
- **Style**: Tradelia (autorevole, friendly)
- **Compliance**: MIFID, educativo
- **References**: Efficient Market Hypothesis, Technical Analysis principles

## Features

### 1. Portfolio Risk Analysis
- **Endpoint**: `POST /api/portfolio/risk-analysis`
- **Input**: Array di posizioni (symbol, quantity, assetType, entryPrice)
- **Output**: 
  - Analisi concentrazione
  - Correlazioni
  - Volatilità
  - Diversificazione
  - Raccomandazioni educative
  - Note accademiche

### 2. Top 400 Crypto Monitor
- **Endpoint**: `GET /api/crypto/top-400-monitor`
- **Input**: limit (default 400), cache (default true)
- **Output**:
  - Prezzi top 400 crypto
  - Summary (gainers/losers)
  - AI analysis
  - Trends identificati
  - Alerts su anomalie

## Technical Details

### Groq API
- **Model**: `llama-3.1-70b-versatile`
- **Rate Limit**: 30 RPM, 14.4k TPM (free tier)
- **Temperature**: 0.3 (consistent analysis)
- **Max Tokens**: 1000-2000 (based on use case)

### Caching
- **Price Cache**: 5 minutes (crypto monitor)
- **Analysis Cache**: Not cached (always fresh)
- **Rate Limiting**: Delays between requests

### Error Handling
- **Fallback**: Basic analysis if Groq unavailable
- **Graceful Degradation**: Continue without AI if needed
- **User Feedback**: Clear error messages

## Best Practices

### System Prompt Design
1. **Tradelia Branding**: Always include Tradelia style
2. **Academic Compliance**: Reference academic sources
3. **MIFID Compliance**: Always include disclaimers
4. **Educational Focus**: Explain, don't predict

### Response Format
1. **Structured JSON**: Consistent format
2. **Quantitative + Qualitative**: Numbers + explanations
3. **Actionable**: Clear recommendations (educational)
4. **Transparent**: Show confidence levels when possible

### Rate Limiting
1. **Respect Limits**: 30 RPM max
2. **Batch Requests**: Group when possible
3. **Cache Aggressively**: 5+ minutes for non-critical
4. **Fallback**: Always have non-AI alternative

## Future Enhancements

### Advanced Features
- **Historical Analysis**: Trend over time
- **Comparative Analysis**: Compare portfolios
- **Scenario Analysis**: Stress testing
- **Custom Alerts**: User-defined triggers

### Integration
- **Real-time Updates**: WebSocket for live analysis
- **Dashboard Widgets**: Visual representations
- **Export Reports**: PDF/CSV exports
- **Notifications**: Alert system

## Conclusion

Groq AI integration provides:
- ✅ **Free Tier**: Zero cost
- ✅ **High Quality**: 70B model
- ✅ **Fast**: Low latency
- ✅ **Compliant**: MIFID, academic
- ✅ **Tradelia Style**: Branded responses

Ready for production use! 🚀
