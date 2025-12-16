export function initF2(ws, MODE) {
  const container = document.getElementById("f2-container");

  window.placeOrder = (exchange, symbol, direction) => {
    if (!confirm(`Place ${direction} order on ${symbol} (${exchange})?`)) return;

    fetch(`/api/order`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({exchange, symbol, direction, mode: MODE})
    })
    .then(res=>res.json())
    .then(data=>alert(`Order response: ${JSON.stringify(data)}`))
    .catch(err=>console.error(err));
  };
}
