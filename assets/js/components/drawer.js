// /assets/js/components/drawer.js
export function initDrawerAPI(){
  const drawer=document.getElementById('mod-drawer');
  const panel=drawer.querySelector('aside');
  const isMobile=()=> window.matchMedia('(max-width: 640px)').matches;
  function openDrawer(){
    drawer.classList.remove('hidden');
    if(isMobile()) requestAnimationFrame(()=> panel.style.transform='translateY(0)');
    else requestAnimationFrame(()=> panel.style.transform='translateX(0)');
  }
  function closeDrawer(){
    if(isMobile()) panel.style.transform='translateY(100%)';
    else panel.style.transform='translateX(100%)';
    panel.addEventListener('transitionend', ()=> drawer.classList.add('hidden'), {once:true});
  }
  drawer.addEventListener('click', (e)=>{ if(e.target.dataset.close==='backdrop') closeDrawer(); });
  document.getElementById('drawer-close')?.addEventListener('click', closeDrawer);
  document.getElementById('drawer-print')?.addEventListener('click', ()=> window.print());

  window.Tradelia = window.Tradelia || {};
  Object.assign(window.Tradelia, { openDrawer, closeDrawer });
}
