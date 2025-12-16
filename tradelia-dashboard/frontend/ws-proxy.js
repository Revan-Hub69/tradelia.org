export function connectWS() {
  const ws = new WebSocket("ws://localhost:8080"); // WS proxy server
  ws.onopen = () => console.log("WS connected to proxy");
  ws.onclose = () => setTimeout(() => connectWS(), 2000);
  ws.onerror = (err) => console.error("WS error:", err);
  return ws;
}
