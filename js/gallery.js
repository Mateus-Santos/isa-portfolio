(()=>{
  'use strict';
  const AUTOPLAY_MS=5500;
  const init=()=>{
    const viewport=document.getElementById('galleryViewport');
    const section=document.getElementById('galeria');
    const thumbsHost=document.getElementById('galleryThumbs');
    const slides=[...document.querySelectorAll('[data-gallery-slide]')];
    const thumbs=[...document.querySelectorAll('[data-gallery-thumb]')];
    const counter=document.getElementById('galleryCounter');
    const prev=document.getElementById('galleryPrev');
    const next=document.getElementById('galleryNext');
    const toggle=document.getElementById('galleryAutoToggle');
    if(!viewport || !section || !toggle || slides.length===0 || thumbs.length!==slides.length) return;

    const reducedMotion=!!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const motion=reducedMotion?'auto':'smooth';
    let playing=!reducedMotion;
    let active=0, timer=null, frame=0;
    let hovering=false, hasFocus=false, touching=false, inView=true;
    const playIcon=toggle.querySelector('.io-gallery-play-icon');
    const playLabel=toggle.querySelector('.io-gallery-play-label');

    const update=(index)=>{
      active=Math.max(0,Math.min(index,slides.length-1));
      if(counter) counter.textContent=`${active+1} de ${slides.length}`;
      thumbs.forEach((button,i)=>{
        const selected=i===active;
        button.classList.toggle('is-active',selected);
        button.setAttribute('aria-pressed',String(selected));
      });
      if(thumbsHost){
        const chosen=thumbs[active];
        if(chosen && thumbsHost.scrollWidth>thumbsHost.clientWidth){
          const target=chosen.offsetLeft-thumbsHost.offsetLeft-(thumbsHost.clientWidth-chosen.offsetWidth)/2;
          thumbsHost.scrollTo({left:Math.max(0,target),behavior:motion});
        }
      }
    };
    const go=(index)=>{
      const chosen=(index+slides.length)%slides.length;
      update(chosen);
      viewport.scrollTo({left:chosen*viewport.clientWidth,behavior:motion});
    };

    const canRun=()=>playing && inView && !document.hidden && !hovering && !hasFocus && !touching && slides.length>1;
    const stop=()=>{if(timer!==null){window.clearInterval(timer);timer=null;}};
    const restart=()=>{
      stop();
      if(canRun()) timer=window.setInterval(()=>go((active+1)%slides.length),AUTOPLAY_MS);
    };
    const updateToggle=()=>{
      toggle.setAttribute('aria-pressed',String(playing));
      toggle.setAttribute('aria-label',playing?'Pausar reprodução automática':'Ativar reprodução automática');
      if(playLabel)playLabel.textContent=playing?'Pausar':'Reproduzir';
      if(playIcon)playIcon.textContent=playing?'❚❚':'▶';
      if(counter)counter.setAttribute('aria-live',playing?'off':'polite');
    };

    thumbs.forEach((button,i)=>button.addEventListener('click',()=>{go(i);restart();}));
    if(prev)prev.addEventListener('click',()=>{go(active-1);restart();});
    if(next)next.addEventListener('click',()=>{go(active+1);restart();});
    toggle.addEventListener('click',()=>{playing=!playing;updateToggle();restart();});
    viewport.addEventListener('keydown',e=>{
      if(e.key==='ArrowLeft'||e.key==='ArrowRight'){
        e.preventDefault();go(active+(e.key==='ArrowLeft'?-1:1));restart();
      }
    });
    viewport.addEventListener('scroll',()=>{
      if(frame) return;
      frame=window.requestAnimationFrame(()=>{
        frame=0;
        if(viewport.clientWidth>0)update(Math.round(viewport.scrollLeft/viewport.clientWidth));
      });
    },{passive:true});
    viewport.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){touching=true;restart();}});
    const finishTouch=()=>{if(touching){touching=false;restart();}};
    viewport.addEventListener('pointerup',finishTouch);
    viewport.addEventListener('pointercancel',finishTouch);
    section.addEventListener('mouseenter',()=>{hovering=true;restart();});
    section.addEventListener('mouseleave',()=>{hovering=false;restart();});
    section.addEventListener('focusin',()=>{hasFocus=true;restart();});
    section.addEventListener('focusout',()=>{window.setTimeout(()=>{hasFocus=section.contains(document.activeElement);restart();},0);});
    document.addEventListener('visibilitychange',restart);
    window.addEventListener('resize',()=>{viewport.scrollTo({left:active*viewport.clientWidth,behavior:'auto'});restart();},{passive:true});
    if('IntersectionObserver' in window){
      inView=false;
      const observer=new IntersectionObserver(entries=>{
        inView=entries.some(entry=>entry.isIntersecting);
        restart();
      },{threshold:0.15});
      observer.observe(section);
    }
    update(0);
    updateToggle();
    restart();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
