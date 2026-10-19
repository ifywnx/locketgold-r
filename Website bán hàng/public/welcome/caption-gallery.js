'use strict';
(async function(){
  const $ = id => document.getElementById(id);
  const grid=$('caption-grid'), search=$('caption-search'), select=$('caption-category');
  const more=$('caption-more'), motion=$('caption-motion'), quick=$('caption-quick');
  const count=$('caption-count'), marquee=$('caption-marquee');
  if(!grid || !search || !select) return;
  let rows=[], limit=18, paused=matchMedia('(prefers-reduced-motion: reduce)').matches, active='';
  const featured=[
    ['Tất cả',''],['🍂 Holiday','🎨 Holiday Caption'],
    ['🥂 Premium','🥂 Tiếng Việt Premium · Sang & tinh tế'],
    ['🧸 Teencode','🧸 Teencode · Chê yêu'],
    ['🔥 Trend','🔥 Trend TikTok & Threads'],
    ['🤡 Meme','🤡 Meme & Câu cửa miệng']
  ];
  const make=(tag,classes,text)=>{const el=document.createElement(tag);if(classes)el.className=classes;if(text!==undefined)el.textContent=text;return el};
  const gradient=x=>'linear-gradient(180deg,'+x.colors.join(',')+')';
  function matching(){
    const q=search.value.trim().toLocaleLowerCase('vi');
    return rows.filter(x=>(!active || x.group===active) && (!q || (x.text+' '+x.group+' '+(x.icon||'')).toLocaleLowerCase('vi').includes(q)));
  }
  function renderFilters(){
    quick.replaceChildren();
    for(const [label,group] of featured){
      const btn=make('button','quick-chip'+(active===group?' active':''),label);
      btn.type='button';btn.setAttribute('aria-pressed',String(active===group));
      btn.onclick=()=>{active=group;select.value=group;limit=18;renderFilters();draw()};
      quick.append(btn);
    }
  }
  function pill(x,cls){
    const el=make('span',cls);
    el.style.backgroundImage=gradient(x);el.style.color=x.ink;
    if(x.icon){const i=make('span','caption-icon',x.icon);i.setAttribute('aria-hidden','true');el.append(i)}
    el.append(make('span','caption-text',x.text));
    return el;
  }
  async function copyCaption(text,el){
    try{
      await navigator.clipboard.writeText(text);
      el.classList.add('copied');
      el.setAttribute('aria-label','Đã sao chép: '+text);
      const mark=el.querySelector('.copy-hint');
      if(mark)mark.textContent='✓ Đã sao chép';
      setTimeout(()=>{if(!el.isConnected)return;el.classList.remove('copied');el.setAttribute('aria-label','Sao chép caption: '+text);if(mark)mark.textContent='⧉ Sao chép';},1700);
    }catch{count.textContent='Không thể sao chép tự động. Hãy chọn và sao chép câu chữ.'}
  }
  function draw(){
    const found=matching();
    const fragment=document.createDocumentFragment();
    for(const [i,x] of found.slice(0,limit).entries()){
      const card=make('button','animated-caption caption-card');
      card.type='button';card.style.setProperty('--caption-color-start',x.colors[0]);card.style.setProperty('--caption-color-end',x.colors[x.colors.length-1]);card.setAttribute('aria-label','Sao chép caption: '+x.text);
      card.style.setProperty('--caption-delay',String(Math.min(i,17)*24)+'ms');
      card.title='Sao chép caption: '+x.text;
      const body=pill(x,'caption-inner');
      const hint=make('span','copy-hint','⧉ Sao chép');
      card.append(body,hint);card.onclick=()=>copyCaption(x.text,card);
      fragment.append(card);
    }
    grid.replaceChildren(fragment);
    const visible=Math.min(limit,found.length);
    count.textContent=found.length?'Đang hiển thị '+visible+' / '+found.length+' caption':'Chưa có caption phù hợp. Thử chủ đề khác nhé.';
    more.hidden=limit>=found.length;
  }
  function renderMarquee(){
    marquee.replaceChildren();
    const picks=rows.filter((_,i)=>i%11===0).slice(0,36);
    for(let lane=0;lane<3;lane++){
      const windowEl=make('div','caption-lane'),track=make('div','caption-track'+(lane===1?' reverse':''));
      for(let repeat=0;repeat<2;repeat++){
        const group=make('div','caption-run');
        for(const item of picks.slice(lane*12,(lane+1)*12))group.append(pill(item,'marquee-pill'));
        track.append(group);
      }
      windowEl.append(track);marquee.append(windowEl);
    }
    marquee.classList.toggle('motion-paused',paused);
    grid.classList.toggle('motion-paused',paused);
    motion.textContent=paused?'Bật hiệu ứng':'Tạm dừng hiệu ứng';
    motion.setAttribute('aria-pressed',String(!paused));
  }
  search.addEventListener('input',()=>{limit=18;draw()});
  select.addEventListener('change',()=>{active=select.value;limit=18;renderFilters();draw()});
  more.addEventListener('click',()=>{limit+=24;draw()});
  motion.addEventListener('click',()=>{paused=!paused;renderMarquee()});
  try{
    const response=await fetch('caption-data.json',{cache:'no-cache'});
    if(!response.ok)throw Error('response');
    rows=await response.json();
    if(!Array.isArray(rows))throw Error('catalog');
    const groups=[...new Set(rows.map(x=>x.group))];
    for(const group of groups){const opt=make('option','',group);opt.value=group;select.append(opt)}
    renderFilters();renderMarquee();draw();
  }catch{
    count.textContent='Không tải được caption. Vui lòng tải lại trang để thử lại.';
    more.hidden=true;motion.disabled=true;
  }
})();