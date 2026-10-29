'use strict';
(() => {
  const $=id=>document.getElementById(id);
  const phone=$('an-v5-device');
  const capsule=$('phone-caption');
  const label=$('phone-caption-text');
  const icon=$('phone-caption-icon');
  const group=$('phone-group');
  const status=$('phone-preview-status');
  if(!phone||!capsule||!label||!icon||!status)return;

  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const buttons={v1:$('preview-v1'),v2:$('preview-v2'),v3:$('preview-v3')};
  const panes={camera:$('phone-camera-scene'),send:$('phone-send-scene')};
  const sources={v1:'v1-caption-data.json',v2:'v2-caption-data.json',v3:'caption-data.json'};
  const cache=new Map();
  let version='v3',scene='send',items=[],index=0,sequence=0;

  function setScene(next){
    if(!panes[next])return;
    scene=next;
    for(const [key,pane] of Object.entries(panes))pane.hidden=key!==scene;
    const view=$('phone-camera-view');
    if(view){
      view.querySelector('span').textContent=scene==='camera'?'Xem caption':'Camera';
      view.setAttribute('aria-label',scene==='camera'?'Xem màn hình gửi và caption':'Chuyển sang màn hình camera');
    }
  }

  function formatItem(item){
    label.textContent=item.text;
    icon.textContent=item.icon||'';
    icon.hidden=!item.icon;
    capsule.style.backgroundImage='linear-gradient(180deg,'+item.colors.join(',')+')';
    capsule.style.color=item.ink;
    if(group)group.textContent=item.group.replace(/^[^\p{L}\p{N}]+/u,'');
    status.textContent=String(index+1).padStart(2,'0')+' / '+items.length;
    if(!reduce.matches){
      capsule.classList.remove('is-swapping');
      // Restart the small caption-only transition without repositioning any screen elements.
      void capsule.offsetWidth;
      capsule.classList.add('is-swapping');
    }
  }

  async function captions(which){
    if(!cache.has(which)){
      const promise=fetch(sources[which],{cache:'no-cache'}).then(response=>{
        if(!response.ok)throw Error('Không tải được dữ liệu');
        return response.json();
      }).then(data=>{
        if(!Array.isArray(data))throw Error('Dữ liệu không hợp lệ');
        const valid=data.filter(item=>typeof item.text==='string'&&item.text.length>0&&item.text.length<=41&&
          typeof item.group==='string'&&typeof item.ink==='string'&&
          Array.isArray(item.colors)&&item.colors.length>=2&&item.colors.every(c=>/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(c)));
        // Trend is used as a relevant storefront preview, not as a replacement for the full library.
        const trend=which==='v3'?valid.filter(item=>item.group==='🔥 Trend TikTok & Threads'):[];
        const result=trend.length?trend:valid;
        if(!result.length)throw Error('Không có caption xem trước');
        return result;
      }).catch(err=>{cache.delete(which);throw err});
      cache.set(which,promise);
    }
    return cache.get(which);
  }

  async function selectVersion(which){
    if(!sources[which])return;
    version=which;index=0;
    const current=++sequence;
    for(const [key,button] of Object.entries(buttons)){
      if(!button)continue;
      const active=which===key;
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-pressed',String(active));
    }
    status.textContent='Đang tải…';
    try{
      const list=await captions(which);
      if(current!==sequence)return;
      items=list;
      formatItem(items[0]);
    }catch{
      if(current!==sequence)return;
      items=[];
      status.textContent='Chưa tải được';
      label.textContent='Hãy thử lại';
      icon.hidden=true;
      if(group)group.textContent='Không tải được caption mẫu';
    }
  }

  function step(direction){
    if(!items.length)return;
    if(scene!=='send')setScene('send');
    index=(index+direction+items.length)%items.length;
    formatItem(items[index]);
  }

  buttons.v1?.addEventListener('click',()=>selectVersion('v1'));
  buttons.v2?.addEventListener('click',()=>selectVersion('v2'));
  buttons.v3?.addEventListener('click',()=>selectVersion('v3'));
  $('phone-prev')?.addEventListener('click',()=>step(-1));
  $('phone-next')?.addEventListener('click',()=>step(1));
  $('phone-camera-view')?.addEventListener('click',()=>setScene(scene==='camera'?'send':'camera'));
  $('phone-shutter')?.addEventListener('click',()=>setScene('send'));
  $('phone-back-camera')?.addEventListener('click',()=>setScene('camera'));
  $('phone-send-demo')?.addEventListener('click',()=>{
    status.textContent='Chỉ là mô phỏng';
    status.setAttribute('aria-live','polite');
  });

  let touch=null;
  phone.addEventListener('touchstart',event=>{
    if(event.touches.length!==1)return;
    touch={x:event.touches[0].clientX,y:event.touches[0].clientY};
  },{passive:true});
  phone.addEventListener('touchend',event=>{
    if(!touch||event.changedTouches.length!==1)return;
    const dx=event.changedTouches[0].clientX-touch.x;
    const dy=event.changedTouches[0].clientY-touch.y;
    if(Math.abs(dx)>58&&Math.abs(dx)>Math.abs(dy)*1.5)step(dx<0?1:-1);
    touch=null;
  },{passive:true});
  phone.addEventListener('touchcancel',()=>{touch=null},{passive:true});

  setScene('send');
  void selectVersion('v3');
})();
