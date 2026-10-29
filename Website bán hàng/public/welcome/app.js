const cfg=window.IFYWNX_CONFIG;
const $=id=>document.getElementById(id);
const plans={standard:{price:49000,name:'An · Locket V1'},v2:{price:89000,name:'Locket V2'},v3:{price:null,name:'Locket V3'},plus:{price:129000,name:'V2 + Shadowrocket'}};
let plan='standard',order=null,paid=false,accountRequest=0;
const money=n=>n.toLocaleString('vi-VN')+'đ';
function select(value,restore=false){if(order&&!restore)return;if(value==='plus'&&!restore)value='v2';if(!plans[value])value='standard';plan=value;document.querySelectorAll('[data-plan]').forEach(el=>{const on=el.dataset.plan===plan;el.classList.toggle('selected',on);el.setAttribute('aria-pressed',String(on));el.querySelector('.choose').textContent=on?'● Đang chọn':'○ Chọn gói này'});$('selection').textContent=plans[plan].name+' · '+(plans[plan].price===null?'Giá chưa công bố':money(plans[plan].price));$('buy').textContent=cfg.paymentsEnabled&&plans[plan].price!==null?'Thanh toán '+money(plans[plan].price)+' →':'Thanh toán chưa mở';$('buy').disabled=!cfg.paymentsEnabled||plans[plan].price===null;if(cfg.installPreview){$('buy').textContent='Xem phần cài đặt · Không thanh toán →';$('buy').disabled=false;}}
document.querySelectorAll('[data-plan]').forEach(el=>el.onclick=()=>{select(el.dataset.plan);if(cfg.installPreview)render('preview',plan,true)});
function installLink(session,file,title){
 const link=document.createElement('a');link.className='button dark';link.textContent=title;
 const url=(cfg.backend||location.origin)+'/download/'+encodeURIComponent(session)+'/'+file;
 link.href=file.endsWith('.conf')?'shadowrocket://config/add/'+url:file.endsWith('.mobileconfig')?url:'shadowrocket://install?module='+encodeURIComponent(url);
 return link;
}
function render(session,packageId,demo=false){
 prepareInstallation();accountRequest++;
 $('apple-email').value='Đang tải…';$('apple-password').value='';$('apple-password').type='password';$('copy-status').textContent='';$('copy-password').disabled=$('reveal').disabled=true;
 if(packageId==='plus'&&!demo)loadAccount(session);
 $('downloads').hidden=false;$('demo-note').hidden=!demo;if(demo)$('demo-note').textContent=plans[packageId].name+' · Bộ cài thử, không thu tiền.';$('apple').hidden=packageId!=='plus';$('cards').replaceChildren();
 const options=[
 ['ifywnx-Locket-Captions.sgmodule','1 · Cài module Locket','Nhập module vào Shadowrocket.','Cài module →'],
 ['ifywnx-Locket-Config.conf','2 · Cài cấu hình','Nhập rồi chọn cấu hình. Cấu hình này đã có quy tắc Locket: tắt module trùng trước khi bật kết nối.','Cài cấu hình →'],
 ['ifywnx-DNS-Cu.mobileconfig','DNS cũ','Chỉ dùng thay DNS riêng khi cần. Gỡ hồ sơ DNS đang dùng trước khi cài.','Cài DNS cũ →']
 ];
 for(const [file,title,description,label] of options){
 const card=document.createElement('article'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=title;p.textContent=description;
 const action=installLink(session,file,label);if(demo){const version=packageId==='standard'?'v1':packageId==='v3'?'v3':'v2';const name=file.endsWith('.mobileconfig')?'An-Locket-DNS.mobileconfig':file.endsWith('.conf')?'An-Locket.conf':'An-Locket.sgmodule';const url=location.origin+'/api/install-test/'+version+'/'+name;action.href=name.endsWith('.mobileconfig')?url:'shadowrocket://config/add/'+url;}card.append(h,p,action);$('cards').append(card);
 }
 $('downloads').scrollIntoView({behavior:'smooth'});
}
function prepareInstallation(){
 if($('downloads'))return;
 $('installation-slot').append($('installation-template').content.cloneNode(true));
$('apple-email').value='Được cấp sau khi xác nhận đơn';$('apple-password').value='';
$('reveal').onclick=()=>{const show=$('apple-password').type==='password';$('apple-password').type=show?'text':'password';$('reveal').textContent=show?'Ẩn':'Hiện'};
$('copy-password').onclick=async()=>{try{await navigator.clipboard.writeText($('apple-password').value);$('copy-status').textContent='Đã sao chép mật khẩu.'}catch{$('copy-status').textContent='Bấm Hiện rồi chọn và sao chép mật khẩu thủ công.'}};
}
function token(key){let v=localStorage.getItem(key);if(!v){v=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');localStorage.setItem(key,v)}return v}
async function api(url,options={}){const r=await fetch(url,{...options,cache:'no-store'});let d;try{d=await r.json()}catch{throw Error('Chưa kết nối được dịch vụ. Vui lòng thử lại sau.')}if(!r.ok)throw Error(d.error||'Yêu cầu chưa thành công.');return d}
function showOrder(){select(order.plan,true);document.querySelectorAll('[data-plan]').forEach(el=>el.disabled=true);$('buy').hidden=true;$('checkout').hidden=false;$('checkout').href=order.checkoutUrl;$('payment-status').textContent='Đơn #'+order.orderCode+' · '+money(order.amount)+'. Hoàn tất payOS rồi quay lại đây nhận mã.'}
async function check(){if(!order||paid||document.visibilityState!=='visible')return;try{const d=await api('/api/payments?order='+order.orderCode,{headers:{Authorization:'Bearer '+localStorage.getItem('ifywnx-v8-owner')}});if(d.status==='PAID'){paid=true;$('checkout').hidden=true;$('code').value=d.code;$('payment-status').textContent='Đã thanh toán. Đang mở bộ cài…';try{await activate(d.code);$('payment-status').textContent='Đã thanh toán. Bộ cài của bạn ở bên dưới.'}catch(e){$('access-message').textContent=e.message;$('payment-status').textContent='Đã thanh toán. Bấm Kích hoạt mã để thử lại.'}}else if(['CANCELLED','EXPIRED','ERROR'].includes(d.status)){order=null;localStorage.removeItem('ifywnx-v8-order');localStorage.removeItem('ifywnx-v8-owner');$('checkout').hidden=true;$('buy').hidden=false;document.querySelectorAll('[data-plan]').forEach(el=>el.disabled=false);$('payment-status').textContent='Đơn đã huỷ hoặc hết hạn. Bạn có thể chọn gói và tạo đơn mới.'}}catch(e){$('payment-status').textContent=e.message}}
$('buy').onclick=async()=>{if(cfg.installPreview){render('preview',plan,true);return}if(!cfg.paymentsEnabled||plans[plan].price===null){$('payment-status').textContent='Thanh toán đang được kết nối. Vui lòng quay lại sau.';return}$('buy').disabled=true;try{order=await api('/api/payments',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token('ifywnx-v8-owner')},body:JSON.stringify({plan})});if(order.amount!==plans[plan].price||order.plan!==plan)throw Error('Máy chủ chưa hỗ trợ đúng gói đã chọn. Chưa mở thanh toán.');localStorage.setItem('ifywnx-v8-order',JSON.stringify(order));showOrder();window.location.assign(order.checkoutUrl)}catch(e){order=null;$('payment-status').textContent=e.message}finally{$('buy').disabled=false}};
async function activate(code){
 let session=token('ifywnx-activation-v2:'+code);
 async function request(){return api('/api/access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,session})})}
 let d;try{d=await request()}catch(error){const legacy=localStorage.getItem('ifywnx-activation-v1');if(!legacy)throw error;session=legacy;d=await request()}
 localStorage.setItem('ifywnx-download-v1',d.path.split('/')[2]);render(d.path.split('/')[2],d.plan);
}
$('unlock').onsubmit=async e=>{e.preventDefault();$('access-message').textContent='';if(!cfg.paymentsEnabled){$('access-message').textContent='Chưa kết nối dịch vụ kích hoạt.';return}const button=e.target.querySelector('button');button.disabled=true;try{await activate($('code').value.trim())}catch(e){$('access-message').textContent=e.message}finally{button.disabled=false}};
if(cfg.paymentsEnabled){document.querySelector('.preview').hidden=true;try{order=JSON.parse(localStorage.getItem('ifywnx-v8-order')||'null');if(order){plan=order.plan;showOrder();check()}const session=localStorage.getItem('ifywnx-download-v1');if(session&&!order)api('/api/access',{headers:{Authorization:'Bearer '+session}}).then(d=>render(session,d.plan)).catch(()=>{})}catch{}setInterval(check,12000)}
select(plan,true);

async function loadAccount(session){const request=accountRequest;try{const d=await api('/api/download-account',{headers:{Authorization:'Bearer '+session}});if(request!==accountRequest)return;$('apple-email').value=d.email;$('apple-password').value=d.password;$('copy-password').disabled=$('reveal').disabled=false}catch(e){if(request===accountRequest)$('copy-status').textContent=e.message}}

if(cfg.testMode){render('installation-test','standard',true);$('buy').disabled=true;$('payment-status').textContent='Đang thử bộ cài · Thanh toán tạm tắt.';$('unlock').hidden=true;document.querySelector('.preview').hidden=true;}
