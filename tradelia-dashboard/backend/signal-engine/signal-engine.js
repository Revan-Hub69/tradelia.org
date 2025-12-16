import Redis from 'ioredis';

const redis = new Redis(); // persistenza in-memory

export function generateSignal(snapshot){
  const { bids, asks } = snapshot;

  const bidVol = bids.reduce((s,[p,q])=>s+q,0);
  const askVol = asks.reduce((s,[p,q])=>s+q,0);
  const imbalance = (bidVol-askVol)/(bidVol+askVol);

  let direction = 'NEUTRAL';
  if(imbalance>0.15) direction='LONG';
  if(imbalance<-0.15) direction='SHORT';

  const signal = { ...snapshot, direction, confidence: Math.abs(imbalance) };
  redis.set(`signal:${snapshot.symbol}`, JSON.stringify(signal));
  return signal;
}
