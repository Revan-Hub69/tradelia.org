import { initF1 } from './components/f1-snapshot.js';
import { initF2 } from './components/f2-order.js';
import { initF3 } from './components/f3-support.js';
import { initF4 } from './components/f4-summary.js';
import { initF5 } from './components/f5-settings.js';
import { initF6 } from './components/f6-history.js';
import { connectWS } from './ws-proxy.js';

const MODE = "demo"; // demo/live toggle
const ws = connectWS();

initF1(ws, MODE);
initF2(ws, MODE);
initF3(ws, MODE);
initF4(ws, MODE);
initF5(ws, MODE);
initF6(ws, MODE);
