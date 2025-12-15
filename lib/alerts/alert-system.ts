/**
 * Alert System
 * 
 * Sistema di alert per:
 * - Segnali di trading
 * - Livelli di prezzo
 * - Pattern recognition
 * - Performance milestones
 * 
 * Supporta: Browser notifications, in-app alerts
 */

export interface Alert {
  id: string;
  type: 'signal' | 'price' | 'pattern' | 'performance';
  title: string;
  message: string;
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  actionUrl?: string;
  data?: Record<string, unknown>;
}

export interface PriceAlert {
  symbol: string;
  condition: 'above' | 'below' | 'equals';
  price: number;
  triggered: boolean;
  triggeredAt?: number;
}

export interface SignalAlert {
  symbol: string;
  signal: 'STRONG_BUY' | 'BUY' | 'SELL' | 'STRONG_SELL';
  confidence: number;
  entryPrice: number;
}

class AlertSystem {
  private alerts: Alert[] = [];
  private priceAlerts: Map<string, PriceAlert[]> = new Map();
  private maxAlerts = 100;
  private notificationPermission: NotificationPermission = 'default';

  constructor() {
    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          this.notificationPermission = permission;
        });
      } else {
        this.notificationPermission = Notification.permission;
      }
    }
  }

  /**
   * Create price alert
   */
  createPriceAlert(alert: Omit<PriceAlert, 'triggered'>): string {
    const id = `${alert.symbol}-${alert.price}-${Date.now()}`;
    const priceAlert: PriceAlert = {
      ...alert,
      triggered: false,
    };

    if (!this.priceAlerts.has(alert.symbol)) {
      this.priceAlerts.set(alert.symbol, []);
    }
    this.priceAlerts.get(alert.symbol)!.push(priceAlert);

    return id;
  }

  /**
   * Check price alerts
   */
  checkPriceAlerts(symbol: string, currentPrice: number): Alert[] {
    const alerts: Alert[] = [];
    const symbolAlerts = this.priceAlerts.get(symbol) || [];

    symbolAlerts.forEach((alert) => {
      if (alert.triggered) return;

      let shouldTrigger = false;

      if (alert.condition === 'above' && currentPrice >= alert.price) {
        shouldTrigger = true;
      } else if (alert.condition === 'below' && currentPrice <= alert.price) {
        shouldTrigger = true;
      } else if (alert.condition === 'equals' && Math.abs(currentPrice - alert.price) < currentPrice * 0.001) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        alert.triggered = true;
        alert.triggeredAt = Date.now();

        const alertObj: Alert = {
          id: `price-${alert.symbol}-${Date.now()}`,
          type: 'price',
          title: `${symbol} Price Alert`,
          message: `${symbol} ${alert.condition} $${alert.price.toFixed(2)}`,
          timestamp: Date.now(),
          priority: 'medium',
          read: false,
          data: { symbol, price: currentPrice, condition: alert.condition },
        };

        alerts.push(alertObj);
        this.addAlert(alertObj);
      }
    });

    return alerts;
  }

  /**
   * Create signal alert
   */
  createSignalAlert(alert: SignalAlert): void {
    const alertObj: Alert = {
      id: `signal-${alert.symbol}-${Date.now()}`,
      type: 'signal',
      title: `${alert.symbol} ${alert.signal} Signal`,
      message: `${alert.signal} signal with ${alert.confidence}% confidence. Entry: $${alert.entryPrice.toFixed(2)}`,
      timestamp: Date.now(),
      priority: alert.confidence > 85 ? 'high' : alert.confidence > 70 ? 'medium' : 'low',
      read: false,
      data: alert,
      actionUrl: `/crypto-trading-dashboard?symbol=${alert.symbol}`,
    };

    this.addAlert(alertObj);
  }

  /**
   * Create pattern alert
   */
  createPatternAlert(
    symbol: string,
    patternName: string,
    signal: 'bullish' | 'bearish',
    description: string
  ): void {
    const alertObj: Alert = {
      id: `pattern-${symbol}-${Date.now()}`,
      type: 'pattern',
      title: `${symbol} ${patternName} Pattern`,
      message: description,
      timestamp: Date.now(),
      priority: 'medium',
      read: false,
      data: { symbol, patternName, signal },
      actionUrl: `/crypto-trading-dashboard?symbol=${symbol}`,
    };

    this.addAlert(alertObj);
  }

  /**
   * Create performance milestone alert
   */
  createPerformanceAlert(message: string, milestone: string): void {
    const alertObj: Alert = {
      id: `performance-${Date.now()}`,
      type: 'performance',
      title: `Performance Milestone: ${milestone}`,
      message,
      timestamp: Date.now(),
      priority: 'high',
      read: false,
      data: { milestone },
    };

    this.addAlert(alertObj);
  }

  /**
   * Add alert to list
   */
  private addAlert(alert: Alert): void {
    this.alerts.unshift(alert); // Add to beginning

    // Keep only last maxAlerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts);
    }

    // Show browser notification if permission granted
    if (this.notificationPermission === 'granted' && typeof window !== 'undefined') {
      new Notification(alert.title, {
        body: alert.message,
        icon: '/favicon.ico',
        tag: alert.id,
      });
    }
  }

  /**
   * Get all alerts
   */
  getAlerts(unreadOnly = false): Alert[] {
    if (unreadOnly) {
      return this.alerts.filter((a) => !a.read);
    }
    return this.alerts;
  }

  /**
   * Mark alert as read
   */
  markAsRead(alertId: string): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.read = true;
    }
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    this.alerts.forEach((alert) => {
      alert.read = true;
    });
  }

  /**
   * Delete alert
   */
  deleteAlert(alertId: string): void {
    this.alerts = this.alerts.filter((a) => a.id !== alertId);
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.alerts.filter((a) => !a.read).length;
  }

  /**
   * Clear all alerts
   */
  clear(): void {
    this.alerts = [];
    this.priceAlerts.clear();
  }
}

// Singleton instance
let alertSystem: AlertSystem | null = null;

export function getAlertSystem(): AlertSystem {
  if (!alertSystem) {
    alertSystem = new AlertSystem();
  }
  return alertSystem;
}

