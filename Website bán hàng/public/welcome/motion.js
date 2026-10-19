'use strict';
(() => {
  const root=document.documentElement;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');
  const progress=document.getElementById('scroll-progress');
  const stage=document.querySelector('.hero-stage');
  const ambientOrbs=[...document.querySelectorAll('.ambient-orb')];
  const mobile=window.matchMedia('(max-width:700px)');
  const backToTop=document.getElementById('back-to-top');
  let frame=0;

  // Passive scroll progress: no layout changes to checkout or activation.
  const onScroll=()=>{
    if(frame)return;
    frame=requestAnimationFrame(()=>{
      const max=Math.max(0,root.scrollHeight-window.innerHeight);
      root.style.setProperty('--scroll-progress',max?((scrollY/max)*100).toFixed(2)+'%':'0%');
      if(backToTop)backToTop.classList.toggle('is-visible',window.scrollY>450);
      if(!reduced.matches&&!mobile.matches){
        const distance=Math.min(760,Math.max(0,window.scrollY));
        if(stage)stage.style.setProperty('--hero-parallax',(distance*.04).toFixed(1)+'px');
        ambientOrbs.forEach((orb,i)=>{
          orb.style.setProperty('--orb-drift',(distance*(.025+(i*.012))).toFixed(1)+'px');
        });
      }
      frame=0;
    });
  };
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});
  onScroll();

  // Opt in to gentle reveal only when observers are supported.
  if(!reduced.matches && 'IntersectionObserver' in window){
    const targets=[...document.querySelectorAll('.hero-copy,.hero-stage,.an-demo-customizer,.featurebar,.an-compare-heading,.an-compare-panel,.experience-heading,.experience-tile,.caption-gallery,.plans,.checkoutbar,.how-it-works>.sectionhead,.step-card,.workspace')];
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },{threshold:.1,rootMargin:'0px 0px -25px 0px'});
    targets.forEach((el,index)=>{
      el.setAttribute('data-reveal','');
      if(el.classList.contains('experience-tile')||el.classList.contains('step-card')||el.classList.contains('an-compare-panel')){
        el.style.setProperty('--reveal-delay',((index%3)*85)+'ms');
      }
      observer.observe(el);
    });
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

  // Scroll-synced mini navigation: mirrors the actual sections, no fake state.
  if('IntersectionObserver' in window){
    const links=[...document.querySelectorAll('header nav a[href^="#"]')];
    const sections=['packages','compare','captions','faq','support','how-it-works'];
    const targets=sections.map(id=>document.getElementById(id)).filter(Boolean);
    const spy=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting)
        .sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
      if(!visible.length)return;
      const hash='#'+visible[0].target.id;
      links.forEach(a=>{
        const match=a.getAttribute('href')===hash;
        a.classList.toggle('active',match);
        if(match)a.setAttribute('aria-current','location');
        else a.removeAttribute('aria-current');
      });
    },{rootMargin:'-25% 0px -55% 0px',threshold:[0,.1,.3,.6]});
    targets.forEach(el=>spy.observe(el));
  }

  // Gently follow the cursor with a non-interactive ambient glow.
  if(!reduced.matches&&finePointer.matches){
    const glow=document.querySelector('.site-pointer-glow');
    if(glow){
      let px=-600,py=-600,frameId=0;
      window.addEventListener('pointermove',event=>{
        px=event.clientX-190;
        py=event.clientY-190;
        if(frameId)return;
        frameId=requestAnimationFrame(()=>{
          glow.style.transform='translate3d('+px+'px,'+py+'px,0)';
          glow.style.opacity='1';
          frameId=0;
        });
      },{passive:true});
      document.addEventListener('mouseleave',()=>{glow.style.opacity='0'});
    }
    // Magnetic movement only for the primary *link*, not payment controls.
    document.querySelectorAll('[data-magnetic]').forEach(link=>{
      link.addEventListener('pointermove',event=>{
        const rect=link.getBoundingClientRect();
        const x=((event.clientX-rect.left)/rect.width-.5)*9;
        const y=((event.clientY-rect.top)/rect.height-.5)*7;
        link.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0)';
      },{passive:true});
      link.addEventListener('pointerleave',()=>link.style.transform='');
      link.addEventListener('blur',()=>link.style.transform='');
    });
  }
  // Freeze the constantly scrolling caption strips while users read them.
  const marquee=document.getElementById('caption-marquee');
  if(marquee&&finePointer.matches){
    marquee.addEventListener('mouseenter',()=>marquee.classList.add('is-hovered'));
    marquee.addEventListener('mouseleave',()=>marquee.classList.remove('is-hovered'));
  }
})();
