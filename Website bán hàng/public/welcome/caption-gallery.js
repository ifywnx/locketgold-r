'use strict';
(async () => {
  const marquee=document.getElementById('caption-marquee');
  const motion=document.getElementById('caption-motion');
  const status=document.getElementById('trend-status');
  if(!marquee||!motion||!status)return;

  const prefersLess=window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused=prefersLess.matches;
  const groupName='🔥 Trend TikTok & Threads';

  function setMotion() {
    marquee.classList.toggle('motion-paused',paused);
    motion.setAttribute('aria-pressed',String(!paused));
    motion.textContent=paused?'▶ Tiếp tục chạy':'❚❚ Tạm dừng';
  }
  motion.addEventListener('click',()=>{paused=!paused;setMotion()});

  function makeCaption(item){
    const capsule=document.createElement('span');
    capsule.className='marquee-pill';
    capsule.style.backgroundImage='linear-gradient(180deg,'+item.colors.join(',')+')';
    capsule.style.color=item.ink;
    if(item.icon){
      const icon=document.createElement('span');
      icon.className='caption-icon';
      icon.textContent=item.icon;
      icon.setAttribute('aria-hidden','true');
      capsule.append(icon);
    }
    const words=document.createElement('span');
    words.className='caption-text';
    words.textContent=item.text;
    capsule.append(words);
    return capsule;
  }

  try {
    const res=await fetch('caption-data.json',{cache:'no-cache'});
    if(!res.ok)throw Error('Không tải được danh sách');
    const list=await res.json();
    if(!Array.isArray(list))throw Error('Dữ liệu không hợp lệ');
    const trend=list.filter(item=>item.group===groupName&&
      typeof item.text==='string'&&Array.isArray(item.colors)&&item.colors.length>=2&&
      typeof item.ink==='string');
    if(!trend.length)throw Error('Nhóm Trend đang trống');
    const fragment=document.createDocumentFragment();
    for(let lane=0;lane<3;lane++){
      const picked=trend.filter((_,index)=>index%3===lane);
      if(!picked.length)continue;
      const windowEl=document.createElement('div');
      windowEl.className='caption-lane';
      const track=document.createElement('div');
      track.className='caption-track'+(lane===1?' reverse':'');
      track.style.setProperty('--track-duration',(lane===1?105:lane===2?116:110)+'s');
      for(let repeat=0;repeat<2;repeat++){
        const run=document.createElement('div');
        run.className='caption-run';
        if(repeat===1)run.setAttribute('aria-hidden','true');
        for(const item of picked)run.append(makeCaption(item));
        track.append(run);
      }
      windowEl.append(track);
      fragment.append(windowEl);
    }
    marquee.replaceChildren(fragment);
    status.textContent=trend.length+' câu caption mẫu · Giữ nguyên chữ, biểu tượng và màu sắc.';
    setMotion();
  }catch(error){
    status.textContent='Chưa tải được caption mẫu. Bạn hãy tải lại trang nhé.';
    motion.disabled=true;
  }
})();