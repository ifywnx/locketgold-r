'use strict';
/**
 * Sales-facing UX for An Store. Uses audited catalog as the only product source.
 * Deliberately does NOT create leads, orders or payments. The provider contact
 * channel is still unpublished; buyers must not be told a purchase succeeded.
 */
(() => {
  const data=window.AN_STORE_VERSION_CATALOG;
  if(!data||data.paymentStatus!=='disabled'||!Array.isArray(data.versions))return;
  const byId=new Map(data.versions.map(v=>[v.id,v]));
  const byPlan=new Map(data.versions.map(v=>[v.planId,v]));
  const get=id=>document.getElementById(id);
  const format=n=>new Intl.NumberFormat('vi-VN').format(n)+'đ';
  const status=get('sales-share-status');
  let current=data.versions[0];
  let shareState='';

  const linkFor=v=>{
    const link=new URL('/welcome/index.html',window.location.origin);
    link.searchParams.set('goi',v.id);
    link.hash='packages';
    return link.href;
  };
  const syncDisplay=()=>{
    const selected=document.querySelector('.plan.selected[data-plan]');
    current=byPlan.get(selected?.dataset.plan)||current;
    const mobile=get('sales-quick-summary');
    if(mobile)mobile.textContent=current.shortName+' · '+format(current.priceVnd);
  };
  const message=txt=>{
    status.textContent=txt;
    shareState=txt;
  };
  const copy=async(text,success)=>{
    try{
      await navigator.clipboard.writeText(text);
      message(success);
    }catch{
      message('Trình duyệt không cho sao chép tự động. Bạn có thể chọn và sao chép liên kết ngay trong thanh địa chỉ.');
    }
  };
  const preview=get('share-plan'),info=get('copy-plan-info');
  if(!preview||!info)return;

  preview.onclick=()=>{
    syncDisplay();
    return copy(linkFor(current),'Đã sao chép liên kết '+current.shortName+'.');
  };
  info.onclick=()=>{
    syncDisplay();
    const content=[
      'An Store — thông tin gói '+current.shortName,
      'Tên: '+current.name,
      'Giá niêm yết: '+format(current.priceVnd),
      'Thư viện: '+current.captionCount+' caption tĩnh · '+current.groupCount+' nhóm',
      'Trạng thái: chưa nhận đơn mới, chưa mở thanh toán.',
      'Mã nguồn có bộ cấu hình; tính tương thích Locket/iOS chưa được xác nhận trên thiết bị.',
      'Liên kết tham khảo: '+linkFor(current)
    ].join('\n');
    return copy(content,'Đã sao chép thông tin '+current.shortName+' (không phải xác nhận đặt hàng).');
  };

  // A chosen version is addressable. Only accept literal IDs from the catalog.
  const param=new URLSearchParams(location.search).get('goi');
  if(param&&byId.has(param))window.AnStoreSelectPlan?.(byId.get(param).planId);
  syncDisplay();
  const quick=document.createElement('div');
  quick.className='sales-mobile-quick';
  quick.setAttribute('aria-label','Lối tắt xem bảng giá');
  const quickTitle=document.createElement('div');
  const eyebrow=document.createElement('small');eyebrow.textContent='GÓI ĐANG XEM';
  const summary=document.createElement('strong');summary.id='sales-quick-summary';
  summary.textContent=current.shortName+' · '+format(current.priceVnd);
  quickTitle.append(eyebrow,summary);
  const action=document.createElement('a');
  action.href='#packages';action.textContent='Xem bảng giá';
  quick.append(quickTitle,action);
  document.body.append(quick);

  const applySelection=()=>{
    syncDisplay();
    // Preserve other search params (including campaign tags) without appending
    // tracking parameters; keep URL canonical and shareable on explicit choice.
    const u=new URL(location.href);
    u.searchParams.set('goi',current.id);
    history.replaceState(history.state,'',u.pathname+u.search+u.hash);
    if(shareState)message('');
  };
  window.addEventListener('an-store-plan-change',applySelection);

  // If session changes via history navigation, prefer URL choice.
  window.addEventListener('popstate',()=>{
    const id=new URLSearchParams(location.search).get('goi');
    if(byId.has(id))window.AnStoreSelectPlan?.(byId.get(id).planId);
  });
})();