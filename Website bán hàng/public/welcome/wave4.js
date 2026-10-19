'use strict';
(() => {
  const byId=id=>document.getElementById(id);
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=window.matchMedia('(max-width:700px)');

  // V1 and V2 examples are read directly from the same preview data as the detail modal.
  const samples=[['v1','v1-caption-data.json'],['v2','caption-data.json']];
  function addPill(container,item){
    const pill=document.createElement('span');
    pill.className='an-compare-pill';
    pill.style.backgroundImage='linear-gradient(180deg,'+item.colors.join(',')+')';
    pill.style.color=item.ink;
    if(item.icon){
      const icon=document.createElement('span');
      icon.textContent=item.icon;
      icon.setAttribute('aria-hidden','true');
      pill.append(icon);
    }
    const words=document.createElement('span');
    words.textContent=item.text;
    pill.append(words);container.append(pill);
  }
  async function showSamples(version,url){
    const container=byId('compare-'+version+'-captions');
    if(!container)return;
    try{
      const response=await fetch(url,{cache:'no-cache'});
      if(!response.ok)throw Error('load');
      const entries=await response.json();
      if(!Array.isArray(entries))throw Error('data');
      const candidates=entries.filter(x=>typeof x.text==='string'&&x.text.length<=42&&Array.isArray(x.colors)&&x.colors.length>=2&&typeof x.ink==='string');
      const selected=[],seen=new Set();
      for(const item of candidates){
        if(seen.has(item.group))continue;
        selected.push(item);seen.add(item.group);
        if(selected.length===4)break;
      }
      container.replaceChildren();
      selected.forEach(item=>addPill(container,item));
    }catch{
      container.textContent='Chưa tải được mẫu caption. Hãy mở chi tiết gói để thử lại.';
    }
  }
  for(const [version,url] of samples)void showSamples(version,url);
  document.querySelectorAll('[data-compare-detail]').forEach(button=>{
    button.addEventListener('click',()=>{
      const key=button.dataset.compareDetail;
      document.querySelector('.plan-more[data-detail="'+key+'"]')?.click();
    });
  });

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
