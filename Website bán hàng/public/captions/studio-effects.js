'use strict';
(() => {
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const live=document.getElementById('live'), search=document.getElementById('search');
  if(!live)return;
  const progress=document.createElement('div');
  progress.setAttribute('aria-hidden','true');
  progress.style.cssText='position:fixed;top:0;left:0;height:3px;width:0;z-index:110;background:linear-gradient(90deg,#f3b867,#ed91ae,#a181f5);pointer-events:none;box-shadow:0 0 16px #c79de5';
  document.body.append(progress);
  let raf=0;
  const scroll=()=>{
    if(raf)return;
    raf=requestAnimationFrame(()=>{
      const h=Math.max(1,document.documentElement.scrollHeight-innerHeight);
      progress.style.width=Math.max(0,Math.min(100,scrollY/h*100))+'%';
      raf=0;
    });
  };
  addEventListener('scroll',scroll,{passive:true});
  addEventListener('resize',scroll,{passive:true});scroll();
  if(!reduce.matches && fine.matches){
    live.addEventListener('pointermove',e=>{
      const r=live.getBoundingClientRect();
      const x=((e.clientX-r.left)/r.width-.5)*7;
      const y=(.5-(e.clientY-r.top)/r.height)*5;
      live.style.transform='perspective(800px) rotateX('+y.toFixed(1)+'deg) rotateY('+x.toFixed(1)+'deg)';
    },{passive:true});
    live.addEventListener('pointerleave',()=>live.style.transform='');
  }
  document.addEventListener('keydown',e=>{
    const tag=document.activeElement?.tagName;
    if(e.key==='/' && !e.ctrlKey && !e.metaKey && tag!=='INPUT' && tag!=='TEXTAREA' && tag!=='SELECT'){
      e.preventDefault();search?.focus();
    }
    if(e.key==='Escape' && document.activeElement===search){
      search.value='';search.dispatchEvent(new Event('input'));search.blur();
    }
  });
})();