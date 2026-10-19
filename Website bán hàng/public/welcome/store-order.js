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
        DEMO_COMPLETED:['Giả lập thành công','Luồng test đã hoàn thành. Không có giao dịch ngân hàng hay mã kích hoạt nào được cấp.','done'],
        CREATING:['Đang tạo link','Máy chủ đang chuẩn bị đơn. Chờ một chút rồi kiểm tra lại.','pending'],
        PENDING:['Đang chờ thanh toán','Nếu bạn đang thử chế độ LIVE, chỉ chuyển tiền trên trang payOS chính thức. Quay lại và bấm kiểm tra trạng thái.','pending'],
        PAID_AWAITING_DELIVERY:['Đã xác minh nhận tiền','Máy chủ đã xác minh thanh toán payOS. Sản phẩm đang chờ khâu giao quyền; chưa có mã/module tự động.','done'],
        CANCELLED:['Đơn đã hủy','Bạn có thể quay lại cửa hàng để tạo đơn mới.','warning'],
        EXPIRED:['Đơn hết hạn','Bạn có thể quay lại cửa hàng để tạo đơn mới.','warning'],
        ERROR:['Không thể xử lý đơn','Không chuyển tiền; vui lòng liên hệ chủ cửa hàng.','warning']
      };
      const [name,msg,state]=messages[data.status]||['Đang chờ xác minh','Máy chủ chưa có kết luận cho đơn này.','warning'];
      $('order-state').textContent=name;report(msg,state);
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
