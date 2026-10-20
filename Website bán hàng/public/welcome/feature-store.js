'use strict';
(() => {
  const root=document.getElementById('feature-store');
  const dialog=document.getElementById('an-store-dialog');
  if(!root||!dialog)return;
  const $=id=>document.getElementById(id);
  const labels={
    trend:'Xu hướng & Meme',genz:'Gen Z & Slang',reaction:'Cà khịa & Phản ứng',
    love:'Tình cảm & Chữa lành',premium:'Tiếng Việt tinh tế',
    holiday:'Mùa lễ & Kỷ niệm',daily:'Sinh viên & Đời thường'
  };
  const groupLabel=s=>String(s||'').replace(/^[^\p{L}\p{N}]+/u,'').replace(/ · An sáng tác$/u,'');
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
  const isColor=s=>typeof s==='string'&&/^#[a-f0-9]{6}([a-f0-9]{2})?$/i.test(s);
  const entries={};let current='trend',shown=9,trigger=null,loading=null,rotate=0;
  function sourceValid(item){return typeof item?.text==='string'&&typeof item.group==='string'&&Array.isArray(item.colors)&&item.colors.length>=2&&item.colors.every(isColor)&&isColor(item.ink);}
  function load(){
    if(!loading)loading=fetch('/store/catalog.json',{cache:'no-cache'}).then(res=>{
      if(!res.ok)throw Error('Chưa tải được bộ caption');return res.json();
    }).then(data=>{
      if(data.format!=='an-store-preview-v2'||!data.packs)throw Error('Định dạng thư viện không hợp lệ');
      for(const [sku,p] of Object.entries(data.packs)){
        if(!Object.hasOwn(labels,sku)||!Array.isArray(p.samples)||!Number.isInteger(p.count))continue;
        entries[sku]={samples:p.samples.filter(sourceValid),count:p.count};
      }
      return entries;
    }).catch(error=>{loading=null;throw error});
    return loading;
  }
  function pill(item){
    const el=document.createElement('span');
    el.className='an-store-pill';
    el.style.backgroundImage='linear-gradient(180deg,'+item.colors.join(',')+')';
    el.style.color=item.ink;
    if(item.icon){const emoji=document.createElement('span');emoji.textContent=item.icon;emoji.setAttribute('aria-hidden','true');el.append(emoji);}
    const text=document.createElement('span');text.textContent=item.text;el.append(text);
    return el;
  }
  function populateCards(){
    for(const sku of Object.keys(labels)){
      const data=entries[sku];if(!data)continue;
      const count=root.querySelector('[data-store-count="'+sku+'"]');
      if(count)count.textContent=data.count+' câu';
      const preview=root.querySelector('[data-store-sample="'+sku+'"]');
      if(!preview)continue;
      const out=document.createDocumentFragment();
      for(const item of data.samples.slice(0,3))out.append(pill(item));
      preview.replaceChildren(out);
    }
  }
  function renderStage(){
    const place=$('an-brand-preview');if(!place)return;
    const keys=['genz','love','premium','trend','daily','holiday','reaction'];
    const frag=document.createDocumentFragment();
    for(let i=0;i<3;i++){
      const sku=keys[(i+rotate)%keys.length],data=entries[sku];
      if(!data||!data.samples.length)continue;
      const pillItem=data.samples[(rotate+i*3)%data.samples.length];
      const row=document.createElement('div');row.className='an-brand-sample';
      row.append(pill(pillItem));
      frag.append(row);
    }
    place.replaceChildren(frag);
  }
  function render(){
    const data=entries[current];if(!data)return;
    const q=normalize($('an-store-search').value.trim());
    const filtered=q?data.samples.filter(item=>normalize([item.text,item.icon,groupLabel(item.group)].join(' ')).includes(q)):data.samples;
    const shownItems=filtered.slice(0,shown);
    const out=document.createDocumentFragment();let previous='';
    for(const item of shownItems){
      if(item.group!==previous){const heading=document.createElement('h4');heading.className='an-store-group-heading';heading.textContent=groupLabel(item.group);out.append(heading);previous=item.group;}
      out.append(pill(item));
    }
    if(!shownItems.length){const p=document.createElement('p');p.className='an-store-empty';p.textContent='Không có mẫu phù hợp. Bạn thử từ khóa khác nhé.';out.append(p);}
    $('an-store-gallery').replaceChildren(out);
    $('an-store-showing').textContent='Đang xem '+shownItems.length+' / '+data.count+' câu của bộ (mẫu chọn lọc)';
    $('an-store-more').hidden=shown>=filtered.length;
  }
  function openPack(sku,button){
    if(!entries[sku])return;
    current=sku;shown=9;trigger=button;
    $('an-store-dialog-title').textContent=labels[sku];
    $('an-store-search').value='';
    $('an-store-dialog-subtitle').textContent=entries[sku].count+' câu trong bộ. Đây là các mẫu chọn lọc để xem nội dung và màu trước khi chọn.';
    render();
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  }
  function closePack(){
    if(dialog.open&&typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');
    trigger?.focus({preventScroll:true});
  }
  root.querySelectorAll('[data-store-filter]').forEach(tab=>tab.addEventListener('click',()=>{
    const filter=tab.dataset.storeFilter;
    root.querySelectorAll('[data-store-filter]').forEach(t=>{const active=t===tab;t.classList.toggle('is-active',active);t.setAttribute('aria-pressed',String(active));});
    root.querySelectorAll('[data-store-type]').forEach(card=>{card.hidden=filter==='caption'?card.dataset.storeType!=='caption':card.dataset.storeType==='caption';});
  }));
  root.querySelectorAll('[data-store-preview]').forEach(button=>button.addEventListener('click',async()=>{
    try{await load();openPack(button.dataset.storePreview,button)}
    catch{const count=root.querySelector('[data-store-count="'+button.dataset.storePreview+'"]');if(count)count.textContent='Chưa tải được dữ liệu';}
  }));
  $('an-store-search').addEventListener('input',()=>{shown=9;render()});
  $('an-store-more').addEventListener('click',()=>{shown+=9;render()});
  $('an-store-dialog-close').addEventListener('click',closePack);
  dialog.addEventListener('click',event=>{const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closePack();});
  $('an-preview-next')?.addEventListener('click',()=>{rotate=(rotate+1)%7;renderStage()});
  void load().then(()=>{populateCards();renderStage()}).catch(()=>{for(const sku of Object.keys(labels)){const count=root.querySelector('[data-store-count="'+sku+'"]');if(count)count.textContent='Chưa tải được mẫu';}});
})();
