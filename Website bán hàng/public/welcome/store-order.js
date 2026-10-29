'use strict';
(() => {
  const $=id=>document.getElementById(id);
  const id=Number(new URLSearchParams(location.search).get('order'));
  const token=localStorage.getItem('an-store-owner-v1');
  const money=n=>Number(n||0).toLocaleString('vi-VN')+'đ';
  const valid=Number.isSafeInteger(id)&&id>0&&/^[a-f0-9]{64}$/.test(token||'');
  const demoItems=(new URLSearchParams(location.search).get('items')||'').split(',').filter(Boolean);
  const demoPreview=new URLSearchParams(location.search).get('demo')==='1'&&demoItems.length>0;
  let mode=null,currentStatus=null,pollCount=0;
  $('order-id').textContent=valid?String(id):'Không hợp lệ';
  const report=(text,state='pending')=>{
    $('order-message').textContent=text;
    $('order-state').dataset.state=state;
  };
  if(demoPreview){
    $('order-id').textContent='XEM THỬ'; $('order-mode').textContent='Dùng thử · Không thu tiền'; $('order-date').textContent=new Date().toLocaleString('vi-VN'); $('order-total').textContent='0đ'; $('order-state').textContent='Đã mở bộ cài thử'; report('Các file mẫu đã sẵn sàng.','done');
    const area=$('an-order-downloads'),container=$('an-download-products'); area.hidden=false; container.replaceChildren();
    demoItems.forEach(sku=>{const section=document.createElement('div');section.className='an-download-product';const h=document.createElement('h3');h.textContent=sku;const links=document.createElement('div');links.className='an-download-links';[['sgmodule','Cài module'],['conf','Tải .conf']].forEach(([kind,label])=>{const a=document.createElement('a');a.href='/api/store/demo/'+encodeURIComponent(sku)+'/'+kind;a.textContent=label;a.rel='noreferrer';if(kind!=='js')a.download='';links.append(a)});section.append(h,links);container.append(section)});
    return;
  }
  if(!valid){
    $('order-state').textContent='Không tìm thấy phiên đơn';
    report('Hãy trở lại cửa hàng An và tạo đơn bằng chính điện thoại hoặc trình duyệt này.','warning');
    $('order-refresh').disabled=true;return;
  }
  const headers=()=>({Authorization:'Bearer '+token});
  async function loadDelivery(){
    const area=$('an-order-downloads'),container=$('an-download-products'),note=$('an-download-note');
    if(!area||!container||!note)return;
    try{
      const res=await fetch('/api/store/files?order='+encodeURIComponent(id),{headers:headers(),cache:'no-store'});
      const data=await res.json();
      if(!res.ok||!Array.isArray(data.packs))throw Error(data.error||'Liên kết chưa sẵn sàng.');
      note.textContent=data.note||'Những tệp dưới đây thuộc đơn hàng của bạn.';
      const fragment=document.createDocumentFragment();
      for(const pack of data.packs){
        const section=document.createElement('div');
        section.className='an-download-product';
        const title=document.createElement('h3');title.textContent=pack.name;section.append(title);
        const links=document.createElement('div');links.className='an-download-links';
        // Only use signed URLs returned from the current, verified order.
        const safeLink=kind=>{
          const href=pack.links?.[kind];
          if(typeof href!=='string')return null;
          try{
            const url=new URL(href,location.origin);
            if(url.origin!==location.origin||url.protocol!=='https:'||
               !url.pathname.endsWith('/'+pack.sku+'.'+kind)||
               !url.searchParams.has('sig')||!url.searchParams.has('exp'))return null;
            return url.href;
          }catch{return null;}
        };
        const moduleLink=safeLink('sgmodule');
        if(moduleLink){
          const install=document.createElement('a');
          install.className='an-install-primary';
          install.href='shadowrocket://install?module='+encodeURIComponent(moduleLink);
          install.rel='noreferrer';
          install.setAttribute('aria-label','Cài thử bộ '+pack.name+' vào Shadowrocket trên iPhone');
          const glyph=document.createElement('span');glyph.className='an-ui-icon';
          glyph.dataset.anIcon='smartphone';glyph.setAttribute('aria-hidden','true');
          install.append(glyph,document.createTextNode(' Cài gói bằng Shadowrocket'));
          window.AnIcons?.mount(glyph);
          links.append(install);
          const copy=document.createElement('button');copy.type='button';copy.className='an-install-copy';
          copy.textContent='Sao chép liên kết cài';
          copy.addEventListener('click',async()=>{
            try{
              if(!navigator.clipboard?.writeText)throw Error('clipboard unavailable');
              await navigator.clipboard.writeText(moduleLink);
              copy.textContent='Đã sao chép liên kết';
            }catch{
              // A read-only field provides manual copying without asking for credentials.
              const field=document.createElement('textarea');
              field.className='an-install-url';field.readOnly=true;field.value=moduleLink;field.rows=2;
              section.append(field);field.focus();field.select();
              copy.textContent='Chọn và sao chép liên kết bên dưới';
            }
          });
          links.append(copy);
        }
        for(const [kind,label] of [['sgmodule','Tải tệp cài .sgmodule'],['conf','Tải cấu hình .conf'],['js','Xem mã xử lý .js'],['json','Tải danh sách mẫu .json']]){
          const href=safeLink(kind);if(!href)continue;
          const link=document.createElement('a');link.href=href;link.textContent=label;
          link.rel='noreferrer';link.referrerPolicy='no-referrer';
          if(kind!=='js')link.setAttribute('download','');
          links.append(link);
        }
        section.append(links);
        const help=document.createElement('p');help.className='an-install-tip';
        help.textContent='Trên iPhone: bấm Cài gói. Nếu không tự mở, sao chép liên kết rồi vào Shadowrocket → Cấu hình → Mô-đun → + → Thêm từ URL. Không cần cài cả .sgmodule và .conf cùng lúc.';
        section.append(help);
        fragment.append(section);
      }
      container.replaceChildren(fragment);area.hidden=false;
    }catch(error){
      note.textContent=error?.message||'Chưa tạo được link tải';
      area.hidden=false;
    }
  }
  async function reload(){
    $('order-refresh').disabled=true;
    try{
      const response=await fetch('/api/store/checkout?order='+encodeURIComponent(id),{headers:headers(),cache:'no-store'});
      const data=await response.json();
      if(!response.ok)throw Error(data.error||'Không tải được đơn');
      mode=data.mode;currentStatus=data.status;
      $('order-id').textContent=data.orderCode;
      $('order-mode').textContent=mode==='demo'?'Dùng thử · Không thu tiền':'Thanh toán thật · payOS';
      $('order-date').textContent=new Date(data.created).toLocaleString('vi-VN');
      $('order-total').textContent=money(data.amount);
      const demoAmount=$('an-demo-amount');
      if(demoAmount)demoAmount.hidden=mode!=='demo';
      const amountLabel=$('order-total-label');
      if(amountLabel)amountLabel.textContent=mode==='demo'?'Giá tham khảo của các gói':'Tổng tiền thanh toán';
      const frag=document.createDocumentFragment();
      for(const item of data.items||[]){
        const row=document.createElement('div');row.className='an-order-item';
        const name=document.createElement('span'),price=document.createElement('strong');
        name.textContent=item.name;price.textContent=money(item.price);
        row.append(name,price);frag.append(row);
      }
      $('order-products').replaceChildren(frag);
      $('order-demo-confirm').hidden=!(mode==='demo'&&data.status==='DEMO_PENDING');
      const link=$('order-payos-link');
      const safe=mode==='live'&&typeof data.checkoutUrl==='string'&&
        (()=>{try{return new URL(data.checkoutUrl).origin==='https://pay.payos.vn'}catch{return false}})();
      link.hidden=!(safe&&data.status==='PENDING');
      if(safe)link.href=data.checkoutUrl;
      const messages={
        DEMO_PENDING:['Đơn dùng thử chưa hoàn tất','Bấm “Hoàn tất đơn dùng thử” để nhận tệp mẫu. Bạn không cần chuyển tiền.','pending'],
        DEMO_COMPLETED:['Đã hoàn tất thanh toán thử','Đã tự xác nhận đơn dùng thử (0đ). Bên dưới có nút Cài gói và Tải file mẫu; mỗi nhóm chỉ gồm một caption để kiểm tra, không phát sinh giao dịch ngân hàng.','done'],
        CREATING:['Đang tạo đơn','Máy chủ đang chuẩn bị đơn. Chờ một chút rồi kiểm tra lại.','pending'],
        PENDING:['Đang chờ thanh toán','Chỉ thanh toán trên trang payOS chính thức. Sau đó quay lại đây để kiểm tra trạng thái đơn.','pending'],
        PAID_AWAITING_DELIVERY:['Đã nhận thanh toán','Giao dịch đã được xác minh. Tệp thuộc những bộ bạn mua nằm phía dưới; việc sử dụng trong Locket vẫn cần kiểm thử.','done'],
        CANCELLED:['Đơn đã hủy','Bạn có thể quay lại cửa hàng để tạo đơn mới.','warning'],
        EXPIRED:['Đơn hết hạn','Bạn có thể quay lại cửa hàng để tạo đơn mới.','warning'],
        ERROR:['Không thể xử lý đơn','Không chuyển tiền; vui lòng liên hệ chủ cửa hàng.','warning']
      };
      const [name,msg,state]=messages[data.status]||['Đang kiểm tra đơn','Hệ thống đang kiểm tra trạng thái đơn. Vui lòng thử lại sau.','warning'];
      $('order-state').textContent=name;report(msg,state);
      if(['DEMO_COMPLETED','PAID_AWAITING_DELIVERY'].includes(data.status))await loadDelivery();
      else if($('an-order-downloads'))$('an-order-downloads').hidden=true;
    }catch(error){
      $('order-state').textContent='Lỗi kết nối';
      report(error.message||'Không tải được đơn.','warning');
    }finally{$('order-refresh').disabled=false}
  }
  $('order-refresh').addEventListener('click',reload);
  $('order-demo-confirm').addEventListener('click',async()=>{
    if(mode!=='demo'||currentStatus!=='DEMO_PENDING')return;
    const button=$('order-demo-confirm');button.disabled=true;
    try{
      const response=await fetch('/api/store/checkout/demo',{
        method:'POST',headers:{...headers(),'Content-Type':'application/json'},
        body:JSON.stringify({orderCode:id})
      });
      const data=await response.json();
      if(!response.ok)throw Error(data.error||'Không giả lập được đơn');
      await reload();
    }catch(error){report(error.message||'Chưa hoàn tất được đơn dùng thử.','warning')}
    finally{button.disabled=false}
  });
  void reload();
  // Periodic server verification only while the order remains pending.
  const interval=setInterval(()=>{
    if(document.visibilityState==='visible'&&['PENDING','CREATING'].includes(currentStatus)&&pollCount++<30)void reload();
    if(pollCount>=30||['DEMO_COMPLETED','PAID_AWAITING_DELIVERY','CANCELLED','EXPIRED','ERROR'].includes(currentStatus))clearInterval(interval);
  },10000);
})();
