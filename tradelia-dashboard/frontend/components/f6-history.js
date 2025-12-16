export function initF6(ws, MODE){
  const container=document.getElementById("f6-container");
  const history={};

  ws.addEventListener("message",(event)=>{
    const msg=JSON.parse(event.data);
    if(!msg.signal) return;

    if(!history[msg.symbol]) history[msg.symbol]=[];
    history[msg.symbol].push({direction:msg.direction, timestamp:msg.timestamp});
    if(history[msg.symbol].length>50) history[msg.symbol].shift();

    let card=document.getElementById(`f6-${msg.symbol}`);
    if(!card){
      card=document.createElement("div");
      card.id=`f6-${msg.symbol}`;
      card.className="card";
      container.appendChild(card);
    }

    card.innerHTML=`
      <h3>${msg.symbol} History</h3>
      <p>${history[msg.symbol].map(s=>s.direction).join(' | ')}</p>
    `;
  });
}
