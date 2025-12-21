export type RegimeResult = {
  regime: 'VOL_EXPANSION' | 'VOL_COMPRESSION' | 'TREND' | 'RANGE';
  trendBias: 'BULL' | 'BEAR';
  atrPct: number;
  momentum: number;
};

export const computeRegime = (lastClose: number, sma20: number, atr14: number, momentum: number): RegimeResult => {
  const atrPct = atr14 / lastClose;
  const trendBias = lastClose > sma20 ? 'BULL' : 'BEAR';
  const regime =
    atrPct > 0.02
      ? 'VOL_EXPANSION'
      : atrPct < 0.006
        ? 'VOL_COMPRESSION'
        : Math.abs(momentum) > 0.01
          ? 'TREND'
          : 'RANGE';

  return {
    regime,
    trendBias,
    atrPct,
    momentum
  };
};
