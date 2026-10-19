'use strict';
(() => {
  const root=document.getElementById('feature-store');
  const dialog=document.getElementById('an-store-dialog');
  if(!root||!dialog)return;
  const $=id=>document.getElementById(id);
  // Keep catalog groups anchored to the GitHub source; do not manufacture captions.
  const packs={
    trend:{name:'Trend & Meme',groups:['🔥 Trend TikTok & Threads','🤡 Meme & Câu cửa miệng','🧠 Vô tri & Brainrot']},
    love:{name:'Love & Mood',groups:['💘 Tình cảm & Thả thính','🌙 Mood & Chữa lành']},
    premium:{name:'Vietnamese Premium',groups:['🥂 Tiếng Việt Premium · Sang & tinh tế','🍃 Tiếng Việt Premium · Văn thơ','🪄 Tiếng Việt Premium · Hài có duyên']},
    genz:{name:'Gen Z & Slay',groups:['🧸 Teencode · Chê yêu','✨ Aura · Slay & Flex','🌐 English Slang & Internet']},
    holiday:{name:'Holiday Collection',groups:['🎨 Holiday Caption']}
  };
  let all=[],selected='trend',shown=28,lastTrigger=null,loading=null;
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
  const colorsValid=colors=>Array.isArray(colors)&&colors.length>=2&&colors.every(c=>/^#[a-f0-9]{6}([a-f0-9]{2})?$/i.test(c));

  async function getCatalog(){
    if(!loading){
      loading=fetch('caption-data.json',{cache:'no-cache'}).then(res=>{
        if(!res.ok)throw Error('Không thể tải thư viện');
        return res.json();
      }).then(entries=>{
        if(!Array.isArray(entries))throw Error('Dữ liệu caption không hợp lệ');
        all=entries.filter(x=>typeof x.text==='string'&&typeof x.group==='string'&&
          typeof x.ink==='string'&&/^#[a-f0-9]{6}([a-f0-9]{2})?$/i.test(x.ink)&&colorsValid(x.colors));
        return all;
      }).catch(error=>{loading=null;throw error});
    }
    return loading;
  }
  const members=key=>all.filter(item=>packs[key].groups.includes(item.group));
  function pill(item){
    const el=document.createElement('span');
    el.className='an-store-pill';
    el.style.backgroundImage='linear-gradient(180deg,'+item.colors.join(',')+')';
    el.style.color=item.ink;
    if(item.icon){
      const icon=document.createElement('span');
      icon.textContent=item.icon;
      icon.setAttribute('aria-hidden','true');
      el.append(icon);
    }
    const content=document.createElement('span');
    content.textContent=item.text;
    el.append(content);
    return el;
  }
  function populateCards(){
    for(const key of Object.keys(packs)){
      const count=$('feature-store').querySelector('[data-store-count="'+key+'"]');
      const preview=$('feature-store').querySelector('[data-store-sample="'+key+'"]');
      const items=members(key);
      if(count)count.textContent=items.length+' caption';
      if(!preview)continue;
      const fragment=document.createDocumentFragment();
      const seen=new Set();
      for(const entry of items){
        if(!entry.text||seen.has(entry.group))continue;
        fragment.append(pill(entry));
        seen.add(entry.group);
        if(seen.size===3)break;
      }
      preview.replaceChildren(fragment);
    }
  }
  function render(){
    const items=members(selected);
    const q=normalize($('an-store-search').value.trim());
    const matching=q?items.filter(item=>normalize([item.text,item.icon,item.group].join(' ')).includes(q)):items;
    const subset=matching.slice(0,shown);
    const frame=document.createDocumentFragment();
    let previousGroup='';
    for(const item of subset){
      if(item.group!==previousGroup){
        const h=document.createElement('h4');
        h.className='an-store-group-heading';
        h.textContent=item.group;
        frame.append(h);
        previousGroup=item.group;
      }
      frame.append(pill(item));
    }
    if(!subset.length){
      const empty=document.createElement('p');
      empty.className='an-store-empty';
      empty.textContent='Không có caption phù hợp với từ khóa.';
      frame.append(empty);
    }
    $('an-store-gallery').replaceChildren(frame);
    $('an-store-showing').textContent='Đang xem '+subset.length+' / '+matching.length+' caption';
    $('an-store-more').hidden=shown>=matching.length;
  }
  function showPack(key,button){
    if(!packs[key])return;
    selected=key;shown=28;lastTrigger=button;
    $('an-store-dialog-title').textContent=packs[key].name;
    $('an-store-search').value='';
    $('an-store-dialog-subtitle').textContent='Bộ xem trước theo màu gốc GitHub · Không có giá bán hoặc cấp module ở giai đoạn này.';
    render();
    if(typeof dialog.showModal==='function')dialog.showModal();
    else dialog.setAttribute('open','');
  }
  function hidePack(){
    if(dialog.open&&typeof dialog.close==='function')dialog.close();
    else dialog.removeAttribute('open');
    lastTrigger?.focus({preventScroll:true});
  }
  root.querySelectorAll('[data-store-filter]').forEach(button=>{
    button.addEventListener('click',()=>{
      const category=button.dataset.storeFilter;
      root.querySelectorAll('[data-store-filter]').forEach(tab=>{
        const active=tab===button;
        tab.classList.toggle('is-active',active);
        tab.setAttribute('aria-pressed',String(active));
      });
      root.querySelectorAll('[data-store-type]').forEach(card=>{
        card.hidden=category!=='all'&&card.dataset.storeType!==category;
      });
    });
  });
  root.querySelectorAll('[data-store-preview]').forEach(button=>{
    button.addEventListener('click',async()=>{
      try{
        await getCatalog();
        showPack(button.dataset.storePreview,button);
      }catch{
        const target=root.querySelector('[data-store-count="'+button.dataset.storePreview+'"]');
        if(target)target.textContent='Tải dữ liệu thất bại';
      }
    });
  });
  $('an-store-search').addEventListener('input',()=>{shown=28;render()});
  $('an-store-more').addEventListener('click',()=>{
    shown+=28;render();
  });
  $('an-store-dialog-close').addEventListener('click',hidePack);
  dialog.addEventListener('click',event=>{
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)hidePack();
  });
  void getCatalog().then(populateCards).catch(()=>{
    for(const key of Object.keys(packs)){
      const el=root.querySelector('[data-store-count="'+key+'"]');
      if(el)el.textContent='Chưa tải được dữ liệu';
    }
  });
})();
