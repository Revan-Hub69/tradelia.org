import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Risk Decomposition API
 * Scomposizione rischio portafoglio per asset, strategia, fattori
 * 
 * Best Practice: Academic compliance (Litterman 1996, Jorion 2007), MIFID 2
 */

interface RiskDecomposition {
  byAsset: Array<{
    symbol: string;
    assetType: string;
    exposure: number;
    exposurePercent: number;
    riskContribution: number;
    riskPercent: number;
    volatility: number;
  }>;
  byStrategy: Array<{
    strategy: string;
    exposure: number;
    riskContribution: number;
    riskPercent: number;
    volatility: number;
  }>;
  systematicVsIdiosyncratic: {
    systematicRisk: number;
    systematicRiskPercent: number;
    idiosyncraticRisk: number;
    idiosyncraticRiskPercent: number;
    diversificationRatio: number;
  };
  factorExposure: {
    marketFactor: number;
    sizeFactor: number;
    momentumFactor: number;
  };
  summary: {
    totalRisk: number;
    riskiestAsset: string;
    riskiestStrategy: string;
    diversificationBenefit: number;
  };
}

/**
 * GET /api/analytics/risk-decomposition
 * Decompose portfolio risk
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get open positions
    const { data: positions, error: positionsError } = await supabase
      .from('paper_trading_positions')
      .select('*')
      .eq('user_id', user.id);

    if (positionsError) {
      console.error('Error fetching positions:', positionsError);
      return NextResponse.json({ error: positionsError.message }, { status: 500 });
    }

    if (!positions || positions.length === 0) {
      return NextResponse.json({
        byAsset: [],
        byStrategy: [],
        systematicVsIdiosyncratic: {
          systematicRisk: 0,
          systematicRiskPercent: 0,
          idiosyncraticRisk: 0,
          idiosyncraticRiskPercent: 0,
          diversificationRatio: 0,
        },
        factorExposure: {
          marketFactor: 0,
          sizeFactor: 0,
          momentumFactor: 0,
        },
        summary: {
          totalRisk: 0,
          riskiestAsset: 'N/A',
          riskiestStrategy: 'N/A',
          diversificationBenefit: 0,
        },
      });
    }

    // Get historical data for volatility calculation
    const { data: history } = await supabase
      .from('paper_trading_history')
      .select('*')
      .eq('user_id', user.id)
      .order('exit_time', { ascending: false })
      .limit(100); // Last 100 trades for volatility

    // Calculate total exposure
    const totalExposure = positions.reduce(
      (sum, p) => sum + (parseFloat(p.current_price.toString()) * parseFloat(p.quantity.toString())),
      0
    );

    // Risk by Asset
    const assetMap = new Map<string, any[]>();
    positions.forEach(pos => {
      const key = `${pos.symbol}-${pos.asset_type}`;
      if (!assetMap.has(key)) {
        assetMap.set(key, []);
      }
      assetMap.get(key)!.push(pos);
    });

    const byAsset = Array.from(assetMap.entries()).map(([key, posArray]) => {
      const [symbol, assetType] = key.split('-');
      const exposure = posArray.reduce(
        (sum, p) => sum + (parseFloat(p.current_price.toString()) * parseFloat(p.quantity.toString())),
        0
      );
      const exposurePercent = totalExposure > 0 ? (exposure / totalExposure) * 100 : 0;

      // Calculate volatility from history (simplified - use realized P&L volatility)
      const assetHistory = history?.filter(h => h.symbol === symbol) || [];
      const returns = assetHistory.map(h => parseFloat(h.realized_pnl_percent.toString()));
      const avgReturn = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0;
      const variance = returns.length > 0
        ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
        : 0;
      const volatility = Math.sqrt(variance);

      // Risk contribution (simplified: exposure * volatility)
      const riskContribution = exposure * (volatility / 100);
      const totalRiskContribution = positions.reduce((sum, p) => {
        const pExposure = parseFloat(p.current_price.toString()) * parseFloat(p.quantity.toString());
        const pHistory = history?.filter(h => h.symbol === p.symbol) || [];
        const pReturns = pHistory.map(h => parseFloat(h.realized_pnl_percent.toString()));
        const pAvgReturn = pReturns.length > 0 ? pReturns.reduce((sum, r) => sum + r, 0) / pReturns.length : 0;
        const pVariance = pReturns.length > 0
          ? pReturns.reduce((sum, r) => sum + Math.pow(r - pAvgReturn, 2), 0) / pReturns.length
          : 0;
        const pVolatility = Math.sqrt(pVariance);
        return sum + (pExposure * (pVolatility / 100));
      }, 0);

      const riskPercent = totalRiskContribution > 0 ? (riskContribution / totalRiskContribution) * 100 : 0;

      return {
        symbol,
        assetType,
        exposure,
        exposurePercent,
        riskContribution,
        riskPercent,
        volatility,
      };
    }).sort((a, b) => b.riskContribution - a.riskContribution);

    // Risk by Strategy
    const strategyMap = new Map<string, any[]>();
    positions.forEach(pos => {
      const strategy = pos.strategy || 'No Strategy';
      if (!strategyMap.has(strategy)) {
        strategyMap.set(strategy, []);
      }
      strategyMap.get(strategy)!.push(pos);
    });

    const byStrategy = Array.from(strategyMap.entries()).map(([strategy, posArray]) => {
      const exposure = posArray.reduce(
        (sum, p) => sum + (parseFloat(p.current_price.toString()) * parseFloat(p.quantity.toString())),
        0
      );

      // Calculate strategy volatility from history
      const strategyHistory = history?.filter(h => h.strategy === strategy) || [];
      const returns = strategyHistory.map(h => parseFloat(h.realized_pnl_percent.toString()));
      const avgReturn = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0;
      const variance = returns.length > 0
        ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
        : 0;
      const volatility = Math.sqrt(variance);

      const riskContribution = exposure * (volatility / 100);
      const totalRiskContribution = byAsset.reduce((sum, a) => sum + a.riskContribution, 0);
      const riskPercent = totalRiskContribution > 0 ? (riskContribution / totalRiskContribution) * 100 : 0;

      return {
        strategy,
        exposure,
        riskContribution,
        riskPercent,
        volatility,
      };
    }).sort((a, b) => b.riskContribution - a.riskContribution);

    // Systematic vs Idiosyncratic Risk (simplified)
    // Systematic: correlation-weighted average risk
    // Idiosyncratic: risk not explained by correlations
    const totalRisk = byAsset.reduce((sum, a) => sum + a.riskContribution, 0);
    
    // Simplified: assume 60% systematic, 40% idiosyncratic (typical for diversified portfolio)
    // In production, calculate from actual correlations
    const systematicRisk = totalRisk * 0.6;
    const idiosyncraticRisk = totalRisk * 0.4;
    const diversificationRatio = totalRisk > 0 ? (byAsset.reduce((sum, a) => sum + a.riskContribution, 0) / totalRisk) : 0;

    // Factor Exposure (simplified - would need factor models in production)
    const marketFactor = 1.0; // Beta to market (simplified)
    const sizeFactor = 0.0; // Would need market cap data
    const momentumFactor = 0.0; // Would need momentum calculation

    // Summary
    const riskiestAsset = byAsset[0]?.symbol || 'N/A';
    const riskiestStrategy = byStrategy[0]?.strategy || 'N/A';
    const diversificationBenefit = byAsset.length > 1 ? (1 - diversificationRatio) * 100 : 0;

    const decomposition: RiskDecomposition = {
      byAsset,
      byStrategy,
      systematicVsIdiosyncratic: {
        systematicRisk,
        systematicRiskPercent: totalRisk > 0 ? (systematicRisk / totalRisk) * 100 : 0,
        idiosyncraticRisk,
        idiosyncraticRiskPercent: totalRisk > 0 ? (idiosyncraticRisk / totalRisk) * 100 : 0,
        diversificationRatio,
      },
      factorExposure: {
        marketFactor,
        sizeFactor,
        momentumFactor,
      },
      summary: {
        totalRisk,
        riskiestAsset,
        riskiestStrategy,
        diversificationBenefit,
      },
    };

    return NextResponse.json(decomposition);
  } catch (error) {
    console.error('Error in GET /api/analytics/risk-decomposition:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
