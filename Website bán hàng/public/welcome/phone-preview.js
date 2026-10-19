'use strict';
(() => {
  const byId=id=>document.getElementById(id);
  const caption=byId('phone-caption'),label=byId('phone-caption-text'),
        icon=byId('phone-caption-icon'),group=byId('phone-group'),
        status=byId('phone-preview-status');
  if(!caption||!label||!icon||!status)return;
  const buttons={v1:byId('preview-v1'),v2:byId('preview-v2')};
  const frame=document.querySelector('[data-phone-tilt]');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  const cache=new Map();
  let version='v2', items=[], cursor=0, request=0, scene='send';
  const source={v1:'v1-caption-data.json',v2:'caption-data.json'};
  function valid(item){
    return typeof item.text==='string'&&typeof item.group==='string'&&
      typeof item.ink==='string'&&Array.isArray(item.colors)&&item.colors.length>=2;
  }
  function getCaptions(which){
    if(!cache.has(which)){
      cache.set(which,fetch(source[which],{cache:'no-cache'}).then(res=>{
        if(!res.ok)throw Error('HTTP '+res.status);
        return res.json();
      }).then(data=>{
        if(!Array.isArray(data))throw Error('Dữ liệu không hợp lệ');
        const rows=data.filter(valid);
        if(!rows.length)throw Error('Không có caption');
        const shortlist=which==='v2'
          ? rows.filter(item=>/Trend|Premium|Gen Z|Slang/i.test(item.group)&&item.text.length<=48)
          : rows.filter(item=>item.text.length<=45);
        return shortlist.length?shortlist:rows;
      }).catch(err=>{cache.delete(which);throw err}));
    }
    return cache.get(which);
  }
  function render(){
    if(!items.length)return;
    const item=items[((cursor%items.length)+items.length)%items.length];
    label.textContent=item.text;
    icon.textContent=item.icon||'';
    icon.hidden=!item.icon;
    caption.style.backgroundImage='linear-gradient(180deg,'+item.colors.join(',')+')';
    caption.style.color=item.ink;
    group.textContent=item.group;
    status.textContent=(version==='v1'?'V1':'V2')+' · '+(cursor+1)+' / '+items.length+' mẫu xem trước';
    if(!reduce.matches){
      caption.classList.remove('caption-switch');
      void caption.offsetWidth;
      caption.classList.add('caption-switch');
    }
  }
  async function setVersion(which){
    if(!source[which])return;
    version=which;cursor=0;
    const id=++request;
    for(const [key,button] of Object.entries(buttons)){
      button.classList.toggle('active',key===which);
      button.setAttribute('aria-pressed',String(key===which));
    }
    status.textContent='Đang tải mẫu '+which.toUpperCase()+'…';
    try{
      const rows=await getCaptions(which);
      if(id!==request)return;
      items=rows;
      render();
    }catch{
      if(id!==request)return;
      items=[];
      status.textContent='Không tải được mẫu, hãy thử lại.';
      label.textContent='Your little moments ✨';
      icon.textContent='♡';
      group.textContent='Bản minh hoạ';
    }
  }
  const scenes={camera:byId('phone-camera-scene'),send:byId('phone-send-scene')};
  const sceneButtons={camera:byId('phone-camera-view'),send:byId('phone-send-view')};
  function setScene(next){
    if(!scenes[next])return;
    scene=next;
    for(const [key,node] of Object.entries(scenes))node.hidden=key!==scene;
    for(const [key,button] of Object.entries(sceneButtons)){
      button.classList.toggle('active',key===scene);
      button.setAttribute('aria-pressed',String(key===scene));
    }
    frame?.setAttribute('aria-label',scene==='send'
      ?'Màn hình gửi ảnh minh hoạ với caption trên ảnh'
      :'Màn hình camera Locket minh hoạ');
  }
  sceneButtons.camera.addEventListener('click',()=>setScene('camera'));
  sceneButtons.send.addEventListener('click',()=>setScene('send'));
  byId('phone-shutter').addEventListener('click',()=>setScene('send'));
  byId('phone-back-camera').addEventListener('click',()=>setScene('camera'));
  byId('phone-send-demo').addEventListener('click',()=>{
    status.textContent='Chỉ là bản xem thử — không gửi ảnh thật.';
    status.setAttribute('aria-live','polite');
  });
  buttons.v1.addEventListener('click',()=>setVersion('v1'));
  buttons.v2.addEventListener('click',()=>setVersion('v2'));
  function step(direction){
    if(!items.length)return;
    if(scene==='camera')setScene('send');
    cursor=(cursor+direction+items.length)%items.length;
    render();
  }
  byId('phone-prev').addEventListener('click',()=>step(-1));
  byId('phone-next').addEventListener('click',()=>step(1));

  if(frame&&!reduce.matches&&finePointer.matches){
    frame.addEventListener('pointermove',event=>{
      const rect=frame.getBoundingClientRect();
      const x=(event.clientX-rect.left)/rect.width-.5;
      const y=(event.clientY-rect.top)/rect.height-.5;
      frame.style.setProperty('--preview-rotate-y',(x*11).toFixed(2)+'deg');
      frame.style.setProperty('--preview-rotate-x',(-y*8).toFixed(2)+'deg');
    },{passive:true});
    frame.addEventListener('pointerleave',()=>{
      frame.style.setProperty('--preview-rotate-y','0deg');
      frame.style.setProperty('--preview-rotate-x','0deg');
    });
  }
  let swipeStart=null;
  if(frame){
    frame.addEventListener('touchstart',e=>{
      if(e.touches.length===1)swipeStart={x:e.touches[0].clientX,y:e.touches[0].clientY};
    },{passive:true});
    frame.addEventListener('touchend',e=>{
      if(!swipeStart||!e.changedTouches.length)return;
      const dx=e.changedTouches[0].clientX-swipeStart.x;
      const dy=e.changedTouches[0].clientY-swipeStart.y;
      if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)step(dx<0?1:-1);
      swipeStart=null;
    },{passive:true});
  }
  setScene('send');
  void setVersion('v2');
})();