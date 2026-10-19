const enc = new TextEncoder();
export function canonical(data:Record<string,unknown>){
 return Object.keys(data).filter(k=>data[k]!==undefined).sort().map(k=>{
 const v=data[k];
 if(Array.isArray(v))return k+'='+JSON.stringify(v.map(item=>item&&typeof item==='object'?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item));
 if(v!==null && typeof v==='object') throw Error('Unsupported signature value');
 return k+'='+((v===null || v===undefined || v==='null' || v==='undefined')?'':String(v));
 }).join('&');
}
export async function sign(data:Record<string,unknown>,secret:string){
 const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const b=await crypto.subtle.sign('HMAC',key,enc.encode(canonical(data)));
 return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
}
export async function verify(data:Record<string,unknown>,signature:unknown,secret:string){
 if(typeof signature!=='string'||!/^[a-f0-9]{64}$/i.test(signature))return false;
 const expected=await sign(data,secret);let diff=0;
 for(let i=0;i<64;i++)diff|=expected.charCodeAt(i)^signature.toLowerCase().charCodeAt(i);
 return diff===0;
}
async function encryptionKey(secret:string){return crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',enc.encode('ifywnx-code-v1:'+secret)),'AES-GCM',false,['encrypt','decrypt'])}
export async function seal(value:string,secret:string){const iv=crypto.getRandomValues(new Uint8Array(12));const encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await encryptionKey(secret),enc.encode(value)));return btoa(String.fromCharCode(...iv,...encrypted))}
export async function unseal(value:string,secret:string){const bytes=Uint8Array.from(atob(value),x=>x.charCodeAt(0));return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},await encryptionKey(secret),bytes.slice(12)))}
