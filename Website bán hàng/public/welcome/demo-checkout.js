'use strict';
/*
 * NO real payment. Checkout simulation and demo-only delivery.
 * A signed receipt authorizes 12 public preview captions + text instructions,
 * never a premium asset, a Locket Gold unlock, or a database order.
 */
(() => {
 const $=id=>document.getElementById(id),catalog=window.AN_STORE_VERSION_CATALOG;
 if(!catalog||catalog.paymentStatus!=='disabled')return;
 const product=version=>catalog.versions.find(v=>v.id===version);
 const price=n=>new Intl.NumberFormat('vi-VN').format(n)+'đ';
 const box=$('demo-checkout'),message=$('demo-status'),select=$('demo-version');
 if(!box||!message||!select)return;
 let quote=null,receipt=null,locked=false;
 for(const v of catalog.versions)select.add(new Option(v.shortName+' · '+price(v.priceVnd),v.id));
 const current=()=>product(select.value);
 const update=()=>{
   const v=current();
   $('demo-summary').textContent=v.name+' · '+v.captionCount+' caption · '+price(v.priceVnd);
   $('demo-confirm').disabled=!quote||!!receipt||locked;
   $('demo-create').disabled=locked;
   $('demo-restore').disabled=locked;
 };
 const report=(text,error=false)=>{message.textContent=text;message.dataset.error=String(error)};
 const freeze=b=>{locked=b;select.disabled=b||!!quote;update()};
 const api=async(path,payload)=>{
   const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},
     cache:'no-store',body:JSON.stringify(payload)});
   const d=await r.json().catch(()=>({error:'Máy chủ chưa phản hồi hợp lệ.'}));
   if(!r.ok)throw Error(d.error||'Giao dịch demo chưa thành công.');
   return d;
 };
 const order=o=>{
   $('demo-order-id').textContent=o.orderId;
   $('demo-order-status').textContent=o.status==='DEMO_FULFILLED'?'Đã xác nhận MÔ PHỎNG':'Chờ xác nhận DEMO';
   $('demo-order-price').textContent=price(o.amount)+' · KHÔNG THU TIỀN';
   $('demo-order').hidden=false;
 };
 const links=(v,ticket)=>{
   const list=$('demo-delivery');list.replaceChildren();
   for(const [file,label] of [
     ['sample.json','Tải 12 caption mẫu '+v.toUpperCase()],
     ['instructions.txt','Tải hướng dẫn demo'],
     ['receipt.json','Tải biên nhận demo']
   ]){
     const link=document.createElement('a');link.className='demo-download';
     link.textContent=label;link.href='/api/demo/files/'+encodeURIComponent(v)+'/'+file+'?ticket='+encodeURIComponent(ticket);
     link.rel='noreferrer';list.append(link);
   }
   $('demo-files').hidden=false;
 };
 const completed=payload=>{
   receipt=payload.receiptToken;
   sessionStorage.setItem('an-store-demo-receipt-v1',receipt);
   quote=null;select.value=payload.order.version;
   order(payload.order);links(payload.order.version,receipt);
   $('demo-confirm').disabled=true;
   report('Demo hoàn thành. Các tệp dưới đây chỉ là dữ liệu mẫu, không phải sản phẩm trả phí.');
   update();
 };
 $('demo-create').addEventListener('click',async()=>{
   quote=null;receipt=null;sessionStorage.removeItem('an-store-demo-receipt-v1');
   $('demo-order').hidden=true;$('demo-files').hidden=true;
   freeze(true);report('Đang tạo đơn mô phỏng…');
   try{
     const data=await api('/api/demo/checkout',{version:select.value});
     quote=data.quoteToken;order(data.order);
     report('Đơn demo đã tạo. Không có QR chuyển khoản và không thu tiền. Bấm Xác nhận DEMO để kiểm tra cấp bản mẫu.');
   }catch(e){report(e.message,true)}finally{freeze(false)}
 });
 $('demo-confirm').addEventListener('click',async()=>{
   if(!quote)return;
   freeze(true);report('Đang xác nhận mô phỏng…');
   try{completed(await api('/api/demo/complete',{quoteToken:quote}))}
   catch(e){report(e.message,true)}
   finally{freeze(false)}
 });
 $('demo-restore').addEventListener('click',async()=>{
   const input=$('demo-receipt-input').value.trim();
   if(!input)return report('Hãy nhập biên nhận demo.',true);
   freeze(true);report('Đang xác minh biên nhận demo…');
   try{completed(await api('/api/demo/restore',{receiptToken:input}));$('demo-receipt-input').value=''}
   catch(e){report(e.message,true)}
   finally{freeze(false)}
 });
 $('demo-copy-receipt').addEventListener('click',async()=>{
   if(!receipt)return;
   try{await navigator.clipboard.writeText(receipt);report('Đã sao chép biên nhận DEMO. Biên nhận hết hạn sau 60 phút.')}
   catch{report('Trình duyệt không cho sao chép. Bạn có thể tải file biên nhận demo bên dưới.',true)}
 });
 window.addEventListener('an-store-plan-change',e=>{
   if(quote||receipt)return;
   const version=e.detail?.version;
   if(product(version)){select.value=version;update()}
 });
 const previous=sessionStorage.getItem('an-store-demo-receipt-v1');
 if(previous){
   api('/api/demo/restore',{receiptToken:previous}).then(completed)
     .catch(()=>sessionStorage.removeItem('an-store-demo-receipt-v1'));
 }
 update();
})();