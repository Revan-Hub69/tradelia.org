# Logging & Debugging - Documentazione

**Data**: 2025-01-27  
**Versione**: 1.0.0  
**Status**: Production-Ready

---

## 📋 OVERVIEW

Sistema completo di logging strutturato e strumenti di debugging per sviluppo e produzione.

---

## 📝 STRUCTURED LOGGING

### Logger Core

**File**: `lib/logging/logger.ts`

**Features**:
- Log levels: debug, info, warn, error
- Structured context
- In-memory storage (opzionale)
- External endpoint support
- Automatic error tracking integration

**Usage**:
```typescript
import { logDebug, logInfo, logWarn, logError, getLogger } from '@/lib/logging/logger';

// Basic logging
logInfo('User logged in', { userId: 'xxx', path: '/dashboard' });
logWarn('Rate limit approaching', { endpoint: '/api/prices' });
logError('Database connection failed', error, { component: 'DatabaseService' });

// Advanced usage
const logger = getLogger();
logger.setLevel('warn'); // Only log warnings and errors
logger.debug('Debug message', { metadata: { key: 'value' } });
```

**Log Levels**:
- `debug`: Development debugging (solo in dev)
- `info`: Informational messages
- `warn`: Warnings
- `error`: Errors

**Context**:
```typescript
interface LogContext {
  userId?: string;
  requestId?: string;
  path?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}
```

---

## 🔌 API LOGGING

### Request/Response Logging

**File**: `lib/logging/api-logger.ts`

**Features**:
- Automatic request logging
- Response status tracking
- Duration measurement
- Error logging

**Usage**:
```typescript
import { withApiLogging, logApiRequest, logApiResponse } from '@/lib/logging/api-logger';

// Wrap API route
export const GET = withApiLogging(async (request: NextRequest) => {
  // Your handler
  return NextResponse.json({ data: '...' });
});

// Manual logging
logApiRequest(request, { userId: 'xxx' });
// ... handler logic ...
logApiResponse(request, response, duration, { userId: 'xxx' });
```

---

## 🛠️ DEBUG TOOLS

### Development Utilities

**File**: `lib/debug/dev-tools.ts`

**Features**:
- Debug logging (solo in development)
- Component render tracking
- API call debugging
- State change tracking
- Performance measurement

**Usage**:
```typescript
import { debugLog, debugRender, debugApiCall, measurePerformance } from '@/lib/debug/dev-tools';

// Debug log
debugLog('User action', { action: 'click', button: 'submit' });

// Component render
debugRender('PortfolioManager', { positionsCount: 10 });

// API call
debugApiCall('/api/portfolio', 'GET', { userId: 'xxx' });

// Performance
const result = await measurePerformance('fetchPortfolio', async () => {
  return await fetch('/api/portfolio');
});
```

**React Hook**:
```typescript
import { useDebug } from '@/lib/debug/dev-tools';

function MyComponent(props: MyProps) {
  useDebug('MyComponent', props);
  // ...
}
```

---

## 📊 LOG STORAGE

### In-Memory Storage

**Features**:
- Max 1000 logs in memory
- Automatic cleanup (FIFO)
- Export as JSON
- Filter by level

**Usage**:
```typescript
import { getLogger } from '@/lib/logging/logger';

const logger = getLogger();

// Get logs
const allLogs = logger.getLogs();
const errorLogs = logger.getLogs('error');
const recentLogs = logger.getLogs(undefined, 100);

// Export
const json = logger.exportLogs();

// Clear
logger.clearLogs();
```

### External Storage

**Configuration**:
```env
NEXT_PUBLIC_LOG_ENDPOINT=https://your-logging-service.com/logs
NEXT_PUBLIC_ENABLE_LOG_STORAGE=true
```

**Behavior**:
- Errors automatically sent to endpoint
- Non-blocking (async)
- Fails silently if endpoint unavailable

---

## 🔍 DEBUG API

### Logs Endpoint

**File**: `app/api/debug/logs/route.ts`

**Endpoints**:
- `GET /api/debug/logs` - Get stored logs
- `DELETE /api/debug/logs` - Clear logs

**Query Params**:
- `level`: Filter by level (debug, info, warn, error)
- `limit`: Limit number of logs

**Usage**:
```bash
# Get all logs
curl http://localhost:3000/api/debug/logs

# Get error logs only
curl http://localhost:3000/api/debug/logs?level=error

# Get last 50 logs
curl http://localhost:3000/api/debug/logs?limit=50

# Clear logs
curl -X DELETE http://localhost:3000/api/debug/logs
```

**Security**:
- Development only
- Admin only
- Returns 403 in production

---

## 🔗 INTEGRATION

### Error Tracker Integration

**File**: `lib/monitoring/error-tracker.ts`

**Features**:
- Automatic logging on error capture
- Server-side structured logging
- Context preservation

**Behavior**:
- When `captureException` is called, also logs to structured logger
- Preserves full context
- Server-side only (no client-side logging)

---

## 🔧 CONFIGURATION

### Environment Variables

```env
# Log Storage
NEXT_PUBLIC_ENABLE_LOG_STORAGE=true

# External Logging Endpoint
NEXT_PUBLIC_LOG_ENDPOINT=https://your-logging-service.com/logs

# Log Level (auto-set based on NODE_ENV)
# Development: debug
# Production: info
```

### Log Level Configuration

```typescript
import { getLogger } from '@/lib/logging/logger';

const logger = getLogger();

// Set minimum level
logger.setLevel('warn'); // Only warnings and errors
```

---

## ✅ CHECKLIST COMPLETAMENTO

### Structured Logging
- [x] Logger core ✅
- [x] Log levels ✅
- [x] Context support ✅
- [x] In-memory storage ✅
- [x] External endpoint ✅

### API Logging
- [x] Request logging ✅
- [x] Response logging ✅
- [x] Duration tracking ✅
- [x] Error logging ✅

### Debug Tools
- [x] Debug utilities ✅
- [x] Component tracking ✅
- [x] Performance measurement ✅
- [x] React hooks ✅

### Log Storage
- [x] In-memory storage ✅
- [x] Export functionality ✅
- [x] Filter by level ✅
- [x] Debug API ✅

### Integration
- [x] Error tracker integration ✅
- [x] Server-side logging ✅
- [x] Context preservation ✅

---

## 🚀 DEPLOYMENT

### 1. Development

No configuration needed - debug tools auto-enabled.

### 2. Production

```env
# Disable log storage in production (optional)
NEXT_PUBLIC_ENABLE_LOG_STORAGE=false

# Set external logging endpoint
NEXT_PUBLIC_LOG_ENDPOINT=https://your-logging-service.com/logs
```

### 3. External Logging Service

**Options**:
- **Logtail** (https://logtail.com)
- **Datadog** (https://datadoghq.com)
- **Splunk** (https://splunk.com)
- **Custom endpoint**

**Format**:
```json
{
  "level": "error",
  "message": "Database connection failed",
  "timestamp": "2025-01-27T...",
  "context": {
    "userId": "xxx",
    "component": "DatabaseService"
  },
  "error": {
    "name": "Error",
    "message": "...",
    "stack": "..."
  }
}
```

---

**Status**: Production-Ready  
**Last Updated**: 2025-01-27

