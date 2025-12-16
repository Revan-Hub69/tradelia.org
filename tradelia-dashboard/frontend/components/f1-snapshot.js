export function initF1(ws, MODE) {
  const container = document.getElementById("f1-container");

  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (!msg.snapshot) return;

    const cardId = `f1-${msg.exchange}-${msg.symbol}`;
    let card = document.getElementById(cardId);
    if (!card) {
      card = document.createElement("div");
      card.id = cardId;
      card.className = "card";
      container.appendChild(card);
    }

    card.innerHTML = `
      <h2>${msg.symbol} (${msg.exchange})</h2>
      <p>Direction: <span class="direction">${msg.direction}</span></p>
      <p>Confidence: ${msg.confidence.toFixed(2)}</p>
      <p>Bids top5: ${msg.bids.slice(0,5).map(b=>b.join('@')).join(', ')}</p>
      <p>Asks top5: ${msg.asks.slice(0,5).map(a=>a.join('@')).join(', ')}</p>
    `;

    const dirEl = card.querySelector(".direction");
    dirEl.style.color = msg.direction === "LONG" ? "green" :
                        msg.direction === "SHORT" ? "red" : "gray";
  });
}
