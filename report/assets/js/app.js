// Bootstrap minimal: legge manifest e popola solo il modulo Header
const q = new URLSearchParams(location.search);
const id = q.get('id') || 'sample-id';
const base = `./reports/${id}`;


async function getJSON(path){
const r = await fetch(path, { cache:'no-store' });
if(!r.ok) throw new Error('HTTP '+r.status+' '+path);
return r.json();
}


(async function(){
// carica modulo header
const headerMod = await import('./modules/header.js');
const slot = document.getElementById('header-ticker');
headerMod.mount(slot);


// manifest → header.json
let manifest;
try{ manifest = await getJSON(`${base}/manifest.json`); }
catch(e){ console.warn('Manifest mancante, uso header.json di default'); }


const headerSrc = manifest?.modules?.find(m=>m.name==='header')?.src || 'header.json';
try{
const headerData = await getJSON(`${base}/${headerSrc}`);
headerMod.update(headerData);
}catch(e){ console.error('header.json non trovato', e); }


if(window.lucide) lucide.createIcons();
})();
