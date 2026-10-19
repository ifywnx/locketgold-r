'use strict';
(() => {
  const $=id=>document.getElementById(id);
  const id=Number(new URLSearchParams(location.search).get('order'));
  const token=localStorage.getItem('an-store-owner-v1');
  const money=n=>Number(n||0).toLocaleString('vi-VN')+'đ';
  const valid=Number.isSafeInteger(id)&&id>0&&/^[a-f0-9]{64}$/.test(token||'');
  let mode=null,currentStatus=null,pollCount=0;
  $('order-id').textContent=valid?String(id):'Không hợp lệ';
  const report=(text,state='pending')=>{
    $('order-message').textContent=text;
    $('order-state').dataset.state=state;
  };
  if(!valid){
    $('order-state').textContent='Không tìm thấy phiên đơn';
    report('Hãy trở lại trang Feature Store và tạo lại đơn từ chính trình duyệt này.','warning');
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
      note.textContent=data.note||'Các file bên dưới gắn với đơn này.';
      const fragment=document.createDocumentFragment();
      for(const pack of data.packs){
        const section=document.createElement('div');
        section.className='an-download-product';
        const title=document.createElement('h3');title.textContent=pack.name;section.append(title);
        const links=document.createElement('div');links.className='an-download-links';
        for(const [kind,title] of [['sgmodule','Module .sgmodule'],['conf','Cấu hình .conf'],['js','Script .js'],['json','Dữ liệu .json']]){
          const href=pack.links?.[kind];
          if(typeof href!=='string')continue;
          const parsed=new URL(href,location.origin);
          if(parsed.origin!==location.origin)continue;
          const link=document.createElement('a');link.href=parsed.href;link.textContent='↓ '+title;
          link.rel='noreferrer';link.referrerPolicy='no-referrer';
          links.append(link);
        }
        section.append(links);fragment.append(section);
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
      $('order-mode').textContent=mode==='demo'?'DEMO · Không thu tiền':'LIVE · payOS';
      $('order-date').textContent=new Date(data.created).toLocaleString('vi-VN');
      $('order-total').textContent=money(data.amount);
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
        DEMO_PENDING:['Chưa hoàn tất thử nghiệm','Đây là đơn thử. Bấm “Giả lập thanh toán thành công” để kiểm tra giao diện và trạng thái. Không cần chuyển tiền.','pending'],
        DEMO_COMPLETED:['Giả lập thành công','Luồng test đã hoàn thành. File Caption Only mẫu (1 caption mỗi nhóm) hiện phía dưới; không có giao dịch ngân hàng hoặc quyền Gold nào được cấp.','done'],
        CREATING:['Đang tạo link','Máy chủ đang chuẩn bị đơn. Chờ một chút rồi kiểm tra lại.','pending'],
        PENDING:['Đang chờ thanh toán','Nếu bạn đang thử chế độ LIVE, chỉ chuyển tiền trên trang payOS chính thức. Quay lại và bấm kiểm tra trạng thái.','pending'],
        PAID_AWAITING_DELIVERY:['Đã xác minh nhận tiền','Máy chủ đã xác minh thanh toán payOS. Link tải riêng cho từng bộ caption trong đơn đã sẵn sàng phía dưới; khả năng tích hợp vào Locket vẫn cần kiểm thử.','done'],
        CANCELLED:['Đơn đã hủy','Bạn có thể quay lại cửa hàng để tạo đơn mới.','warning'],
        EXPIRED:['Đơn hết hạn','Bạn có thể quay lại cửa hàng để tạo đơn mới.','warning'],
        ERROR:['Không thể xử lý đơn','Không chuyển tiền; vui lòng liên hệ chủ cửa hàng.','warning']
      };
      const [name,msg,state]=messages[data.status]||['Đang chờ xác minh','Máy chủ chưa có kết luận cho đơn này.','warning'];
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
    }catch(error){report(error.message||'Lỗi giả lập.','warning')}
    finally{button.disabled=false}
  });
  void reload();
  // Periodic server verification only while the order remains pending.
  const interval=setInterval(()=>{
    if(document.visibilityState==='visible'&&['PENDING','CREATING'].includes(currentStatus)&&pollCount++<30)void reload();
    if(pollCount>=30||['DEMO_COMPLETED','PAID_AWAITING_DELIVERY','CANCELLED','EXPIRED','ERROR'].includes(currentStatus))clearInterval(interval);
  },10000);
})();
