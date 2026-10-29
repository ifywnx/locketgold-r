'use strict';
/*
 * No actual payment or premium asset. Signed demo state survives same-tab
 * refresh, and the server must independently verify any saved quote/receipt.
 */
(()=>{
 const $=id=>document.getElementById(id),catalog=window.AN_STORE_VERSION_CATALOG;
 if(!catalog||catalog.paymentStatus!=='disabled')return;
 const product=id=>catalog.versions.find(v=>v.id===id);
 const price=n=>new Intl.NumberFormat('vi-VN').format(n)+'đ';
 const box=$('demo-checkout'),message=$('demo-status'),select=$('demo-version');
 if(!box||!message||!select)return;
 const PENDING='an-store-demo-pending-v1',RECEIPT='an-store-demo-receipt-v1';
 const store={
   get(k){try{return sessionStorage.getItem(k)}catch{return null}},
   set(k,v){try{sessionStorage.setItem(k,v)}catch{}},
   remove(k){try{sessionStorage.removeItem(k)}catch{}}
 };
 let quote=null,receipt=null,quoteExpiry=0,receiptExpiry=0,locked=false;
 for(const v of catalog.versions)select.add(new Option(v.shortName+' · '+price(v.priceVnd),v.id));
 const report=(s,error=false)=>{message.textContent=s;message.dataset.error=String(error)};
 const secondsLeft=t=>Math.max(0,Math.ceil((t-Date.now())/1000));
 const clearQuote=()=>{quote=null;quoteExpiry=0;store.remove(PENDING)};
 const clearReceipt=()=>{receipt=null;receiptExpiry=0;store.remove(RECEIPT)};
 const hideDelivery=()=>{
   $('demo-order').hidden=true;$('demo-files').hidden=true;
   $('demo-delivery').replaceChildren();
 };
 const showOrder=o=>{
   $('demo-order-id').textContent=o.orderId;
   $('demo-order-status').textContent=o.status==='DEMO_FULFILLED'?'Đã xác nhận MÔ PHỎNG':'Chờ xác nhận DEMO';
   $('demo-order-price').textContent=price(o.amount)+' · KHÔNG THU TIỀN';
   $('demo-order').hidden=false;
 };
 const updateClock=()=>{
   const el=$('demo-expires');
   if(receipt&&secondsLeft(receiptExpiry)===0){
     clearReceipt();hideDelivery();
     report('Biên nhận DEMO đã hết hạn. Bạn có thể tạo lượt thử mới.',true);
   }else if(quote&&secondsLeft(quoteExpiry)===0){
     clearQuote();hideDelivery();
     report('Phiếu DEMO đã hết hạn sau 15 phút. Hãy tạo lại lượt thử.',true);
   }
   const deadline=receipt?receiptExpiry:quote?quoteExpiry:0;
   if(!deadline){el.hidden=true;el.textContent='';return}
   const seconds=secondsLeft(deadline);
   el.hidden=false;
   el.textContent=(receipt?'Biên nhận mẫu':'Phiếu chờ xác nhận')+
     ' còn hiệu lực '+Math.floor(seconds/60)+' phút '+String(seconds%60).padStart(2,'0')+' giây · DEMO ONLY';
 };
 const update=()=>{
   const v=product(select.value);
   $('demo-summary').textContent=v.name+' · '+v.captionCount+' caption · '+price(v.priceVnd);
   $('demo-confirm').disabled=!quote||!!receipt||locked||secondsLeft(quoteExpiry)===0;
   $('demo-create').disabled=locked;
   $('demo-restore').disabled=locked;
   select.disabled=locked||!!quote;
   updateClock();
 };
 const freeze=b=>{locked=b;update()};
 const api=async(path,body)=>{
   const r=await fetch(path,{method:'POST',credentials:'same-origin',
     headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify(body)});
   const data=await r.json().catch(()=>({error:'Phản hồi máy chủ không hợp lệ.'}));
   if(!r.ok)throw Error(data.error||'Không thể xử lý lượt DEMO.');
   return data;
 };
 const links=(version,token)=>{
   const list=$('demo-delivery');list.replaceChildren();
   for(const [name,label] of [
     ['sample.json','Tải 12 caption mẫu '+version.toUpperCase()],
     ['instructions.txt','Tải hướng dẫn demo'],['receipt.json','Tải biên nhận demo']
   ]){
     const link=document.createElement('a');
     link.className='demo-download';link.textContent=label;
     link.href='/api/demo/files/'+encodeURIComponent(version)+'/'+name+
       '?ticket='+encodeURIComponent(token);
     link.rel='noreferrer';list.append(link);
   }
   $('demo-files').hidden=false;
 };
 const completed=payload=>{
   clearQuote();
   receipt=payload.receiptToken;
   receiptExpiry=Date.parse(payload.order.expiresAt);
   if(!Number.isFinite(receiptExpiry)||secondsLeft(receiptExpiry)===0){
     clearReceipt();hideDelivery();report('Biên nhận DEMO hết hạn.',true);update();return;
   }
   store.set(RECEIPT,receipt);
   select.value=payload.order.version;
   showOrder(payload.order);links(payload.order.version,receipt);
   report('Demo hoàn thành. Các tệp này chỉ chứa mẫu, không phải sản phẩm đã thanh toán.');
   update();
 };
 select.addEventListener('change',()=>{
   if(quote||receipt){
     clearQuote();clearReceipt();hideDelivery();
     report('Đã đổi gói. Tạo lượt DEMO mới để thử phiên bản khác.');
   }
   update();
 });
 $('demo-create').addEventListener('click',async()=>{
   clearQuote();clearReceipt();hideDelivery();freeze(true);
   report('Đang tạo phiếu mô phỏng…');
   try{
     const d=await api('/api/demo/checkout',{version:select.value});
     quote=d.quoteToken;quoteExpiry=Date.parse(d.order.expiresAt);
     if(!Number.isFinite(quoteExpiry)||secondsLeft(quoteExpiry)===0)throw Error('Phiếu DEMO hết hạn.');
     store.set(PENDING,quote);showOrder(d.order);
     report('Phiếu DEMO đã tạo. Tải lại trang vẫn có thể tiếp tục xác nhận trong 15 phút.');
   }catch(e){clearQuote();hideDelivery();report(e.message,true)}
   finally{freeze(false)}
 });
 $('demo-confirm').addEventListener('click',async()=>{
   if(!quote||secondsLeft(quoteExpiry)===0){update();return}
   freeze(true);report('Đang xác nhận DEMO…');
   try{completed(await api('/api/demo/complete',{quoteToken:quote}))}
   catch(e){report(e.message,true)}
   finally{freeze(false)}
 });
 $('demo-restore').addEventListener('click',async()=>{
   const input=$('demo-receipt-input').value.trim();
   if(!input)return report('Hãy dán biên nhận DEMO.',true);
   freeze(true);report('Đang kiểm tra biên nhận DEMO…');
   try{
     completed(await api('/api/demo/restore',{receiptToken:input}));
     $('demo-receipt-input').value='';
   }catch(e){report(e.message,true)}
   finally{freeze(false)}
 });
 $('demo-copy-receipt').addEventListener('click',async()=>{
   if(!receipt||secondsLeft(receiptExpiry)===0)return;
   try{
     await navigator.clipboard.writeText(receipt);
     report('Đã sao chép biên nhận DEMO (hạn 60 phút kể từ lúc xác nhận).');
   }catch{report('Không sao chép được. Có thể tải tệp biên nhận DEMO.',true)}
 });
 window.addEventListener('an-store-plan-change',e=>{
   if(quote||receipt)return;
   const v=e.detail?.version;
   if(product(v)){select.value=v;update()}
 });
 const restorePrevious=async()=>{
   const savedReceipt=store.get(RECEIPT);
   const savedQuote=store.get(PENDING);
   if(!savedReceipt&&!savedQuote){update();return}
   freeze(true);
   try{
     if(savedReceipt){
       const result=await api('/api/demo/restore',{receiptToken:savedReceipt});
       completed(result);
       report('Biên nhận DEMO trong tab này đã khôi phục, không phát sinh thanh toán.');
     }else{
       const result=await api('/api/demo/inspect',{quoteToken:savedQuote});
       quote=result.quoteToken;quoteExpiry=Date.parse(result.order.expiresAt);
       if(!Number.isFinite(quoteExpiry)||secondsLeft(quoteExpiry)===0)throw Error('Expired');
       select.value=result.order.version;showOrder(result.order);
       report('Đã kiểm tra và khôi phục phiếu chờ DEMO. Có thể tiếp tục xác nhận.');
     }
   }catch{
     clearQuote();clearReceipt();hideDelivery();
     report('Lượt DEMO trước không hợp lệ hoặc đã hết hạn. Hãy tạo lượt mới.');
   }finally{freeze(false)}
 };
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)update()});
 window.setInterval(update,15000);
 void restorePrevious();
})();
