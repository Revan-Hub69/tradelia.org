/**
 * Risk Manager Panel Component
 * 
 * Visualizza e gestisce rischio
 */

'use client';

import { useState, useEffect } from 'react';
import { createRiskManager, type RiskConfig, type Position } from '@/lib/risk/risk-manager';

interface RiskManagerPanelProps {
  accountBalance: number;
  onConfigChange?: (config: RiskConfig) => void;
}

export function RiskManagerPanel({ accountBalance, onConfigChange }: RiskManagerPanelProps) {
  const [config, setConfig] = useState<RiskConfig>({
    accountBalance,
    riskPerTrade: 0.01, // 1%
    maxRiskPerDay: 0.05, // 5%
    maxPositions: 5,
    maxLeverage: 20,
    stopLossPercent: 0.02, // 2%
    takeProfitPercent: 0.04, // 4%
    useKellyCriterion: false,
  });

  const [riskManager] = useState(() => createRiskManager(config));
  const [openPositions, setOpenPositions] = useState<Position[]>([]);
  const [riskStats, setRiskStats] = useState(riskManager.getTotalRisk());

  useEffect(() => {
    riskManager.updateConfig({ ...config, accountBalance });
    setOpenPositions(riskManager.getOpenPositions());
    setRiskStats(riskManager.getTotalRisk());
    onConfigChange?.(config);
  }, [config, accountBalance, riskManager, onConfigChange]);

  const handleConfigChange = (key: keyof RiskConfig, value: number | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Risk Management
      </h3>

      {/* Risk Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Risk</div>
          <div className={`text-lg font-bold ${
            riskStats.totalRiskPercent > 10 ? 'text-red-600' :
            riskStats.totalRiskPercent > 5 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {riskStats.totalRiskPercent.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">${riskStats.totalRiskAmount.toFixed(2)}</div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
          <div className="text-xs text-gray-600 dark:text-gray-400">Daily Risk</div>
          <div className={`text-lg font-bold ${
            riskStats.dailyRiskPercent > config.maxRiskPerDay * 100 * 0.8 ? 'text-red-600' :
            riskStats.dailyRiskPercent > config.maxRiskPerDay * 100 * 0.5 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {riskStats.dailyRiskPercent.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">${riskStats.dailyRiskUsed.toFixed(2)}</div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
          <div className="text-xs text-gray-600 dark:text-gray-400">Open Positions</div>
          <div className={`text-lg font-bold ${
            openPositions.length >= config.maxPositions ? 'text-red-600' :
            openPositions.length >= config.maxPositions * 0.8 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {openPositions.length}/{config.maxPositions}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
          <div className="text-xs text-gray-600 dark:text-gray-400">Account Balance</div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${accountBalance.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Risk Configuration */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Risk Per Trade: {(config.riskPerTrade * 100).toFixed(1)}%
          </label>
          <input
            type="range"
            min="0.005"
            max="0.05"
            step="0.005"
            value={config.riskPerTrade}
            onChange={(e) => handleConfigChange('riskPerTrade', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            ${(accountBalance * config.riskPerTrade).toFixed(2)} per trade
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Risk Per Day: {(config.maxRiskPerDay * 100).toFixed(1)}%
          </label>
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            value={config.maxRiskPerDay}
            onChange={(e) => handleConfigChange('maxRiskPerDay', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            ${(accountBalance * config.maxRiskPerDay).toFixed(2)} daily limit
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Positions: {config.maxPositions}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={config.maxPositions}
            onChange={(e) => handleConfigChange('maxPositions', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max Leverage: {config.maxLeverage}x
          </label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={config.maxLeverage}
            onChange={(e) => handleConfigChange('maxLeverage', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="kelly"
            checked={config.useKellyCriterion}
            onChange={(e) => handleConfigChange('useKellyCriterion', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="kelly" className="text-sm text-gray-700 dark:text-gray-300">
            Use Kelly Criterion for position sizing
          </label>
        </div>
      </div>

      {/* Open Positions */}
      {openPositions.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Open Positions
          </h4>
          <div className="space-y-2">
            {openPositions.map((pos, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{pos.symbol}</span>
                    <span className={`ml-2 ${pos.side === 'long' ? 'text-green-600' : 'text-red-600'}`}>
                      {pos.side.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div>Risk: {pos.riskPercent.toFixed(2)}%</div>
                    <div className="text-xs text-gray-500">
                      ${pos.riskAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

