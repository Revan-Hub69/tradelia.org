# Application Monitoring - Documentazione

**Data**: 2025-01-27  
**Versione**: 1.0.0  
**Status**: Production-Ready

---

## 📋 OVERVIEW

Sistema completo di monitoring per error tracking, performance monitoring, health checks e metrics.

---

## 🔍 ERROR TRACKING

### Error Tracker

**File**: `lib/monitoring/error-tracker.ts`

**Features**:
- Supporto multi-provider (Sentry, Console)
- Context-aware error tracking
- User identification
- Automatic error filtering

**Usage**:
```typescript
import { captureException, captureMessage, setErrorTrackingUser } from '@/lib/monitoring/error-tracker';

// Capture exception
try {
  // ...
} catch (error) {
  captureException(error as Error, {
    userId: user.id,
    path: '/dashboard',
    component: 'PortfolioManager',
    action: 'add_position',
    metadata: { symbol: 'AAPL' },
  });
}

// Capture message
captureMessage('User action completed', 'info', {
  userId: user.id,
  action: 'export_portfolio',
});

// Set user context
setErrorTrackingUser(user.id, user.email);
```

**Providers**:

1. **Sentry** (Production):
   - Configura `NEXT_PUBLIC_SENTRY_DSN` in `.env`
   - Installa: `npm install @sentry/nextjs`
   - Auto-inizializzazione se DSN presente

2. **Console** (Development/Default):
   - Log strutturato in console
   - Nessuna configurazione richiesta

**Error Boundary Integration**:
- `ErrorBoundary` component auto-captures React errors
- Invia a error tracker con context completo

---

## ⚡ PERFORMANCE MONITORING

### Web Vitals Tracking

**File**: `lib/monitoring/performance.ts`

**Features**:
- Core Web Vitals tracking (LCP, FID, CLS)
- Custom performance metrics
- API call performance
- Component render time

**Usage**:
```typescript
import { trackWebVitals, trackPerformanceMetric, measureApiCall } from '@/lib/monitoring/performance';

// Track Web Vitals (in _app.tsx o layout)
export function reportWebVitals(metric: WebVitals) {
  trackWebVitals(metric);
}

// Track custom metric
trackPerformanceMetric({
  name: 'page_load',
  value: loadTime,
  metadata: { page: '/dashboard' },
});

// Measure API call
const data = await measureApiCall(
  () => fetch('/api/portfolio'),
  '/api/portfolio',
  'GET'
);
```

**Integration**:
1. Aggiungi in `app/layout.tsx`:
```typescript
import { trackWebVitals } from '@/lib/monitoring/performance';

export function reportWebVitals(metric: any) {
  trackWebVitals(metric);
}
```

2. Configura Google Analytics (opzionale):
```typescript
// In _app.tsx o layout
if (typeof window !== 'undefined' && window.gtag) {
  // Auto-tracked via trackWebVitals
}
```

---

## 🏥 HEALTH CHECKS

### Health Check Endpoint

**File**: `app/api/health/route.ts`

**Endpoint**: `GET /api/health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T...",
  "checks": {
    "database": { "status": "healthy", "latency": 15 },
    "api": { "status": "healthy", "latency": 2 }
  },
  "uptime": 3600,
  "version": "2.0.1"
}
```

**Status Codes**:
- `200`: Healthy
- `200`: Degraded (alcuni check falliti)
- `503`: Unhealthy (check critici falliti)

**Usage**:
- Monitoring services (UptimeRobot, Pingdom, etc.)
- Load balancer health checks
- Kubernetes liveness/readiness probes

---

## 📊 METRICS ENDPOINT

### Application Metrics

**File**: `app/api/metrics/route.ts`

**Endpoint**: `GET /api/metrics` (Admin only)

**Response**:
```json
{
  "timestamp": "2025-01-27T...",
  "users": {
    "total": 1000,
    "active": 500
  },
  "reports": {
    "total": 200,
    "published": 150
  },
  "courses": {
    "total": 10,
    "enrollments": 500
  }
}
```

**Authentication**:
- Richiede admin role
- Headers: `Authorization: Bearer <token>`

**Usage**:
- Dashboard monitoring
- Alerting systems
- Analytics tools

---

## 🔧 CONFIGURATION

### Environment Variables

```env
# Sentry (opzionale)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Performance Endpoint (opzionale)
NEXT_PUBLIC_PERFORMANCE_ENDPOINT=https://your-analytics-endpoint.com/metrics

# Google Analytics (opzionale)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Setup Sentry

1. **Install**:
```bash
npm install @sentry/nextjs
```

2. **Configure**:
```bash
npx @sentry/wizard@latest -i nextjs
```

3. **Add DSN**:
```env
NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
```

---

## 📈 MONITORING SETUP

### External Monitoring Services

1. **UptimeRobot / Pingdom**:
   - URL: `https://your-domain.com/api/health`
   - Interval: 5 minutes
   - Alert: Se status != 200

2. **Sentry**:
   - Auto-configurato se DSN presente
   - Dashboard: https://sentry.io

3. **Google Analytics**:
   - Web Vitals auto-tracked
   - Custom events via `trackPerformanceMetric`

---

## ✅ CHECKLIST COMPLETAMENTO

### Error Tracking
- [x] Error Tracker con multi-provider ✅
- [x] Error Boundary integration ✅
- [x] Context-aware tracking ✅
- [x] User identification ✅

### Performance Monitoring
- [x] Web Vitals tracking ✅
- [x] Custom metrics ✅
- [x] API call measurement ✅
- [x] Component render time ✅

### Health Checks
- [x] Health check endpoint ✅
- [x] Database connection check ✅
- [x] API latency tracking ✅
- [x] Status codes appropriati ✅

### Metrics
- [x] Application metrics endpoint ✅
- [x] Admin authentication ✅
- [x] User/report/course stats ✅

---

## 🚀 DEPLOYMENT

### 1. Setup Sentry (Optional)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Aggiungi DSN a `.env`:
```env
NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
```

### 2. Setup External Monitoring

**UptimeRobot**:
1. Crea monitor
2. URL: `https://your-domain.com/api/health`
3. Interval: 5 minutes
4. Alert: Se status != 200

### 3. Test

```bash
# Test health check
curl https://your-domain.com/api/health

# Test metrics (richiede admin)
curl -H "Authorization: Bearer <admin-token>" https://your-domain.com/api/metrics
```

---

**Status**: Production-Ready  
**Last Updated**: 2025-01-27

