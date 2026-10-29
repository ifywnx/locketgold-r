'use strict';
/**
 * Caption Studio 3 — read-only explorer for canonical V1/V2/V3 preview data.
 * This DOES NOT add preview-only entries to Shadowrocket script export.
 * Favorited previews share Studio 2's existing local JSON backup format.
 */
(() => {
  const $=id=>document.getElementById(id);
  const metadata=window.AN_STORE_VERSION_CATALOG?.versions||[];
  const versions=metadata.filter(v=>['v1','v2','v3'].includes(v.id));
  if(versions.length!==3)return;
  const sources=new Map(), signatures=new Map();
  const cache=new Map();
  let current='v3',limit=36,loading=false;
  const keys=item=>JSON.stringify([item.group,item.text,item.icon||'',item.colors||[],item.ink||'']);
  const id=item=>'studio:preview:'+keys(item);
  const normalize=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLocaleLowerCase('vi');
  const liked=item=>window.AnStudioFavorites?.has(id(item))||false;
  const el=(tag,klass,text)=>{
    const node=document.createElement(tag);
    if(klass)node.className=klass;
    if(text!==undefined)node.textContent=text;
    return node;
  };
  function options(){
    const sel=$('explore-group');
    const old=sel.value;
    sel.replaceChildren(new Option('Tất cả chủ đề',''));
    const groups=[...new Set((sources.get(current)||[]).map(x=>x.group))];
    for(const group of groups)sel.append(new Option(group,group));
    sel.value=groups.includes(old)?old:'';
    $('explore-new-label').textContent=current==='v3'?'Chỉ mẫu V3 không có trong V2':'Chỉ mẫu chưa có trong bản trước';
    $('explore-new').disabled=current==='v1';
    if(current==='v1')$('explore-new').checked=false;
  }
  function shown(){
    const list=sources.get(current)||[];
    const q=normalize($('explore-search').value.trim());
    const onlyNew=$('explore-new').checked;
    const older=current==='v3'?signatures.get('v2'):current==='v2'?signatures.get('v1'):null;
    return list.filter(item=>
      (!$('explore-group').value||item.group===$('explore-group').value)&&
      (!$('explore-favorites').checked||liked(item))&&
      (!onlyNew||!older?.has(keys(item)))&&
      (!q||normalize([item.group,item.text,item.icon].join(' ')).includes(q))
    );
  }
  function render(){
    if(!sources.has(current))return;
    const list=shown(),frag=document.createDocumentFragment();
    for(const item of list.slice(0,limit)){
      const card=el('article','explore-card');
      const preview=el('div','explore-preview');
      preview.textContent=(item.icon?item.icon+' ':'')+item.text;
      const colors=Array.isArray(item.colors)&&item.colors.length>=2?item.colors:['#ece5f3','#e0d3ed'];
      // Generated from checked-in catalogue, not arbitrary user input.
      if(colors.every(c=>/^#[a-f0-9]{6,8}$/i.test(c)))preview.style.background='linear-gradient(130deg,'+colors.join(',')+')';
      if(/^#[a-f0-9]{6,8}$/i.test(item.ink||''))preview.style.color=item.ink;
      card.append(preview,el('p','explore-group',item.group));
      const actions=el('div','explore-actions');
      const fav=el('button','explore-heart'+(liked(item)?' is-active':''),liked(item)?'♥ Đã lưu':'♡ Yêu thích');
      fav.type='button';
      fav.setAttribute('aria-pressed',String(liked(item)));
      fav.setAttribute('aria-label',(liked(item)?'Bỏ yêu thích ':'Lưu yêu thích ')+item.text);
      fav.onclick=()=>{
        if(!window.AnStudioFavorites)return;
        if(!window.AnStudioFavorites.toggle(id(item)))$('explore-message').textContent='Đã đạt giới hạn 1.000 mục yêu thích.';
      };
      const copy=el('button','explore-copy','Sao chép');
      copy.type='button';
      copy.setAttribute('aria-label','Sao chép '+item.text);
      copy.onclick=async()=>{
        try{await navigator.clipboard.writeText(item.text);$('explore-message').textContent='Đã sao chép caption.'}
        catch{$('explore-message').textContent='Không sao chép được. Hãy chọn câu chữ trong bản xem trước.'}
      };
      actions.append(fav,copy);card.append(actions);frag.append(card);
    }
    $('explore-grid').replaceChildren(frag);
    $('explore-count').textContent='Hiển thị '+Math.min(limit,list.length)+'/'+list.length+' mẫu · '+sources.get(current).length+' mẫu thuộc '+current.toUpperCase();
    $('explore-more').hidden=list.length<=limit;
    const old=current==='v3'?signatures.get('v2'):current==='v2'?signatures.get('v1'):null;
    $('explore-difference').textContent=old?
      'Có '+sources.get(current).filter(x=>!old.has(keys(x))).length+' kiểu caption không trùng nội dung, icon và màu với bộ trước.':
      'V1 là phiên bản cơ bản; số mẫu được đối chiếu với tệp nguồn.';
  }
  function tab(version){
    if(!sources.has(version))return;
    current=version;limit=36;
    for(const b of document.querySelectorAll('[data-explore-version]')){
      const active=b.dataset.exploreVersion===version;
      b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));
    }
    options();render();
  }
  async function init(){
    if(loading)return;loading=true;
    try{
      const entries=await Promise.all(versions.map(async v=>{
        const response=await fetch('/welcome/'+v.captionFile,{cache:'force-cache'});
        if(!response.ok)throw Error(v.id+' fetch failed');
        const data=await response.json();
        if(!Array.isArray(data)||data.length!==v.captionCount||new Set(data.map(x=>x.group)).size!==v.groupCount)
          throw Error(v.id+' data differs from source manifest');
        return [v.id,data];
      }));
      for(const [v,items] of entries){
        sources.set(v,items);
        signatures.set(v,new Set(items.map(keys)));
      }
      const tabs=$('explore-versions');tabs.replaceChildren();
      for(const v of versions){
        const b=el('button','explore-tab',v.shortName+' · '+v.captionCount);
        b.type='button';b.dataset.exploreVersion=v.id;
        b.setAttribute('aria-pressed','false');
        b.onclick=()=>tab(v.id);
        tabs.append(b);
      }
      for(const field of ['explore-search','explore-group','explore-favorites','explore-new']){
        $(field).addEventListener('input',()=>{limit=36;render()});
      }
      $('explore-more').onclick=()=>{limit+=36;render()};
      window.addEventListener('an-studio-favorites-change',render);
      tab(current);
      $('explore-message').textContent='Thư viện đã đối chiếu từ mã nguồn GitHub. Chọn yêu thích không đồng nghĩa cài vào Locket.';
    }catch{
      $('explore-message').textContent='Không thể tải thư viện phiên bản. Hãy tải lại trang.';
    }
  }
  window.addEventListener('an-studio-ready',init,{once:true});
  // If library Studio initialized before this module loaded, allow same behavior.
  if(window.AnStudioFavorites)init();
})();