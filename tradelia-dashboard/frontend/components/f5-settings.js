export function initF5(ws, MODE){
  const container=document.getElementById("f5-container");
  container.innerHTML=`
    <h3>Settings</h3>
    <p>Mode: <span id="mode-label">${MODE.toUpperCase()}</span></p>
  `;
}
