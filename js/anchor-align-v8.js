/* V8: cada título de seção é alinhado logo abaixo do cabeçalho, sem duplo offset. */
(() => {
  'use strict';
  const header = () => document.getElementById('siteHeader');
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const contentTarget = (section) => {
    if (!section || section.id === 'inicio') return section;
    return section.querySelector('.section-head') || section.querySelector('.contato-card') || section;
  };
  const go = (hash, smooth=false) => {
    if (!hash || !hash.startsWith('#')) return;
    let id;
    try { id=decodeURIComponent(hash.slice(1)); } catch (_) { return; }
    const section=document.getElementById(id);
    if (!section) return;
    const anchor=contentTarget(section);
    const offset=(header()?.getBoundingClientRect().height || 76) + 18;
    const absoluteY=section.id==='inicio' ? 0 : Math.max(0,window.scrollY+anchor.getBoundingClientRect().top-offset);
    window.scrollTo({top:absoluteY,behavior:smooth && !reduced() ? 'smooth' : 'instant'});
  };
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if(!link || link.classList.contains('skip-link') || event.defaultPrevented ||
      event.button!==0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const hash=link.getAttribute('href');
    if(!hash || !document.getElementById(hash.slice(1))) return;
    event.preventDefault();
    if(window.location.hash!==hash)window.history.pushState(null,'',hash);
    window.requestAnimationFrame(()=>go(hash,true));
  });
  const syncHash=()=>window.requestAnimationFrame(()=>go(window.location.hash,false));
  window.addEventListener('popstate',syncHash);
  window.addEventListener('hashchange',syncHash);
  window.addEventListener('load',syncHash,{once:true});
})();
