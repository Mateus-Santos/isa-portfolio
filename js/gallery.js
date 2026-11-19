/* ISA V7: um único relógio para autoplay e progresso circular. Sem pausa por hover/foco. */
(()=>{
  'use strict';
  const AUTOPLAY_MS=5500;
  const RADIUS=21;
  const CIRCUMFERENCE=2*Math.PI*RADIUS;

  const init=()=>{
    const viewport=document.getElementById('galleryViewport');
    const section=document.getElementById('galeria');
    const thumbHost=document.getElementById('galleryThumbs');
    const slides=[...document.querySelectorAll('[data-gallery-slide]')];
    const thumbs=[...document.querySelectorAll('[data-gallery-thumb]')];
    const counter=document.getElementById('galleryCounter');
    const prev=document.getElementById('galleryPrev');
    const next=document.getElementById('galleryNext');
    const toggle=document.getElementById('galleryAutoToggle');
    const ring=document.getElementById('galleryProgressCircle');
    if(!viewport || !section || !toggle || !ring || !slides.length || slides.length!==thumbs.length) return;

    const reducedMotion=!!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const behavior=reducedMotion?'instant':'smooth';
    let playing=!reducedMotion;
    let active=0;
    let elapsed=0;
    let lastFrameTime=null;
    let animationFrame=0;
    let scrollFrame=0;
    let programmaticTarget=null;

    ring.style.strokeDasharray=`${CIRCUMFERENCE}`;
    const drawProgress=()=>{
      const percent=Math.min(1,Math.max(0,elapsed/AUTOPLAY_MS));
      ring.style.strokeDashoffset=String(CIRCUMFERENCE*(1-percent));
    };
    const running=()=>playing && !document.hidden && slides.length>1;
    const updateToggle=()=>{
      const label=playing?'Pausar reprodução automática':'Ativar reprodução automática';
      toggle.setAttribute('aria-pressed',String(playing));
      toggle.setAttribute('aria-label',label);
      toggle.setAttribute('title',label);
      toggle.classList.toggle('is-paused',!playing);
      if(counter) counter.setAttribute('aria-live',playing?'off':'polite');
    };
    const updateSlide=()=>{
      if(counter) counter.textContent=`${active+1} de ${slides.length}`;
      slides.forEach((slide,i)=>{
        slide.setAttribute('aria-hidden',String(i!==active));
      });
      thumbs.forEach((button,i)=>{
        const selected=i===active;
        button.classList.toggle('is-active',selected);
        button.setAttribute('aria-pressed',String(selected));
      });
      const chosen=thumbs[active];
      if(thumbHost && chosen && thumbHost.scrollWidth>thumbHost.clientWidth){
        const target=chosen.offsetLeft-thumbHost.offsetLeft-(thumbHost.clientWidth-chosen.offsetWidth)/2;
        thumbHost.scrollTo({left:Math.max(0,target),behavior});
      }
    };
    const resetCycle=()=>{elapsed=0;lastFrameTime=null;drawProgress();};
    const go=(index,manual=true)=>{
      const chosen=(index+slides.length)%slides.length;
      active=chosen;
      programmaticTarget=chosen;
      updateSlide();
      resetCycle();
      // Evita deslocar rapidamente por todas as fotos na passagem de 7 para 1.
      const wrapping=(index>=slides.length || index<0);
      if(wrapping){
        viewport.style.scrollBehavior='auto';
        viewport.scrollTo({left:chosen*viewport.clientWidth,behavior:'instant'});
        viewport.style.scrollBehavior='';
        programmaticTarget=null;
      }else{
        viewport.scrollTo({left:chosen*viewport.clientWidth,behavior});
      }
    };
    const tick=(now)=>{
      animationFrame=0;
      if(!running()){lastFrameTime=null;return;}
      if(lastFrameTime!==null){
        // Evita saltos grandes se o navegador suspender frames temporariamente.
        const delta=Math.min(1000,Math.max(0,now-lastFrameTime));
        elapsed+=delta;
      }
      lastFrameTime=now;
      if(elapsed>=AUTOPLAY_MS) go(active+1,false);
      drawProgress();
      animationFrame=window.requestAnimationFrame(tick);
    };
    const syncAnimation=()=>{
      if(!running()){
        if(animationFrame){window.cancelAnimationFrame(animationFrame);animationFrame=0;}
        lastFrameTime=null;
      }else if(!animationFrame){
        lastFrameTime=null;
        animationFrame=window.requestAnimationFrame(tick);
      }
      drawProgress();
    };

    thumbs.forEach((button,i)=>button.addEventListener('click',()=>go(i)));
    if(prev) prev.addEventListener('click',()=>go(active-1));
    if(next) next.addEventListener('click',()=>go(active+1));
    toggle.addEventListener('click',()=>{
      playing=!playing;
      updateToggle();
      syncAnimation();
    });
    viewport.addEventListener('keydown',event=>{
      if(event.key==='ArrowLeft' || event.key==='ArrowRight'){
        event.preventDefault();
        go(active+(event.key==='ArrowLeft'?-1:1));
      }
    });
    viewport.addEventListener('pointerdown',()=>{programmaticTarget=null;});
    viewport.addEventListener('wheel',()=>{programmaticTarget=null;},{passive:true});
    viewport.addEventListener('scroll',()=>{
      if(scrollFrame) return;
      scrollFrame=window.requestAnimationFrame(()=>{
        scrollFrame=0;
        if(viewport.clientWidth<=0) return;
        const nearest=Math.max(0,Math.min(slides.length-1,Math.round(viewport.scrollLeft/viewport.clientWidth)));
        if(programmaticTarget!==null){
          if(Math.abs(viewport.scrollLeft-programmaticTarget*viewport.clientWidth)<2) programmaticTarget=null;
          return;
        }
        if(nearest!==active){active=nearest;updateSlide();resetCycle();}
      });
    },{passive:true});
    document.addEventListener('visibilitychange',syncAnimation);
    window.addEventListener('resize',()=>{
      programmaticTarget=active;
      viewport.style.scrollBehavior='auto';
      viewport.scrollTo({left:active*viewport.clientWidth,behavior:'instant'});
      viewport.style.scrollBehavior='';
      programmaticTarget=null;
    },{passive:true});

    updateSlide();
    updateToggle();
    drawProgress();
    syncAnimation();
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
