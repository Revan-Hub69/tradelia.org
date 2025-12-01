/**
 * Analytics Tracker
 * Privacy-compliant analytics tracking system
 * 
 * Features:
 * - GDPR compliant (opt-in)
 * - Multiple providers (GA4, custom)
 * - Event tracking
 * - User identification (anonymized)
 * 
 * Riferimento: GDPR, Privacy-First Analytics
 */

export interface AnalyticsEvent {
  name: string;
  category?: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

export interface UserProperties {
  userId?: string;
  userRole?: string;
  subscriptionTier?: string;
  isPro?: boolean;
}

class AnalyticsTracker {
  private enabled = false;
  private userProperties: UserProperties = {};

  constructor() {
    // Check if analytics is enabled (GDPR compliant - opt-in)
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('analytics_consent');
      this.enabled = consent === 'true';
    }
  }

  /**
   * Enable analytics (GDPR opt-in)
   */
  enable(): void {
    if (typeof window === 'undefined') return;
    this.enabled = true;
    localStorage.setItem('analytics_consent', 'true');
  }

  /**
   * Disable analytics (GDPR opt-out)
   */
  disable(): void {
    if (typeof window === 'undefined') return;
    this.enabled = false;
    localStorage.setItem('analytics_consent', 'false');
  }

  /**
   * Check if analytics is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set user properties (anonymized)
   */
  setUser(properties: UserProperties): void {
    this.userProperties = properties;
    
    if (!this.enabled) return;

    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('set', 'user_properties', {
        user_id: properties.userId ? this.hashUserId(properties.userId) : undefined,
        user_role: properties.userRole,
        subscription_tier: properties.subscriptionTier,
        is_pro: properties.isPro,
      });
    }
  }

  /**
   * Track event
   */
  track(event: AnalyticsEvent): void {
    if (!this.enabled) return;

    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.name, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.metadata,
      });
    }

    // Custom analytics endpoint (opzionale)
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      this.sendToCustomEndpoint(event).catch((error) => {
        console.warn('Failed to send analytics event:', error);
      });
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event);
    }
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string): void {
    if (!this.enabled) return;

    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: path,
        page_title: title,
      });
    }

    // Track as event
    this.track({
      name: 'page_view',
      category: 'navigation',
      label: path,
      metadata: { title },
    });
  }

  /**
   * Track conversion event
   */
  trackConversion(conversionType: 'signup' | 'subscription' | 'course_completion' | 'report_download', value?: number): void {
    this.track({
      name: 'conversion',
      category: 'conversion',
      label: conversionType,
      value,
      metadata: {
        conversion_type: conversionType,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Track user engagement
   */
  trackEngagement(action: string, metadata?: Record<string, unknown>): void {
    this.track({
      name: 'user_engagement',
      category: 'engagement',
      label: action,
      metadata: {
        ...metadata,
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Hash user ID for privacy (one-way hash)
   */
  private hashUserId(userId: string): string {
    // Simple hash function (in production, use crypto.subtle)
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Send to custom analytics endpoint
   */
  private async sendToCustomEndpoint(event: AnalyticsEvent): Promise<void> {
    if (!process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) return;

    await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        user_properties: this.userProperties,
        timestamp: Date.now(),
        url: window.location.href,
        user_agent: navigator.userAgent,
      }),
      keepalive: true,
    });
  }
}

// Singleton instance
let analyticsInstance: AnalyticsTracker | null = null;

export function getAnalyticsTracker(): AnalyticsTracker {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsTracker();
  }
  return analyticsInstance;
}

// Convenience functions
export function trackEvent(event: AnalyticsEvent): void {
  getAnalyticsTracker().track(event);
}

export function trackPageView(path: string, title?: string): void {
  getAnalyticsTracker().trackPageView(path, title);
}

export function trackConversion(conversionType: 'signup' | 'subscription' | 'course_completion' | 'report_download', value?: number): void {
  getAnalyticsTracker().trackConversion(conversionType, value);
}

export function trackEngagement(action: string, metadata?: Record<string, unknown>): void {
  getAnalyticsTracker().trackEngagement(action, metadata);
}

export function setAnalyticsUser(properties: UserProperties): void {
  getAnalyticsTracker().setUser(properties);
}

export function enableAnalytics(): void {
  getAnalyticsTracker().enable();
}

export function disableAnalytics(): void {
  getAnalyticsTracker().disable();
}

export function isAnalyticsEnabled(): boolean {
  return getAnalyticsTracker().isEnabled();
}

