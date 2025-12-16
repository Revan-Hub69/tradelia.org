import WebSocket, { WebSocketServer } from 'ws';
import fetch from 'node-fetch';

const wss = new WebSocketServer({ port: 8080 });
console.log("WS Proxy Server running on ws://localhost:8080");

const exchanges = ['binance','bybit','okx'];

// Mantieni connessioni WS verso exchange pubbliche
const wsConnections = {};

async function connectExchange(exchange){
  let url;
  switch(exchange){
    case 'binance': url='wss://stream.binance.com:9443/ws/btcusdt@depth5@100ms'; break;
    case 'bybit': url='wss://stream.bybit.com/realtime'; break;
    case 'okx': url='wss://ws.okx.com:8443/ws/v5/public'; break;
  }

  const ws = new WebSocket(url);
  ws.on('open',()=>console.log(`${exchange} WS connected`));
  ws.on('message',(msg)=>broadcast(msg));
  ws.on('close',()=>setTimeout(()=>connectExchange(exchange),2000));
  ws.on('error',err=>console.error(`${exchange} WS error`,err));
  wsConnections[exchange]=ws;
}

function broadcast(msg){
  let data;
  try { data=JSON.parse(msg); } catch(e){ return; }
  wss.clients.forEach(client=>{
    if(client.readyState===WebSocket.OPEN) client.send(JSON.stringify(data));
  });
}

exchanges.forEach(connectExchange);

wss.on('connection',(client)=>{
  console.log('Client connected to WS Proxy');
});
