type Kline = {
  open: string;
  high: string;
  low: string;
  close: string;
};

export const simpleMovingAverage = (values: number[], period: number): number | null => {
  if (values.length < period) {
    return null;
  }
  const slice = values.slice(-period);
  const sum = slice.reduce((total, value) => total + value, 0);
  return sum / period;
};

export const averageTrueRange = (klines: Kline[], period: number): number | null => {
  if (klines.length < period) {
    return null;
  }

  const ranges = klines.slice(-period).map((kline) => {
    const high = parseFloat(kline.high);
    const low = parseFloat(kline.low);
    return high - low;
  });

  const sum = ranges.reduce((total, value) => total + value, 0);
  return sum / period;
};

export const momentumScore = (values: number[]): number | null => {
  if (values.length < 2) {
    return null;
  }
  const first = values[0];
  const last = values[values.length - 1];
  if (first === 0) {
    return null;
  }
  return (last - first) / first;
};
