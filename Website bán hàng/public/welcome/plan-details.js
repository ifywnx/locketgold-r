'use strict';
(() => {
  const dialog=document.getElementById('plan-dialog');
  if(!dialog)return;
  const byId=id=>document.getElementById(id);
  const catalog=window.AN_STORE_VERSION_CATALOG;
  if(!catalog?.versions)return;
  const facts=Object.fromEntries(catalog.versions.map(v=>[v.planId,{
    eyebrow:'GÓI '+v.shortName+' · '+v.tier.toLocaleUpperCase('vi'),
    name:v.name,
    price:new Intl.NumberFormat('vi-VN').format(v.priceVnd)+'đ',
    summary:v.summary,
    features:v.features,
    note:v.notice,
    hasSamples:true
  }]));
  // Legacy: keep historic Plus order details, never confuse them with V3.
  facts.plus={
      eyebrow:'GÓI V2 + TÀI KHOẢN TẢI SHADOWROCKET',
      name:'Locket V2 + Shadowrocket',
      price:'129.000đ',
      summary:'Toàn bộ gói V2 89k, không phải phiên bản Locket thứ ba. Khoản chênh lệch là phần tài khoản và hướng dẫn tải Shadowrocket.',
      features:[
        'Nhận cùng bộ V2 như gói 89.000đ — nội dung, biểu tượng, màu sắc và cấu hình giống nhau.',
        'Được cấp thông tin tài khoản phục vụ tải Shadowrocket theo quy trình hỗ trợ.',
        'Kèm hướng dẫn đăng nhập/đăng xuất trong “Phương tiện & Mục mua” để giữ tài khoản iCloud cá nhân.',
        'Không có bộ caption hoặc chức năng bổ sung vượt gói V2 89k.'
      ],
      note:'Tài khoản tải ứng dụng là phần hỗ trợ thêm, không phải phiên bản Shadowrocket khác hay một gói Locket nâng cấp riêng. Khả năng cấp tài khoản phụ thuộc cấu hình dịch vụ.',
      hasSamples:true
    };
  let active='standard', lastTrigger=null;
  let libraryRows=[], visibleLimit=36, libraryLoading=0;
  const cached = new Map();
  const safeText=(node,value)=>{node.textContent=value;return node};
  const $=id=>byId(id);

  function versionFor(plan){return catalog.versions.find(v=>v.planId===plan)||catalog.versions.find(v=>v.id==='v2')}
  function datasetFor(version){return versionFor(version).id}
  function dataFor(which){
    if(!cached.has(which)){
      const url=catalog.versions.find(v=>v.id===which)?.captionFile;
      if(!url)throw Error('Không tìm thấy dữ liệu phiên bản');
      cached.set(which,fetch(url,{cache:'no-cache'})
        .then(response=>{if(!response.ok)throw Error('Không tải được dữ liệu');return response.json()})
        .then(data=>{
          if(!Array.isArray(data))throw Error('Dữ liệu caption không hợp lệ');
          return data.filter(item=>typeof item.text==='string'&&typeof item.group==='string'&&
            Array.isArray(item.colors)&&item.colors.length>=2&&typeof item.ink==='string');
        })
        .catch(error=>{cached.delete(which);throw error})
      );
    }
    return cached.get(which);
  }
  const groupLabel=name=>({
    '🔥 Trend TikTok & Threads':'Xu hướng TikTok và Threads',
    '🤡 Meme & Câu cửa miệng':'Hài hước và câu cửa miệng',
    '🧠 Vô tri & Brainrot':'Những câu vô tri vui nhộn',
    '🌙 Mood & Chữa lành':'Tâm trạng và chữa lành',
    '🥂 Tiếng Việt Premium · Sang & tinh tế':'Tiếng Việt sang và tinh tế',
    '🍃 Tiếng Việt Premium · Văn thơ':'Tiếng Việt văn thơ',
    '🪄 Tiếng Việt Premium · Hài có duyên':'Tiếng Việt hài có duyên',
    '🧸 Teencode · Chê yêu':'Ngôn ngữ tuổi teen',
    '✨ Aura · Slay & Flex':'Cá tính và nổi bật',
    '🌐 English Slang & Internet':'Tiếng lóng và mạng xã hội',
    '🎨 Holiday Caption':'Theo mùa và ngày lễ'
  })[name]||String(name||'').replace(/^[^\p{L}\p{N}]+/u,'');
  function norm(value){
    return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLocaleLowerCase('vi').replace(/đ/g,'d');
  }
  function filtered(){
    const q=norm($('plan-caption-search').value.trim());
    const category=$('plan-caption-category').value;
    return libraryRows.filter(item=>(!category||item.group===category)&&
      (!q||norm([item.text,item.icon,item.group].join(' ')).includes(q)));
  }
  // Match the user-supplied V15 HTML preview: a complete, passive Locket pill.
  function createTile(item){
    const pill=document.createElement('div');
    pill.className='plan-caption-pill';
    pill.style.background='linear-gradient(180deg,'+item.colors.join(',')+')';
    pill.style.color=item.ink;
    pill.title=item.colors.join(' → ');
    if(item.icon){
      const icon=document.createElement('span');
      icon.className='plan-caption-icon';
      icon.textContent=item.icon;
      icon.setAttribute('aria-hidden','true');
      pill.append(icon);
    }
    const label=document.createElement('span');
    label.className='plan-caption-text';
    label.textContent=item.text;
    pill.append(label);
    return pill;
  }
  function drawLibrary(){
    const matching=filtered();
    const displayed=matching.slice(0,visibleLimit);
    const grid=$('plan-caption-grid'),fragment=document.createDocumentFragment();
    let currentGroup=null,groupName='';
    for(const item of displayed){
      if(groupName!==item.group){
        const section=document.createElement('section');
        section.className='plan-caption-group';
        const heading=document.createElement('h4');
        heading.textContent=groupLabel(item.group);
        const pills=document.createElement('div');
        pills.className='plan-caption-pills';
        section.append(heading,pills);
        fragment.append(section);
        currentGroup=pills;
        groupName=item.group;
      }
      currentGroup.append(createTile(item));
    }
    if(!matching.length){
      const empty=document.createElement('p');
      empty.className='library-empty';
      empty.textContent='Chưa tìm thấy caption phù hợp. Hãy thử từ khóa hoặc chủ đề khác.';
      fragment.append(empty);
    }
    grid.replaceChildren(fragment);
    const total=matching.length;
    $('plan-caption-count').textContent='Đang hiển thị '+displayed.length+' / '+total+' caption';
    $('plan-caption-more').hidden=displayed.length>=total;
  }
  function resetLibraryFilters(){
    $('plan-caption-search').value='';
    $('plan-caption-category').replaceChildren(new Option('Tất cả chủ đề',''));
    visibleLimit=36;
  }
  async function renderLibraryFor(version){
    const request=++libraryLoading;
    const dataset=datasetFor(version);
    resetLibraryFilters();
    libraryRows=[];
    $('plan-caption-grid').replaceChildren();
    $('plan-caption-count').textContent='Đang tải thư viện caption…';
    $('plan-caption-more').hidden=true;
    const selected=versionFor(version);
    $('plan-caption-title').textContent='Thư viện caption '+selected.shortName;
    $('plan-caption-description').textContent=selected.summary+' '+selected.dynamicOverlayCount+' kiểu động chỉ là khai báo trong mã, chưa chứng thực trong ứng dụng.';
    $('plan-caption-total').textContent=selected.shortName+' · '+selected.captionCount+' caption';
    try{
      const data=await dataFor(dataset);
      if(request!==libraryLoading || active!==version)return;
      libraryRows=data;
      const uniqueGroups=[...new Set(data.map(item=>item.group))];
      const select=$('plan-caption-category');
      for(const group of uniqueGroups)select.add(new Option(groupLabel(group),group));
      $('plan-caption-total').textContent=selected.shortName+' · '+data.length+' caption tĩnh';
      drawLibrary();
    }catch{
      if(request!==libraryLoading || active!==version)return;
      $('plan-caption-grid').replaceChildren();
      $('plan-caption-count').textContent='Không tải được thư viện caption. Hãy đóng chi tiết và mở lại để thử.';
    }
  }

  $('plan-caption-search').addEventListener('input',()=>{visibleLimit=36;drawLibrary();$('plan-caption-grid').scrollTop=0})
  $('plan-caption-category').addEventListener('change',()=>{visibleLimit=36;drawLibrary();$('plan-caption-grid').scrollTop=0})
  $('plan-caption-more').addEventListener('click',()=>{visibleLimit+=36;drawLibrary();const grid=$('plan-caption-grid');grid.scrollTo({top:grid.scrollHeight,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});
  $('plan-library-jump').addEventListener('click',()=>{
    const scrollable=$('plan-samples');
    scrollable.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  });
  function openDetails(version,trigger){
    if(!facts[version])return;
    active=version;lastTrigger=trigger;
    const details=facts[version];
    safeText(byId('plan-dialog-kicker'),details.eyebrow);
    safeText(byId('plan-dialog-title'),details.name);
    safeText(byId('plan-dialog-subtitle'),details.summary);
    safeText(byId('plan-dialog-price'),details.price==='Chưa công bố'?details.price:details.price+' / gói');
    safeText(byId('plan-dialog-note'),details.note);
    const list=byId('plan-dialog-features');
    list.replaceChildren();
    details.features.forEach(s=>{
      const li=document.createElement('li');
      li.textContent=s;
      list.append(li);
    });
    const pick=byId('plan-dialog-pick');
    const card=document.querySelector('.plan[data-plan="'+version+'"]');
    pick.disabled=!!card?.disabled;
    pick.textContent=pick.disabled?'Đơn đã tạo · Không thể đổi gói':'Chọn '+details.name+' →';
    void renderLibraryFor(version);
    if(typeof dialog.showModal==='function')dialog.showModal();
    else dialog.setAttribute('open','');
    dialog.scrollTop=0;
  }
  document.querySelectorAll('[data-detail]').forEach(button=>{
    button.addEventListener('click',()=>openDetails(button.dataset.detail,button));
  });
  function close(){
    if(typeof dialog.close==='function')dialog.close();
    else dialog.removeAttribute('open');
    lastTrigger?.focus({preventScroll:true});
  }
  byId('plan-dialog-close').addEventListener('click',close);
  // Only the mobile grip starts a dismiss gesture; list scrolling stays native.
  const sheetGrip=byId('mobile-sheet-handle');
  if(sheetGrip){
    let startY=null;
    sheetGrip.addEventListener('touchstart',e=>{
      if(e.touches.length===1)startY=e.touches[0].clientY;
    },{passive:true});
    sheetGrip.addEventListener('touchend',e=>{
      if(startY===null||!e.changedTouches.length)return;
      const distance=e.changedTouches[0].clientY-startY;
      startY=null;
      if(distance>65&&matchMedia('(max-width:700px)').matches)close();
    },{passive:true});
    sheetGrip.addEventListener('touchcancel',()=>{startY=null},{passive:true});
  }

  dialog.addEventListener('click',event=>{
    const rect=dialog.getBoundingClientRect();
    const outside=event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom;
    if(outside)close();
  });
  byId('plan-dialog-pick').addEventListener('click',()=>{
    const card=document.querySelector('.plan[data-plan="'+active+'"]');
    if(!card||card.disabled)return;
    card.click();
    close();
    document.querySelector('.checkoutbar')?.scrollIntoView({
      behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'
    });
  });
})();