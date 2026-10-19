import {createHmac,timingSafeEqual} from 'node:crypto';
import catalog from './store-catalog.json';
import {STORE_PRODUCTS,type StoreProductId} from './store-products';

export type StoreFileKind='sgmodule'|'conf'|'js'|'json';
const names=['sgmodule','conf','js','json'] as const;
const maxAge=30*24*60*60; // Customers can renew links from authenticated order page.

export function productExists(id:string):id is StoreProductId{
  return Object.prototype.hasOwnProperty.call(STORE_PRODUCTS,id);
}
function secret(){
  const value=process.env.STORE_DOWNLOAD_SECRET;
  if(!value||value.length<32)throw new Error('Store download signing is not configured');
  return value;
}
function payload(order:number,sku:string,expiry:number){
  return 'an-store-v1:'+order+':'+sku+':'+expiry;
}
export function downloadSignature(order:number,sku:string,expiry:number){
  return createHmac('sha256',secret()).update(payload(order,sku,expiry)).digest('hex');
}
export function checkSignature(order:number,sku:string,expiry:number,signature:string){
  if(!Number.isSafeInteger(order)||order<=0||!productExists(sku)||
     !Number.isSafeInteger(expiry)||expiry<Math.floor(Date.now()/1000)||
     expiry>Math.floor(Date.now()/1000)+maxAge+60||
     !/^[a-f0-9]{64}$/i.test(signature))return false;
  const a=Buffer.from(downloadSignature(order,sku,expiry),'hex'),b=Buffer.from(signature,'hex');
  return timingSafeEqual(a,b);
}
export function fileUrl(origin:string,order:number,sku:StoreProductId,kind:StoreFileKind,expiry:number){
  const base=origin+'/api/store/files/'+encodeURIComponent(String(order))+'/'+encodeURIComponent(sku)+'.'+kind;
  return base+'?exp='+expiry+'&sig='+downloadSignature(order,sku,expiry);
}
export function makeLinks(origin:string,order:number,sku:StoreProductId){
  const expiry=Math.floor(Date.now()/1000)+maxAge;
  const kinds=Object.fromEntries(names.map(kind=>[kind,fileUrl(origin,order,sku,kind,expiry)]));
  return {sku,name:STORE_PRODUCTS[sku].name,expires:expiry,links:kinds};
}
type Entry={section:string,items:{overlay_id:string,source:string,caption:{type:string,text?:string}}[]};
export function productGroups(sku:StoreProductId,demo:boolean){
  const collections=(catalog.packs as Record<string,Entry[]>)[sku];
  if(!collections)throw new Error('Invalid caption collection');
  return collections.map(section=>({
    section:section.section,
    items:demo?section.items.slice(0,1):section.items
  })).filter(section=>section.items.length);
}
export function productScript(sku:StoreProductId,demo:boolean){
  const groups=JSON.stringify(productGroups(sku,demo));
  // Only overlay_items is changed; no entitlement, subscription, video or Gold flags.
  return \`/* An Feature Store · \${sku} · \${demo?'DEMO sample':'Caption Only'}
 * Independent caption overlay experiment. No Locket affiliation or Gold unlock.
 * Do not combine with another rule that modifies the same Remote Config response.
 */
(function(){
  'use strict';
  var original=($response&&typeof $response.body==='string')?$response.body:'';
  var result={body:original};
  try{
    if(!$request||!/^https:\\\\/\\\\/firebaseremoteconfig\\\\.googleapis\\\\.com\\\\/v1\\\\/projects\\\\/locket-4252a\\\\//i.test($request.url||''))return $done(result);
    var data=JSON.parse(original);
    if(!data||typeof data!=='object'||Array.isArray(data)||!data.entries||typeof data.entries!=='object'||Array.isArray(data.entries))return $done(result);
    var value=data.entries.overlay_items;
    var existing=value===undefined||value===null?[]:typeof value==='string'?JSON.parse(value):value;
    if(!Array.isArray(existing))return $done(result);
    var ids=Object.create(null);
    existing.forEach(function(group){
      if(!group||!Array.isArray(group.items))return;
      group.items.forEach(function(item){if(item&&typeof item.overlay_id==='string')ids[item.overlay_id]=true;});
    });
    var packs=\${groups};
    packs.forEach(function(group){
      var incoming=group.items.filter(function(item){
        if(ids[item.overlay_id])return false;
        ids[item.overlay_id]=true;return true;
      });
      if(!incoming.length)return;
      var target=existing.find(function(g){return g&&g.section===group.section&&Array.isArray(g.items);});
      if(target)target.items=target.items.concat(incoming);
      else existing.push({section:group.section,items:incoming});
    });
    data.entries.overlay_items=JSON.stringify(existing);
    result.body=JSON.stringify(data);
  }catch(error){result={body:original};}
  $done(result);
})();\`;
}
export function productConfig(sku:StoreProductId,scriptUrl:string,kind:'sgmodule'|'conf',demo:boolean){
  const note=demo?'TEST — 1 caption mẫu mỗi nhóm; không kích hoạt tài khoản.':'Caption Only — chưa xác nhận tương thích mọi phiên bản Locket.';
  const rule='an_caption_'+sku+' = type=http-response, pattern=^https:\\\\/\\\\/firebaseremoteconfig\\\\.googleapis\\\\.com\\\\/v1\\\\/projects\\\\/locket-4252a\\\\/.+, script-path='+scriptUrl+', requires-body=true, max-size=-1, timeout=60';
  if(kind==='sgmodule')return '#!name=An · '+STORE_PRODUCTS[sku].name+(demo?' · DEMO':'')+
    '\n#!desc='+note+'\n#!category=Rewrite\n#!system=iOS\n\n[Script]\n'+rule+
    '\n\n[MITM]\nhostname = %APPEND% firebaseremoteconfig.googleapis.com\n';
  return '# An Caption Only '+sku+(demo?' — DEMO':'')+
    '\n# '+note+'\n[General]\nbypass-system = true\n\n[Script]\n'+rule+
    '\n\n[MITM]\nhostname = %APPEND% firebaseremoteconfig.googleapis.com\n';
}
export function productJson(sku:StoreProductId,demo:boolean){
  return JSON.stringify({name:STORE_PRODUCTS[sku].name,sku,demo,
    notice:'Caption collection only. Integration into third-party Locket has not been validated.',
    groups:productGroups(sku,demo)},null,2)+'\n';
}
