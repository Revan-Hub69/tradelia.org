export function initF4(ws, MODE){
  const container = document.getElementById("f4-container");

  ws.addEventListener("message", (event)=>{
    const msg=JSON.parse(event.data);
    if(!msg.snapshot) return;

    let card=document.getElementById("f4-summary");
    if(!card){
      card=document.createElement("div");
      card.id="f4-summary";
      card.className="card";
      container.appendChild(card);
    }

    const bidVol = msg.bids.reduce((s,[p,q])=>s+q,0);
    const askVol = msg.asks.reduce((s,[p,q])=>s+q,0);
    const imbalance = ((bidVol-askVol)/(bidVol+askVol)).toFixed(2);

    card.innerHTML=`
      <h3>Multi-Exchange Summary</h3>
      <p>${msg.symbol} (${msg.exchange})</p>
      <p>Bid Vol: ${bidVol.toFixed(2)}, Ask Vol: ${askVol.toFixed(2)}</p>
      <p>Imbalance: ${imbalance}</p>
    `;
  });
}
