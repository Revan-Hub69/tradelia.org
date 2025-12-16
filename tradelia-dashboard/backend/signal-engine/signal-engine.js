import Redis from 'ioredis';
const redis = new Redis();

export function generateSignal(snapshot){
  const { bids, asks } = snapshot.parsed || snapshot;

  if(!bids || !asks || bids.length===0 || asks.length===0) return null;

  // L2 Aggregation fino a top 50 livelli
  const topBids = bids.slice(0,50);
  const topAsks = asks.slice(0,50);

  const bidVol = topBids.reduce((s,[p,q])=>s+q,0);
  const askVol = topAsks.reduce((s,[p,q])=>s+q,0);
  const imbalance = (bidVol-askVol)/(bidVol+askVol);

  const support = Math.min(...topBids.map(b=>b[0]));
  const resistance = Math.max(...topAsks.map(a=>a[0]));

  let direction = 'NEUTRAL';
  if(imbalance>0.12) direction='LONG';
  if(imbalance<-0.12) direction='SHORT';

  const signal = {
    symbol: snapshot.symbol,
    exchange: snapshot.exchange,
    direction,
    confidence: Math.abs(imbalance),
    support, resistance,
    timestamp: Date.now()
  };

  redis.set(`signal:${snapshot.symbol}`, JSON.stringify(signal));
  return signal;
}
