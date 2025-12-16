import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
console.log("WS Proxy Server running on ws://localhost:8080");

const exchanges = ['binance','bybit','okx'];
const symbols = ['BTCUSDT','ETHUSDT','SOLUSDT']; // aggiungi tutti i simboli che vuoi

const wsConnections = {};

function createExchangeStream(exchange, symbol){
  let url;
  switch(exchange){
    case 'binance': url=`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth@100ms`; break;
    case 'bybit': url=`wss://stream.bybit.com/realtime?subscribe=orderBookL2_25.${symbol}`; break;
    case 'okx': url=`wss://ws.okx.com:8443/ws/v5/public?channel=books5:${symbol}`; break;
  }

  const ws = new WebSocket(url);
  ws.on('open',()=>console.log(`${exchange} WS connected for ${symbol}`));
  ws.on('message',(msg)=>broadcast({exchange,symbol,data:msg}));
  ws.on('close',()=>setTimeout(()=>createExchangeStream(exchange,symbol),2000));
  ws.on('error',err=>console.error(`${exchange} WS error for ${symbol}`,err));

  wsConnections[`${exchange}-${symbol}`] = ws;
}

function broadcast(message){
  let data;
  try { data = JSON.parse(message.data||message); } catch(e){ return; }
  wss.clients.forEach(client=>{
    if(client.readyState===WebSocket.OPEN) client.send(JSON.stringify({...message, parsed:data}));
  });
}

exchanges.forEach(exchange=>{
  symbols.forEach(symbol=>{
    createExchangeStream(exchange,symbol);
  });
});

wss.on('connection', client=>{
  console.log('Client connected to WS Proxy');
});
