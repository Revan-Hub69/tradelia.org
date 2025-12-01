# User Analytics - Documentazione

**Data**: 2025-01-27  
**Versione**: 1.0.0  
**Status**: Production-Ready

---

## 📋 OVERVIEW

Sistema completo di analytics privacy-compliant per tracking comportamento utente, conversioni e engagement.

---

## 🔍 ANALYTICS TRACKER

### Core Tracker

**File**: `lib/analytics/tracker.ts`

**Features**:
- GDPR compliant (opt-in)
- Multi-provider (GA4, custom)
- Event tracking
- User identification (anonymized)
- Conversion tracking

**Usage**:
```typescript
import { trackEvent, trackConversion, trackEngagement, setAnalyticsUser } from '@/lib/analytics/tracker';

// Track custom event
trackEvent({
  name: 'portfolio_added',
  category: 'portfolio',
  label: 'AAPL',
  value: 100,
  metadata: { symbol: 'AAPL', quantity: 10 },
});

// Track conversion
trackConversion('signup');
trackConversion('subscription', 29.99);
trackConversion('course_completion', 0);

// Track engagement
trackEngagement('report_viewed', { reportId: 'xxx' });

// Set user properties
setAnalyticsUser({
  userId: user.id,
  userRole: 'pro',
  isPro: true,
  subscriptionTier: 'pro',
});
```

---

## 📊 CONVERSION TRACKING

### Conversion Events

**Types**:
- `signup` - User registration
- `subscription` - Subscription purchase
- `course_completion` - Course completed
- `report_download` - Report downloaded

**Integration Points**:

1. **Signup** (`app/(auth)/signup/page.tsx`):
```typescript
import { trackConversion } from '@/lib/analytics/tracker';

// After successful signup
trackConversion('signup');
```

2. **Subscription** (`app/api/checkout/create/route.ts`):
```typescript
import { trackConversion } from '@/lib/analytics/tracker';

// After successful payment
trackConversion('subscription', amount);
```

3. **Course Completion** (`app/api/courses/[slug]/lessons/[lessonId]/complete/route.ts`):
```typescript
import { trackConversion } from '@/lib/analytics/tracker';

// When course is 100% complete
if (progress === 100) {
  trackConversion('course_completion');
}
```

4. **Report Download** (`app/api/reports/[id]/export/route.ts`):
```typescript
import { trackConversion } from '@/lib/analytics/tracker';

// After PDF download
trackConversion('report_download');
```

---

## 🔒 PRIVACY COMPLIANCE

### GDPR Opt-in Banner

**File**: `components/analytics/AnalyticsConsent.tsx`

**Features**:
- Opt-in banner (GDPR compliant)
- User can accept/reject
- Consent stored in localStorage
- Analytics disabled by default

**Usage**:
```tsx
import { AnalyticsConsent } from '@/components/analytics/AnalyticsConsent';

// In app/layout.tsx
<AnalyticsConsent />
```

**Consent Management**:
```typescript
import { enableAnalytics, disableAnalytics, isAnalyticsEnabled } from '@/lib/analytics/tracker';

// Enable
enableAnalytics();

// Disable
disableAnalytics();

// Check status
const enabled = isAnalyticsEnabled();
```

---

## 📈 GOOGLE ANALYTICS 4

### Integration

**File**: `components/analytics/GoogleAnalytics.tsx`

**Setup**:
1. Add to `app/layout.tsx`:
```tsx
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
```

2. Add GA ID to `.env`:
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**Features**:
- Automatic page view tracking
- Event tracking
- User properties
- IP anonymization (GDPR compliant)

---

## 🎯 AUTOMATIC TRACKING

### Page View Tracking

**File**: `lib/hooks/useAnalytics.ts`

**Usage**:
```tsx
import { useAnalytics } from '@/lib/hooks/useAnalytics';

function MyPage() {
  useAnalytics(); // Auto-tracks page views
  // ...
}
```

**Features**:
- Automatic page view on route change
- User properties update
- No manual tracking needed

---

## 📊 CUSTOM EVENTS

### Business-Specific Events

**Examples**:

1. **Portfolio Events**:
```typescript
trackEvent({
  name: 'portfolio_added',
  category: 'portfolio',
  label: symbol,
  metadata: { symbol, quantity, price },
});

trackEvent({
  name: 'portfolio_exported',
  category: 'portfolio',
  label: format, // 'csv' or 'pdf'
});
```

2. **Trading Journal Events**:
```typescript
trackEvent({
  name: 'trade_logged',
  category: 'trading_journal',
  label: tradeType,
  metadata: { symbol, pnl },
});
```

3. **Course Events**:
```typescript
trackEvent({
  name: 'lesson_started',
  category: 'education',
  label: lessonId,
  metadata: { courseSlug, lessonId },
});

trackEvent({
  name: 'quiz_completed',
  category: 'education',
  label: quizId,
  value: score,
  metadata: { courseSlug, quizId, score },
});
```

4. **Report Events**:
```typescript
trackEvent({
  name: 'report_viewed',
  category: 'reports',
  label: reportSlug,
  metadata: { reportId, reportSlug },
});
```

---

## 🔧 CONFIGURATION

### Environment Variables

```env
# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Custom Analytics Endpoint (opzionale)
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics-endpoint.com/events
```

### Setup Google Analytics

1. **Create GA4 Property**:
   - Go to https://analytics.google.com
   - Create new property
   - Get Measurement ID (G-XXXXXXXXXX)

2. **Add to .env**:
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

3. **Add Component**:
```tsx
// In app/layout.tsx
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';

<GoogleAnalytics />
```

---

## ✅ CHECKLIST COMPLETAMENTO

### Core Analytics
- [x] Analytics Tracker ✅
- [x] Event tracking ✅
- [x] User identification ✅
- [x] Conversion tracking ✅

### Privacy Compliance
- [x] GDPR opt-in banner ✅
- [x] Consent management ✅
- [x] IP anonymization ✅
- [x] User data hashing ✅

### Integration
- [x] Google Analytics 4 ✅
- [x] Automatic page view tracking ✅
- [x] Custom events ✅
- [x] Conversion events ✅

### Business Events
- [x] Portfolio events ✅
- [x] Trading journal events ✅
- [x] Course events ✅
- [x] Report events ✅

---

## 🚀 DEPLOYMENT

### 1. Setup Google Analytics

1. Create GA4 property
2. Get Measurement ID
3. Add to `.env`:
```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 2. Add Components

In `app/layout.tsx`:
```tsx
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { AnalyticsConsent } from '@/components/analytics/AnalyticsConsent';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GoogleAnalytics />
        <AnalyticsConsent />
        {children}
      </body>
    </html>
  );
}
```

### 3. Add Translations

In `lib/i18n/it.json` and `lib/i18n/en.json`:
```json
{
  "analytics": {
    "consent": {
      "title": "Privacy e Analytics",
      "message": "Utilizziamo analytics per migliorare la tua esperienza...",
      "accept": "Accetta",
      "reject": "Rifiuta"
    }
  }
}
```

### 4. Test

```typescript
// Test in browser console
import { trackEvent, enableAnalytics } from '@/lib/analytics/tracker';

enableAnalytics();
trackEvent({ name: 'test_event', category: 'test' });
```

---

**Status**: Production-Ready  
**Last Updated**: 2025-01-27

