'use strict';
const $=id=>document.getElementById(id), KEY='ifywnx-caption-studio-v1';
let catalog=[],state={custom:[],selected:[],favorites:[]},previous=null,visibleLimit=36;
const message=t=>{$('status').textContent=t};
const clone=x=>JSON.parse(JSON.stringify(x));
// Vietnamese/English search with accent-insensitive matching; never send text to a server.
const normalize=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('vi').replace(/đ/g,'d');
function valid(s){return s&&Array.isArray(s.custom)&&Array.isArray(s.selected)&&s.custom.length<=300&&s.selected.length<=1000&&s.selected.every(x=>typeof x==='string')&&(s.favorites===undefined||(Array.isArray(s.favorites)&&s.favorites.length<=1000&&s.favorites.every(x=>typeof x==='string')))&&s.custom.every(x=>x&&typeof x.overlay_id==='string'&&x.overlay_id.startsWith('caption:ifywnx_')&&x.caption?.type==='static_content'&&typeof x.caption.text==='string'&&x.caption.text.length<=120&&typeof x.caption.icon?.data==='string'&&x.caption.icon.data.length<=24&&/^#[0-9a-f]{6}$/i.test(x.caption.text_color)&&Array.isArray(x.caption.background?.colors)&&x.caption.background.colors.length>=2&&x.caption.background.colors.length<=3&&x.caption.background.colors.every(c=>/^#[0-9a-f]{6}$/i.test(c)))&&new Set(s.custom.map(x=>x.overlay_id)).size===s.custom.length}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{message('Trình duyệt không lưu được. Hãy tải bản sao JSON trước khi đóng trang.')}}
function mutate(fn){previous=clone(state);fn();persist();render();window.dispatchEvent(new Event('an-studio-favorites-change'))}
window.AnStudioFavorites={
  has(id){return state.favorites.includes(id)},
  toggle(id){
    if(typeof id!=='string'||!id.startsWith('studio:preview:')||id.length>1000)return false;
    const exists=state.favorites.includes(id);
    if(!exists&&state.favorites.length>=1000)return false;
    mutate(()=>{
      const old=new Set(state.favorites);
      if(exists)old.delete(id);else old.add(id);
      state.favorites=[...old];
    });
    return true;
  }
};
function allItems(){return [...catalog.flatMap(g=>g.items.map(item=>({...item,group:g.section}))),...state.custom.map(item=>({...item,group:'✨ Của tôi'}))]}
function filtered(){
  const q=normalize($('search').value.trim()),favorites=new Set(state.favorites);
  const selected=new Set(state.selected);
  return allItems().filter(i=>(!$('category').value||i.group===$('category').value)&&
   (!$('only').checked||selected.has(i.overlay_id))&&
   (!$('only-favorites').checked||favorites.has(i.overlay_id))&&
   normalize([i.caption.text,i.caption.type,i.caption.icon?.data,i.group].join(' ')).includes(q));
}
function paint(node,c){node.textContent=(c.icon?.data||'')+' '+(c.text||(c.type==='static_content'?'Caption của bạn':'Mẫu động · '+c.type));const colors=c.background?.colors||['#e7edfa','#d6e2fa'];node.style.background=`linear-gradient(180deg,${colors.join(',')})`;node.style.color=c.text_color||'#182b48'}
function render(){
  const list=filtered(),selected=new Set(state.selected),favorites=new Set(state.favorites);
  const fragment=document.createDocumentFragment();
  for(const item of list.slice(0,visibleLimit)){
    const card=document.createElement('article');card.className='card';
    const preview=document.createElement('div');preview.className='preview';paint(preview,item.caption);
    const meta=document.createElement('div');meta.className='meta';
    meta.textContent=item.group+(item.source==='local'?' · dữ liệu thay đổi theo Locket':'');
    const label=document.createElement('label'),check=document.createElement('input');
    check.type='checkbox';check.checked=selected.has(item.overlay_id);
    check.onchange=()=>mutate(()=>{state.selected=check.checked?[...new Set([...state.selected,item.overlay_id])]:state.selected.filter(id=>id!==item.overlay_id)});
    label.append(check,document.createTextNode('Chọn caption'));
    const actions=document.createElement('div');actions.className='caption-actions';
    const fav=document.createElement('button');fav.type='button';fav.className='secondary favorite-action';
    fav.setAttribute('aria-pressed',String(favorites.has(item.overlay_id)));
    fav.setAttribute('aria-label',(favorites.has(item.overlay_id)?'Bỏ yêu thích: ':'Yêu thích: ')+(item.caption.text||item.caption.type));
    fav.textContent=favorites.has(item.overlay_id)?'♥ Đã lưu':'♡ Yêu thích';
    fav.onclick=()=>mutate(()=>{const ids=new Set(state.favorites);if(ids.has(item.overlay_id))ids.delete(item.overlay_id);else ids.add(item.overlay_id);state.favorites=[...ids]});
    actions.append(fav);
    if(item.caption.text){
      const copy=document.createElement('button');copy.type='button';copy.className='secondary copy-caption';copy.textContent='Sao chép';
      copy.setAttribute('aria-label','Sao chép: '+item.caption.text);
      copy.onclick=async()=>{try{await navigator.clipboard.writeText(item.caption.text);message('Đã sao chép caption.')}catch{message('Trình duyệt không cho sao chép. Bạn có thể chọn câu chữ trên mẫu.')}};
      actions.append(copy);
    }
    card.append(preview,meta,label,actions);
    if(item.group==='✨ Của tôi'){
      const del=document.createElement('button');del.type='button';del.className='secondary';del.textContent='Xoá';
      del.onclick=()=>mutate(()=>{
        state.custom=state.custom.filter(x=>x.overlay_id!==item.overlay_id);
        state.selected=state.selected.filter(id=>id!==item.overlay_id);
        state.favorites=state.favorites.filter(id=>id!==item.overlay_id);
      });
      card.append(del);
    }
    fragment.append(card);
  }
  $('grid').replaceChildren(fragment);
  $('count').textContent='('+list.length+'/'+allItems().length+')';
  $('more-captions').hidden=list.length<=visibleLimit;
  $('selected').textContent=state.selected.length;
  $('favorite-total').textContent=state.favorites.length;
  $('script').disabled=!state.selected.length;
  $('undo').disabled=!previous;
}
function download(name,content,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
function currentCaption(){return {type:'static_content',text:$('caption').value.trim(),icon:{type:'emoji',data:$('emoji').value},background:{colors:$('use3').checked?[$('color1').value,$('color3').value,$('color2').value]:[$('color1').value,$('color2').value]},text_color:$('ink').value,max_lines:2}}
$('create').oninput=()=>paint($('live'),currentCaption());$('use3').onchange=()=>{$('third-color').hidden=!$('use3').checked;paint($('live'),currentCaption())};$('create').onsubmit=e=>{e.preventDefault();const caption=currentCaption();if(!caption.text)return;if(state.custom.length>=300){message('Tối đa 300 caption riêng.');return}mutate(()=>{const overlay_id='caption:ifywnx_'+crypto.randomUUID();state.custom.push({overlay_id,source:'remote',caption});state.selected.push(overlay_id)});message('Đã thêm caption vào bộ của bạn.')};
for(const id of ['search','category','only','only-favorites'])$(id).oninput=()=>{visibleLimit=36;render()};$('more-captions').onclick=()=>{visibleLimit+=36;render()};
$('all').onclick=()=>mutate(()=>{state.selected=[...new Set([...state.selected,...filtered().map(i=>i.overlay_id)])]});$('none').onclick=()=>{const ids=new Set(filtered().map(i=>i.overlay_id));mutate(()=>{state.selected=state.selected.filter(id=>!ids.has(id))})};
$('backup').onclick=()=>download('An-captions-backup.json',JSON.stringify({version:2,...state},null,2),'application/json');
$('restore').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>1000000)throw Error();const s=JSON.parse(await f.text());if(![1,2].includes(s.version)||!valid(s))throw Error();const allowed=new Set([...catalog.flatMap(g=>g.items.map(i=>i.overlay_id)),...s.custom.map(i=>i.overlay_id)]);if(s.selected.some(id=>!allowed.has(id)))throw Error();mutate(()=>{state={custom:s.custom,selected:[...new Set(s.selected)],favorites:[...new Set(s.favorites||[])]}});message('Đã khôi phục. Có thể quay lại bằng nút bên dưới.')}catch{message('File không đúng bản sao Caption Studio hoặc quá lớn; bộ hiện tại được giữ nguyên.')}e.target.value=''};
$('undo').onclick=()=>{if(!previous)return;const now=clone(state);state=previous;previous=now;persist();render();window.dispatchEvent(new Event('an-studio-favorites-change'))};
function makeScript(groups){return `(function(){var result={};try{var ua=$request.headers['User-Agent']||$request.headers['user-agent']||'';if(ua.indexOf('Locket')>=0){var obj=JSON.parse($response.body);if(obj&&obj.entries&&typeof obj.entries==='object'&&!Array.isArray(obj.entries)){var selected=${JSON.stringify(groups)};var existing=[];try{existing=JSON.parse(obj.entries.overlay_items||'[]')}catch(e){}if(!Array.isArray(existing))existing=[];var ids={};selected.forEach(function(g){g.items.forEach(function(i){ids[i.overlay_id]=true})});existing=existing.filter(function(g){return g&&Array.isArray(g.items)}).map(function(g){return Object.assign({},g,{items:g.items.filter(function(i){return i&&!ids[i.overlay_id]})})});obj.entries.overlay_items=JSON.stringify(existing.concat(selected));result={body:JSON.stringify(obj)}}}}catch(e){}$done(result)})();\n`}
$('script').onclick=()=>{const selected=allItems().filter(i=>state.selected.includes(i.overlay_id));const map=new Map();for(const {group,...item} of selected){if(!map.has(group))map.set(group,[]);map.get(group).push(item)}download('An-caption-custom.js',makeScript([...map].map(([section,items])=>({section,items}))),'text/javascript');message('Đã xuất script thử nghiệm. Mở hướng dẫn bên dưới để triển khai; tải file chưa tự áp dụng vào Locket.')};
(async()=>{try{const response=await fetch('catalog.json');if(!response.ok)throw Error();catalog=await response.json();try{const saved=JSON.parse(localStorage.getItem(KEY));if(valid(saved))state={custom:saved.custom,selected:saved.selected,favorites:saved.favorites||[]}}catch{}for(const name of [...catalog.map(g=>g.section),'✨ Của tôi']){const o=document.createElement('option');o.value=name;o.textContent=name;$('category').append(o)}paint($('live'),currentCaption());render();window.AnStudioReady=true;window.dispatchEvent(new Event('an-studio-ready'))}catch{message('Không tải được thư viện. Hãy mở bằng địa chỉ web thay vì mở file HTML trực tiếp.')}})();
