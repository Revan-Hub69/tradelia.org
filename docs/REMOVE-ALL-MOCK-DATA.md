# 🚫 Rimozione Completa Mock Data

## Strategia

1. **Rimuovere TUTTI i fallback con mock data**
2. **Restituire errori 503 chiari quando API keys non configurate**
3. **Restituire errori 500 chiari quando ci sono errori API**
4. **Rimuovere tutti i commenti "simulate" o "mock"**

## Pattern da Sostituire

### Pattern 1: Fallback Mock Data
```typescript
// PRIMA (DA RIMUOVERE)
if (!API_KEY) {
  return NextResponse.json({ data: mockData, note: 'mock data' });
}

// DOPO (CORRETTO)
if (!API_KEY) {
  return NextResponse.json(
    { error: 'API_KEY not configured. Please configure in environment variables.' },
    { status: 503 }
  );
}
```

### Pattern 2: Simulate Data
```typescript
// PRIMA (DA RIMUOVERE)
// For free tier, simulate based on typical patterns
const data = simulateData();

// DOPO (CORRETTO)
// Fetch real data from API
const data = await fetchRealData();
if (!data) {
  throw new Error('Failed to fetch data. Check API configuration.');
}
```

### Pattern 3: Fallback in Catch
```typescript
// PRIMA (DA RIMUOVERE)
catch (error) {
  return NextResponse.json({ data: mockData });
}

// DOPO (CORRETTO)
catch (error) {
  console.error('Error:', error);
  return NextResponse.json(
    { error: 'Failed to fetch data. Check API configuration and network.' },
    { status: 500 }
  );
}
```

## File da Correggere (88+ endpoint)

Vedi lista completa in output del comando find.
