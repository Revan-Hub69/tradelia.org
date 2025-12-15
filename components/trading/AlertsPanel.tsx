/**
 * Alerts Panel Component
 * 
 * Visualizza e gestisce alert
 */

'use client';

import { useState, useEffect } from 'react';
import { getAlertSystem, type Alert } from '@/lib/alerts/alert-system';

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const alertSystem = getAlertSystem();
    const updateAlerts = () => {
      setAlerts(alertSystem.getAlerts(!showAll));
      setUnreadCount(alertSystem.getUnreadCount());
    };

    updateAlerts();
    const interval = setInterval(updateAlerts, 1000);

    return () => clearInterval(interval);
  }, [showAll]);

  const handleMarkAsRead = (alertId: string) => {
    const alertSystem = getAlertSystem();
    alertSystem.markAsRead(alertId);
    setAlerts(alertSystem.getAlerts(!showAll));
    setUnreadCount(alertSystem.getUnreadCount());
  };

  const handleMarkAllAsRead = () => {
    const alertSystem = getAlertSystem();
    alertSystem.markAllAsRead();
    setAlerts(alertSystem.getAlerts(!showAll));
    setUnreadCount(0);
  };

  const handleDelete = (alertId: string) => {
    const alertSystem = getAlertSystem();
    alertSystem.deleteAlert(alertId);
    setAlerts(alertSystem.getAlerts(!showAll));
    setUnreadCount(alertSystem.getUnreadCount());
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/20 border-red-500';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/20 border-orange-500';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20 border-blue-500';
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'signal':
        return '📊';
      case 'price':
        return '💰';
      case 'pattern':
        return '📈';
      case 'performance':
        return '🎯';
      default:
        return '🔔';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Alerts</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              className="rounded"
            />
            Show all
          </label>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No alerts
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 border-l-4 ${getPriorityColor(alert.priority)} ${
                !alert.read ? 'bg-opacity-100' : 'bg-opacity-50'
              } hover:bg-opacity-75 transition-opacity`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getTypeIcon(alert.type)}</span>
                    <h4 className={`font-semibold ${!alert.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                      {alert.title}
                    </h4>
                    {!alert.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {alert.message}
                  </p>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {!alert.read && (
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {alert.actionUrl && (
                <a
                  href={alert.actionUrl}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-block"
                >
                  View details →
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

