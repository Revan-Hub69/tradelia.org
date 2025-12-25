'use client'

import React, { useState, useEffect } from 'react'
import {
  CalculatorIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface TradePlanBuilderProps {
  onSave?: (plan: TradePlan) => void
  onCancel?: () => void
}

export interface TradePlan {
  symbol: string
  side: 'LONG' | 'SHORT'
  entryType: 'MARKET' | 'LIMIT'
  entryPrice?: number
  quantity: number
  leverage: number
  stopLoss?: number
  takeProfit?: number
  riskAmount: number
  riskPercent: number
}

export const TradePlanBuilder: React.FC<TradePlanBuilderProps> = ({
  onSave,
  onCancel
}) => {
  const [plan, setPlan] = useState<TradePlan>({
    symbol: 'BTCUSDT',
    side: 'LONG',
    entryType: 'MARKET',
    quantity: 0.001,
    leverage: 5,
    riskAmount: 10,
    riskPercent: 1.0
  })

  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [calculations, setCalculations] = useState({
    positionSize: 0,
    entryValue: 0,
    liquidationPrice: 0,
    riskValue: 0,
    potentialProfit: 0,
    riskRewardRatio: 0
  })

  // Available symbols (in production, fetch from API)
  const availableSymbols = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
    'DOTUSDT', 'LINKUSDT', 'AVAXUSDT', 'LTCUSDT', 'ALGOUSDT'
  ]

  // Calculate trade metrics
  useEffect(() => {
    const price = currentPrice || 45000 // Default BTC price for demo

    const positionSize = plan.quantity * price
    const entryValue = positionSize / plan.leverage
    const liquidationPrice = plan.side === 'LONG'
      ? price * (1 - 1/plan.leverage + 0.001) // 0.1% buffer
      : price * (1 + 1/plan.leverage - 0.001)

    const riskValue = plan.riskAmount
    const potentialProfit = plan.takeProfit
      ? Math.abs(plan.takeProfit - price) * plan.quantity
      : 0

    const riskRewardRatio = potentialProfit > 0 ? potentialProfit / riskValue : 0

    setCalculations({
      positionSize,
      entryValue,
      liquidationPrice,
      riskValue,
      potentialProfit,
      riskRewardRatio
    })
  }, [plan, currentPrice])

  // Auto-calculate stop loss based on risk
  const calculateStopLoss = () => {
    if (!currentPrice || plan.riskAmount <= 0) return

    const riskPerContract = plan.riskAmount / plan.quantity
    const stopDistance = riskPerContract / currentPrice

    if (plan.side === 'LONG') {
      return currentPrice * (1 - stopDistance)
    } else {
      return currentPrice * (1 + stopDistance)
    }
  }

  // Auto-calculate take profit for 2:1 reward ratio
  const calculateTakeProfit = () => {
    if (!plan.stopLoss || !currentPrice) return

    const riskDistance = Math.abs(currentPrice - plan.stopLoss) / currentPrice

    if (plan.side === 'LONG') {
      return currentPrice * (1 + riskDistance * 2)
    } else {
      return currentPrice * (1 - riskDistance * 2)
    }
  }

  const handleAutoCalculate = () => {
    const autoSL = calculateStopLoss()
    const autoTP = calculateTakeProfit()

    if (autoSL && autoTP) {
      setPlan(prev => ({
        ...prev,
        stopLoss: autoSL,
        takeProfit: autoTP
      }))
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave(plan)
    }
  }

  const getRiskLevel = () => {
    if (calculations.riskRewardRatio >= 2) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' }
    if (calculations.riskRewardRatio >= 1.5) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (calculations.riskRewardRatio >= 1) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { level: 'Poor', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const riskLevel = getRiskLevel()

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Trade Plan Builder</h2>
        <p className="text-sm text-gray-600 mt-1">Create a structured trading plan with risk management</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Trade Setup */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Trade Setup</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Symbol</label>
                  <select
                    value={plan.symbol}
                    onChange={(e) => setPlan({...plan, symbol: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {availableSymbols.map(symbol => (
                      <option key={symbol} value={symbol}>{symbol}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Side</label>
                  <select
                    value={plan.side}
                    onChange={(e) => setPlan({...plan, side: e.target.value as 'LONG' | 'SHORT'})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="LONG">LONG</option>
                    <option value="SHORT">SHORT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Entry Type</label>
                  <select
                    value={plan.entryType}
                    onChange={(e) => setPlan({...plan, entryType: e.target.value as 'MARKET' | 'LIMIT'})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MARKET">MARKET</option>
                    <option value="LIMIT">LIMIT</option>
                  </select>
                </div>

                {plan.entryType === 'LIMIT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Entry Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={plan.entryPrice || ''}
                      onChange={(e) => setPlan({...plan, entryPrice: parseFloat(e.target.value)})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Entry price"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    step="0.001"
                    value={plan.quantity}
                    onChange={(e) => setPlan({...plan, quantity: parseFloat(e.target.value)})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Leverage</label>
                  <input
                    type="number"
                    min="1"
                    max="125"
                    value={plan.leverage}
                    onChange={(e) => setPlan({...plan, leverage: parseInt(e.target.value)})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Risk ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={plan.riskAmount}
                    onChange={(e) => setPlan({...plan, riskAmount: parseFloat(e.target.value)})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Management</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stop Loss</label>
                  <input
                    type="number"
                    step="0.01"
                    value={plan.stopLoss || ''}
                    onChange={(e) => setPlan({...plan, stopLoss: parseFloat(e.target.value)})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Stop loss price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Take Profit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={plan.takeProfit || ''}
                    onChange={(e) => setPlan({...plan, takeProfit: parseFloat(e.target.value)})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Take profit price"
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleAutoCalculate}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <CalculatorIcon className="w-4 h-4 mr-2" />
                  Auto-Calculate SL/TP (2:1 Ratio)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Preview & Calculations */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Trade Preview</h3>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Position Size:</span>
                  <span className="text-sm font-medium">${calculations.positionSize.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Margin Required:</span>
                  <span className="text-sm font-medium">${calculations.entryValue.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Liquidation Price:</span>
                  <span className="text-sm font-medium">${calculations.liquidationPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Risk Amount:</span>
                  <span className="text-sm font-medium">${calculations.riskValue.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Potential Profit:</span>
                  <span className="text-sm font-medium">${calculations.potentialProfit.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium text-gray-900">Risk/Reward Ratio:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${riskLevel.bg} ${riskLevel.color}`}>
                    {calculations.riskRewardRatio.toFixed(1)}:1 ({riskLevel.level})
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Assessment</h3>

              <div className="space-y-3">
                {calculations.liquidationPrice > 0 && (
                  <div className={`p-3 rounded-lg ${Math.abs(calculations.liquidationPrice - currentPrice) / currentPrice < 0.05 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                    <div className="flex items-center">
                      {Math.abs(calculations.liquidationPrice - currentPrice) / currentPrice < 0.05 ? (
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                      ) : (
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">Liquidation Risk</p>
                        <p className="text-xs text-gray-600">
                          {Math.abs(calculations.liquidationPrice - currentPrice) / currentPrice < 0.05
                            ? 'High risk - liquidation price too close'
                            : 'Acceptable liquidation distance'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`p-3 rounded-lg ${calculations.riskRewardRatio >= 1.5 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-center">
                    <ChartBarIcon className="w-5 h-5 text-gray-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Reward Potential</p>
                      <p className="text-xs text-gray-600">
                        {calculations.riskRewardRatio >= 2
                          ? 'Excellent risk-reward ratio'
                          : calculations.riskRewardRatio >= 1.5
                          ? 'Good risk-reward ratio'
                          : 'Consider improving reward potential'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm text-sm font-medium"
          >
            Save Trade Plan
          </button>
        </div>
      </div>
    </div>
  )
}

export default TradePlanBuilder
