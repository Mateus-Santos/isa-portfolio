(()=>{
  'use strict';
  const init=()=>{
    const viewport=document.getElementById('galleryViewport');
    const slides=[...document.querySelectorAll('[data-gallery-slide]')];
    const thumbs=[...document.querySelectorAll('[data-gallery-thumb]')];
    const counter=document.getElementById('galleryCounter');
    const prev=document.getElementById('galleryPrev');
    const next=document.getElementById('galleryNext');
    if (!viewport || slides.length===0 || thumbs.length!==slides.length) return;
    const motion=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    let active=0, frame=0;
    const update=(index)=>{
      active=Math.max(0,Math.min(index,slides.length-1));
      if(counter) counter.textContent=`${active+1} de ${slides.length}`;
      thumbs.forEach((button,i)=>{
        const selected=i===active;
        button.classList.toggle('is-active',selected);
        button.setAttribute('aria-pressed',String(selected));
      });
    };
    const go=(index)=>{
      const chosen=Math.max(0,Math.min(index,slides.length-1));
      update(chosen);
      viewport.scrollTo({left:chosen*viewport.clientWidth,behavior:motion});
    };
    thumbs.forEach((button,i)=>button.addEventListener('click',()=>go(i)));
    if(prev)prev.addEventListener('click',()=>go((active+slides.length-1)%slides.length));
    if(next)next.addEventListener('click',()=>go((active+1)%slides.length));
    viewport.addEventListener('keydown',e=>{
      if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
        e.preventDefault();go(active+(e.key==='ArrowLeft'?-1:1));
      }
    });
    viewport.addEventListener('scroll',()=>{
      if(frame) return;
      frame=window.requestAnimationFrame(()=>{
        frame=0;
        if(viewport.clientWidth>0){
          update(Math.round(viewport.scrollLeft/viewport.clientWidth));
        }
      });
    },{passive:true});
    update(0);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
