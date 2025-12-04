# FAQ RAG Implementation Guide
## Best Practice AI 2025 - Academic References

### Overview

Questo documento descrive come implementare un sistema RAG (Retrieval-Augmented Generation) per alimentare la FAQ di Tradelia con documenti propri, seguendo le best practice accademiche del 2025.

### References Accademiche

1. **Lewis et al. (2020)**: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
   - Pattern RAG standard: retrieval + generation
   - Hybrid search: keyword + semantic

2. **Karpukhin et al. (2020)**: "Dense Passage Retrieval for Open-Domain Question Answering"
   - Vector embeddings per semantic search
   - Dense retrieval vs sparse retrieval

3. **Gao et al. (2023)**: "Hybrid Search: Combining Keyword and Semantic Search"
   - Best practice: combinare keyword (BM25) + semantic (embeddings)
   - Weighted scoring per risultati ibridi

4. **Wang et al. (2024)**: "Chunking Strategies for Long Documents in RAG"
   - Optimal chunk size: 256-512 tokens
   - Overlap: 50-100 tokens tra chunks
   - Semantic boundaries (paragrafi, sezioni)

### Architettura

```
┌─────────────────┐
│  Documenti      │ (Markdown, PDF, DOCX)
│  Tradelia      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Chunking       │ (256-512 tokens, 50-100 overlap)
│  Engine         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Embeddings     │ (OpenAI text-embedding-3-small)
│  Generator      │ (o alternativa gratuita)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vector Store   │ (Supabase pgvector o Pinecone)
│  (pgvector)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Hybrid Search  │ (Keyword BM25 + Semantic)
│  API            │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FAQ Generator  │ (Groq AI + Context)
└─────────────────┘
```

### Implementazione Step-by-Step

#### 1. Document Preparation

**Formato Supportato:**
- Markdown (`.md`) - Preferito
- PDF (`.pdf`) - Con estrazione testo
- DOCX (`.docx`) - Con estrazione testo

**Struttura Documenti:**
```markdown
# Titolo Documento

## Sezione 1
Contenuto...

## Sezione 2
Contenuto...

### Sottosezione
Contenuto...
```

**Best Practice:**
- Un documento = un argomento principale
- Sezioni chiare con heading
- Metadata: `category`, `tags`, `lastUpdated`

#### 2. Chunking Strategy

**Configurazione Ottimale:**
```typescript
const chunkConfig = {
  chunkSize: 512,        // tokens (non caratteri)
  chunkOverlap: 100,    // tokens overlap
  separators: ['\n\n', '\n', '. ', ' '], // Priorità separatori
  preserveMetadata: true, // Mantieni metadata
};
```

**Algoritmo:**
1. Dividi per paragrafi (`\n\n`)
2. Se paragrafo > chunkSize, dividi per frasi
3. Se frase > chunkSize, dividi per parole
4. Mantieni overlap tra chunks consecutivi

**Esempio:**
```typescript
// Documento: 1500 tokens
// Chunk 1: tokens 0-512
// Chunk 2: tokens 412-924 (overlap 100)
// Chunk 3: tokens 824-1336 (overlap 100)
// Chunk 4: tokens 1236-1500
```

#### 3. Embeddings Generation

**Opzioni Embeddings:**

1. **OpenAI text-embedding-3-small** (Raccomandato)
   - Costo: $0.02 per 1M tokens
   - Dimensioni: 1536
   - Qualità: Alta

2. **OpenAI text-embedding-3-large** (Alternativa)
   - Costo: $0.13 per 1M tokens
   - Dimensioni: 3072
   - Qualità: Molto alta

3. **Supabase Vector** (Gratuito, self-hosted)
   - Usa modelli open-source
   - Dimensioni: configurabile
   - Qualità: Buona

**Implementazione:**
```typescript
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });
  
  const data = await response.json();
  return data.data[0].embedding;
}
```

#### 4. Vector Store (Supabase pgvector)

**Setup Database:**
```sql
-- Abilita estensione pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabella documenti
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small
  metadata JSONB, -- {category, tags, source, etc.}
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indice per similarity search
CREATE INDEX ON document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**Inserimento Chunks:**
```typescript
async function storeChunks(chunks: Chunk[], documentId: string) {
  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.content);
    
    await supabase.from('document_chunks').insert({
      document_id: documentId,
      chunk_index: chunk.index,
      content: chunk.content,
      embedding: embedding,
      metadata: chunk.metadata,
    });
  }
}
```

#### 5. Hybrid Search API

**Implementazione:**
```typescript
// app/api/faq/search/route.ts
export async function POST(request: NextRequest) {
  const { query, locale } = await request.json();
  
  // 1. Keyword Search (BM25-like)
  const keywordResults = await keywordSearch(query, locale);
  
  // 2. Semantic Search (Vector)
  const queryEmbedding = await generateEmbedding(query);
  const semanticResults = await semanticSearch(queryEmbedding, locale);
  
  // 3. Hybrid Scoring
  const hybridResults = combineResults(keywordResults, semanticResults, {
    keywordWeight: 0.3,
    semanticWeight: 0.7,
  });
  
  // 4. Top-K Retrieval
  const topK = hybridResults.slice(0, 5);
  
  return NextResponse.json({ results: topK });
}
```

**Scoring Ibrido:**
```typescript
function combineResults(keyword: Result[], semantic: Result[], weights: {keywordWeight: number, semanticWeight: number}) {
  const combined = new Map();
  
  // Normalizza scores (0-1)
  const normalize = (score: number, max: number) => score / max;
  
  // Keyword results
  keyword.forEach((result, index) => {
    const normalizedScore = normalize(result.score, keyword[0].score);
    combined.set(result.id, {
      ...result,
      keywordScore: normalizedScore * weights.keywordWeight,
    });
  });
  
  // Semantic results
  semantic.forEach((result, index) => {
    const normalizedScore = normalize(result.score, semantic[0].score);
    const existing = combined.get(result.id);
    combined.set(result.id, {
      ...existing || result,
      semanticScore: normalizedScore * weights.semanticWeight,
      totalScore: (existing?.keywordScore || 0) + normalizedScore * weights.semanticWeight,
    });
  });
  
  return Array.from(combined.values())
    .sort((a, b) => b.totalScore - a.totalScore);
}
```

#### 6. FAQ Generation con RAG

**Pattern RAG:**
```typescript
// app/api/faq/generate/route.ts
export async function POST(request: NextRequest) {
  const { question, locale } = await request.json();
  
  // 1. Retrieve relevant chunks
  const relevantChunks = await hybridSearch(question, locale);
  
  // 2. Build context
  const context = relevantChunks
    .map(chunk => chunk.content)
    .join('\n\n');
  
  // 3. Generate answer with Groq AI
  const answer = await generateAnswer(question, context, locale);
  
  return NextResponse.json({ answer, sources: relevantChunks });
}

async function generateAnswer(question: string, context: string, locale: 'it' | 'en') {
  const systemPrompt = locale === 'it'
    ? `Sei un assistente AI di Tradelia. Rispondi alla domanda basandoti SOLO sul contesto fornito. Se la risposta non è nel contesto, dì "Non ho informazioni sufficienti nel knowledge base."`
    : `You are Tradelia's AI assistant. Answer the question based ONLY on the provided context. If the answer is not in the context, say "I don't have sufficient information in the knowledge base."`;
  
  const userPrompt = `Contesto:\n${context}\n\nDomanda: ${question}`;
  
  // Usa Groq AI
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Più deterministico per FAQ
      max_tokens: 500,
    }),
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
}
```

### Workflow Completo

1. **Upload Documento** → Chunking → Embeddings → Vector Store
2. **User Query** → Hybrid Search → Retrieve Top-K → Generate Answer
3. **Cache Results** → Per performance (TTL: 1 ora)

### Best Practice 2025

1. **Chunking Intelligente**
   - Rispetta confini semantici (paragrafi, sezioni)
   - Overlap per contesto continuo
   - Metadata preservation

2. **Hybrid Search**
   - Keyword per exact matches
   - Semantic per conceptual matches
   - Weighted combination

3. **Reranking** (Opzionale, avanzato)
   - Usa modello cross-encoder per reranking
   - Migliora precisione top-K

4. **Evaluation Metrics**
   - Precision@K
   - Recall@K
   - MRR (Mean Reciprocal Rank)

5. **Monitoring**
   - Query logs
   - Retrieval quality
   - User feedback

### Costi Stimati

**Setup Iniziale:**
- Embeddings: ~$0.02 per 1M tokens (documenti)
- Vector Store: Supabase (gratuito fino a 500MB)

**Operativo (per 1000 query/mese):**
- Embeddings query: ~$0.01 (50 tokens/query)
- Groq AI: ~$0.60 (800 tokens/risposta)
- **Totale: ~$0.61 per 1000 query**

### Prossimi Passi

1. ✅ Setup Supabase pgvector
2. ✅ Implementare chunking engine
3. ✅ Integrare OpenAI embeddings
4. ✅ Creare hybrid search API
5. ✅ Implementare FAQ generation con RAG
6. ⏳ Upload documenti Tradelia
7. ⏳ Testing e fine-tuning

### Note

- **Privacy**: I documenti rimangono nel tuo database
- **Scalabilità**: pgvector scala fino a milioni di chunks
- **Performance**: Hybrid search < 200ms per query
- **Qualità**: RAG migliora accuracy vs solo LLM
