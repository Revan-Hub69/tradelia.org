export function initF3(ws, MODE) {
  const container = document.getElementById("f3-container");

  ws.addEventListener("message", (event)=>{
    const msg = JSON.parse(event.data);
    if(!msg.snapshot) return;

    const cardId = `f3-${msg.exchange}-${msg.symbol}`;
    let card = document.getElementById(cardId);
    if(!card){
      card = document.createElement("div");
      card.id = cardId;
      card.className="card";
      container.appendChild(card);
    }

    const bids = msg.bids.slice(0,10).map(b=>b[0]);
    const asks = msg.asks.slice(0,10).map(a=>a[0]);
    const support = Math.min(...bids).toFixed(2);
    const resistance = Math.max(...asks).toFixed(2);

    card.innerHTML=`
      <h3>${msg.symbol} (${msg.exchange})</h3>
      <p>Support: ${support}</p>
      <p>Resistance: ${resistance}</p>
    `;
  });
}
