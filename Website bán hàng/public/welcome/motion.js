'use strict';
(() => {
  const root=document.documentElement;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');
  const progress=document.getElementById('scroll-progress');
  let frame=0;

  // Passive scroll progress: no layout changes to checkout or activation.
  const onScroll=()=>{
    if(frame)return;
    frame=requestAnimationFrame(()=>{
      const max=Math.max(0,root.scrollHeight-window.innerHeight);
      root.style.setProperty('--scroll-progress',max?((scrollY/max)*100).toFixed(2)+'%':'0%');
      frame=0;
    });
  };
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  onScroll();

  // Opt in to gentle reveal only when observers are supported.
  if(!reduced.matches && 'IntersectionObserver' in window){
    const targets=[...document.querySelectorAll('.hero > div:first-child,.heroart,.featurebar,.caption-gallery,.plans,.checkoutbar,.workspace')];
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },{threshold:.1,rootMargin:'0px 0px -25px 0px'});
    targets.forEach(el=>{el.setAttribute('data-reveal','');observer.observe(el)});
    requestAnimationFrame(()=>root.classList.add('motion-ready'));
  }

  if(!reduced.matches && finePointer.matches){
    const art=document.querySelector('[data-tilt]');
    if(art){
      art.addEventListener('pointermove',event=>{
        const r=art.getBoundingClientRect();
        const x=(event.clientX-r.left)/r.width-.5;
        const y=(event.clientY-r.top)/r.height-.5;
        art.style.setProperty('--tilt-x',(-y*9).toFixed(2)+'deg');
        art.style.setProperty('--tilt-y',(x*11).toFixed(2)+'deg');
      },{passive:true});
      art.addEventListener('pointerleave',()=>{
        art.style.setProperty('--tilt-x','0deg');
        art.style.setProperty('--tilt-y','0deg');
      });
    }
    // Subtle dimensional hover on offers; selections remain handled in app.js.
    document.querySelectorAll('.plan').forEach(card=>{
      card.addEventListener('pointermove',e=>{
        const r=card.getBoundingClientRect();
        const pointerX=(e.clientX-r.left)/r.width;
        const pointerY=(e.clientY-r.top)/r.height;
        card.style.setProperty('--tilt-x',((.5-pointerY)*3).toFixed(2)+'deg');
        card.style.setProperty('--tilt-y',((pointerX-.5)*3).toFixed(2)+'deg');
        card.style.setProperty('--glow-x',(pointerX*100).toFixed(1)+'%');
        card.style.setProperty('--glow-y',(pointerY*100).toFixed(1)+'%');
      },{passive:true});
      card.addEventListener('pointerleave',()=>{
        card.style.setProperty('--tilt-x','0deg');
        card.style.setProperty('--tilt-y','0deg');
      });
    });
  }
})();