'use strict';
(() => {
  const dialog=document.getElementById('plan-dialog');
  if(!dialog)return;
  const byId=id=>document.getElementById(id);
  const facts={
    standard:{
      eyebrow:'GÓI V1 · DÀNH CHO NGƯỜI ĐÃ CÓ SHADOWROCKET',
      name:'Locket V1',
      price:'49.000đ',
      summary:'Bộ cấu hình cơ bản V1 trong repository. Phù hợp nếu bạn đã có ứng dụng Shadowrocket và muốn bắt đầu từ bản đơn giản.',
      features:[
        'Bản cấu hình Locket V1, sử dụng logic riêng của nhánh V1.',
        'Module và các script của V1; DNS cũ và hướng dẫn từng bước.',
        'Có hỗ trợ các thành phần caption của bản V1, nhưng không phải kho caption Full Icon/V15 của V2.',
        'Không kèm tài khoản tải Shadowrocket — bạn cần có ứng dụng sẵn.'
      ],
      note:'Lưu ý: Bộ V1 và V2 dùng nguồn cấu hình khác nhau; giao diện web không chứng minh mọi tính năng đều hoạt động trên mọi phiên bản Locket.',
      hasSamples:false
    },
    v2:{
      eyebrow:'GÓI V2 · BẢN V15 FULL ICON',
      name:'Locket V2',
      price:'89.000đ',
      summary:'Dành cho người đã có Shadowrocket và muốn bộ V2 với nhiều kiểu caption, icon và màu sắc hơn V1.',
      features:[
        'Bộ cấu hình V2 nguồn V15 trong GitHub, cùng module và hướng dẫn cài đặt.',
        'Bộ caption mở rộng theo nhiều chủ đề, Full Icon và gradient; có caption nhóm Trend.',
        'Bộ thiết lập khung widget và thông số video 30 giây theo mô tả module V2 (cần kiểm thử thực tế).',
        'Không kèm tài khoản tải Shadowrocket — bạn cần có ứng dụng sẵn.'
      ],
      note:'Các caption bên dưới là ví dụ minh hoạ từ dữ liệu trang web. Cách hiện và tính tương thích trong Locket phụ thuộc ứng dụng và thiết bị.',
      hasSamples:true
    },
    plus:{
      eyebrow:'GÓI V2 + TÀI KHOẢN TẢI SHADOWROCKET',
      name:'Locket V2 + Shadowrocket',
      price:'129.000đ',
      summary:'Toàn bộ gói V2 89k, không phải phiên bản Locket thứ ba. Khoản chênh lệch là phần tài khoản và hướng dẫn tải Shadowrocket.',
      features:[
        'Nhận ĐÚNG bộ V2 như gói 89.000đ — cùng caption, icon, gradient và cấu hình.',
        'Được cấp thông tin tài khoản phục vụ tải Shadowrocket theo quy trình hỗ trợ.',
        'Kèm hướng dẫn đăng nhập/đăng xuất trong “Phương tiện & Mục mua” để giữ tài khoản iCloud cá nhân.',
        'Không có kho caption hoặc chức năng Locket riêng vượt gói V2 89k.'
      ],
      note:'Tài khoản tải ứng dụng là phần hỗ trợ thêm, không phải phiên bản Shadowrocket khác hay một gói Locket nâng cấp riêng. Khả năng cấp tài khoản phụ thuộc cấu hình dịch vụ.',
      hasSamples:true
    }
  };
  let active='standard',lastTrigger=null,trendPromise=null;
  const safeText=(node,text)=>{node.textContent=text;return node};
  function loadTrend(){
    if(!trendPromise)trendPromise=fetch('caption-data.json',{cache:'no-cache'})
      .then(r=>{if(!r.ok)throw Error();return r.json()})
      .then(rows=>rows.filter(x=>x.group==='🔥 Trend TikTok & Threads').slice(0,8));
    return trendPromise;
  }
  async function samplesFor(version){
    const wrap=byId('plan-samples'),grid=byId('plan-sample-grid');
    if(!facts[version].hasSamples){wrap.hidden=true;grid.replaceChildren();return}
    wrap.hidden=false;
    grid.replaceChildren();
    safeText(grid,'Đang tải mẫu caption…');
    try{
      const examples=await loadTrend();
      if(active!==version)return;
      grid.replaceChildren();
      examples.forEach(item=>{
        const pill=document.createElement('span');
        pill.className='detail-caption-pill';
        pill.style.backgroundImage='linear-gradient(180deg,'+item.colors.join(',')+')';
        pill.style.color=item.ink;
        pill.textContent=[item.icon,item.text].filter(Boolean).join(' ');
        grid.append(pill);
      });
    }catch{
      safeText(grid,'Không tải được mẫu caption. Quyền lợi gói vẫn hiển thị bên trên.');
      trendPromise=null;
    }
  }
  function openDetails(version,trigger){
    if(!facts[version])return;
    active=version;lastTrigger=trigger;
    const details=facts[version];
    safeText(byId('plan-dialog-kicker'),details.eyebrow);
    safeText(byId('plan-dialog-title'),details.name);
    safeText(byId('plan-dialog-subtitle'),details.summary);
    safeText(byId('plan-dialog-price'),details.price+' / gói');
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
    void samplesFor(version);
    if(typeof dialog.showModal==='function')dialog.showModal();
    else dialog.setAttribute('open','');
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