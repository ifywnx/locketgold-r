'use strict';
(() => {
  const root=document.getElementById('feature-store');
  if(!root)return;
  const $=id=>document.getElementById(id);
  const cart=new Set();
  const catalog=new Map();
  const money=n=>Number(n||0).toLocaleString('vi-VN')+'đ';
  const button=$('an-store-checkout-button');
  const status=$('an-store-checkout-status');
  const cartItems=$('an-store-cart-items');
  const modeLabel=$('an-store-cart-mode');
  const cartBadge=$('store-cart-badge');
  const mobileCart=$('an-store-mobile-cart');
  const mobileCartLabel=$('an-store-mobile-cart-label');
  let mode='demo',ready=false,selectedFromDialog=null;
  function ensureOwner(){
    let owner=localStorage.getItem('an-store-owner-v1');
    if(!owner||!/^[a-f0-9]{64}$/.test(owner)){
      owner=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
      localStorage.setItem('an-store-owner-v1',owner);
    }
    return owner;
  }
  function update(){
    const fragment=document.createDocumentFragment();
    let amount=0;
    for(const id of cart){
      const product=catalog.get(id);
      if(!product)continue;
      amount+=product.price;
      const line=document.createElement('div');
      line.className='an-cart-line';
      const name=document.createElement('strong');
      name.textContent=product.name;
      const price=document.createElement('span');
      price.textContent=money(product.price);
      const remove=document.createElement('button');
      remove.type='button';
      remove.textContent='Bỏ';
      remove.setAttribute('aria-label','Bỏ '+product.name+' khỏi giỏ');
      remove.addEventListener('click',()=>{cart.delete(id);update()});
      line.append(name,price,remove);
      fragment.append(line);
    }
    if(!cart.size){
      const empty=document.createElement('p');
      empty.textContent='Giỏ đang trống — chọn một hoặc nhiều bộ caption ở trên.';
      fragment.append(empty);
    }
    cartItems.replaceChildren(fragment);
    $('an-store-cart-amount').textContent=money(amount);
    if(cartBadge)cartBadge.textContent=String(cart.size);
    if(mobileCart){mobileCart.hidden=!ready||!cart.size;document.body.classList.toggle('an-store-has-mobile-cart',ready&&cart.size>0);}
    if(mobileCartLabel)mobileCartLabel.textContent='Xem giỏ hàng · '+cart.size+' bộ · '+money(amount);
    button.disabled=!ready||!cart.size;
    button.querySelector('span').textContent=cart.size?'↗':'＋';
    for(const btn of root.querySelectorAll('[data-store-add]')){
      btn.textContent=cart.has(btn.dataset.storeAdd)?'✓ Đã thêm · Chạm để bỏ':'＋ Thêm vào giỏ';
      btn.setAttribute('aria-pressed',String(cart.has(btn.dataset.storeAdd)));
    }
    const modalAdd=$('an-store-dialog-add');
    if(modalAdd&&selectedFromDialog){
      modalAdd.textContent=cart.has(selectedFromDialog)?'✓ Đã thêm · Chạm để bỏ':'＋ Thêm vào giỏ';
    }
  }
  function toggle(id){
    if(!catalog.has(id))return;
    if(cart.has(id))cart.delete(id);
    else cart.add(id);
    update();
  }
  async function load(){
    try{
      const res=await fetch('/api/store/checkout?catalog=1',{cache:'no-store'});
      const data=await res.json();
      if(!res.ok||!Array.isArray(data.products))throw Error(data.error||'Không kết nối được cửa hàng');
      mode=data.mode==='live'?'live':'demo';
      for(const p of data.products){
        if(typeof p.id!=='string'||!Number.isSafeInteger(p.price)||p.price<=0)continue;
        catalog.set(p.id,p);
        const card=root.querySelector('.an-store-item[data-store-id="'+p.id+'"]');
        if(!card)continue;
        const add=document.createElement('button');
        add.type='button';add.className='an-store-add';add.dataset.storeAdd=p.id;
        add.addEventListener('click',()=>toggle(p.id));
        const price=document.createElement('p');
        price.className='an-store-price';
        price.textContent='Giá dùng thử: '+money(p.price);
        const previewButton=card.querySelector('[data-store-preview]');
        if(previewButton)card.insertBefore(price,previewButton);
        card.append(add);
      }
      ready=true;
      modeLabel.textContent=mode==='demo'?'DÙNG THỬ · Không thu tiền':'THANH TOÁN THẬT';
      status.textContent=mode==='demo'
        ?'Đây là giỏ hàng dùng thử. Bạn có thể tạo đơn để xem quy trình, không cần chuyển tiền.'
        :'Thanh toán thật chỉ được bật khi chủ cửa hàng đã xác nhận giao hàng. Kiểm tra đơn trước khi tiếp tục.';
      button.firstChild.textContent=mode==='demo'?'Tiếp tục đặt hàng thử ':'Tiếp tục thanh toán ';
      update();
    }catch(error){
      ready=false;modeLabel.textContent='Không thể tải giá';button.disabled=true;
      status.textContent='Chưa xem được giá và giỏ hàng. Vui lòng tải lại trang sau ít phút.';
    }
  }
  root.querySelectorAll('[data-store-preview]').forEach(b=>{
    b.addEventListener('click',()=>{selectedFromDialog=b.dataset.storePreview;update()});
  });
  $('an-store-dialog-add')?.addEventListener('click',()=>toggle(selectedFromDialog));
  button.addEventListener('click',async()=>{
    if(!ready||!cart.size)return;
    button.disabled=true;status.textContent='Đang tạo đơn dùng thử…';
    try{
      const response=await fetch('/api/store/checkout',{
        method:'POST',cache:'no-store',
        headers:{'Content-Type':'application/json',Authorization:'Bearer '+ensureOwner()},
        body:JSON.stringify({items:[...cart]})
      });
      const data=await response.json();
      if(!response.ok||!data.orderCode)throw Error(data.error||'Chưa tạo được đơn, vui lòng thử lại');
      localStorage.setItem('an-store-last-order',String(data.orderCode));
      // Local order details are always shown before any transfer to payOS.
      location.assign('/store/checkout.html?order='+encodeURIComponent(data.orderCode));
    }catch(error){
      status.textContent=error?.message||'Tạo đơn không thành công';
      button.disabled=false;
    }
  });
  update();void load();
})();
