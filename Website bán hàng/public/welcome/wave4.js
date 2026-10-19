'use strict';
(() => {
  const byId=id=>document.getElementById(id);
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=window.matchMedia('(max-width:700px)');

  // Mobile bar reads the existing selected plan; it does NOT create an order or payment.
  const bar=byId('mobile-package-bar');
  const selection=byId('selection');
  const plans=document.getElementById('packages');
  const hero=document.querySelector('.hero');
  const modal=byId('plan-dialog');
  if(!bar||!selection||!plans||!hero)return;
  let raf=0;
  function selectedKey(){
    return document.querySelector('.plan[data-plan][aria-pressed="true"]')?.dataset.plan||'standard';
  }
  function refreshLabel(){
    const key=selectedKey();
    const card=document.querySelector('.plan[data-plan="'+key+'"]');
    if(!card)return;
    byId('mobile-package-label').textContent=card.querySelector('h3')?.textContent||'Gói hiện tại';
    const strong=card.querySelector('strong');
    const price=strong?.firstChild?.textContent?.trim()||'';
    byId('mobile-package-price').textContent=price?price+'đ':'Xem bảng giá';
  }
  function updateSticky(){
    raf=0;
    const rect=plans.getBoundingClientRect();
    const heroRect=hero.getBoundingClientRect();
    const pricingVisible=rect.top<window.innerHeight*.75&&rect.bottom>70;
    // Historic Plus orders have no new-sale card: never show an incorrect V1 price.
    const hasVisibleSelection=!!document.querySelector('.plan.selected');
    const shouldShow=mobile.matches&&heroRect.bottom<38&&!pricingVisible&&!modal?.open&&hasVisibleSelection;
    bar.hidden=!shouldShow;
    document.body.classList.toggle('an-has-sticky',shouldShow);
  }
  function schedule(){
    if(raf)return;
    raf=requestAnimationFrame(updateSticky);
  }
  if(typeof MutationObserver!=='undefined'){
    new MutationObserver(()=>{refreshLabel();schedule()}).observe(selection,{childList:true,characterData:true,subtree:true});
    if(modal)new MutationObserver(schedule).observe(modal,{attributes:true,attributeFilter:['open']});
  }
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  if(mobile.addEventListener)mobile.addEventListener('change',schedule);
  byId('mobile-package-details').addEventListener('click',()=>{
    document.querySelector('.plan-more[data-detail="'+selectedKey()+'"]')?.click();
    schedule();
  });
  byId('mobile-package-select').addEventListener('click',()=>{
    plans.scrollIntoView({behavior:reduce.matches?'auto':'smooth',block:'start'});
  });
  refreshLabel();schedule();
})();
