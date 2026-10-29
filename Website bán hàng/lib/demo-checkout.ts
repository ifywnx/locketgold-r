/**
 * Stateless checkout simulation. These tokens NEVER authorize real downloads,
 * licences, access codes, a paid order or any payOS operation.
 * Only small, public caption preview datasets may be returned.
 */
import {createHmac,randomUUID,timingSafeEqual} from 'node:crypto';
import catalog from './version-catalog.json';

export type DemoVersion='v1'|'v2'|'v3';
export type DemoPhase='quote'|'fulfilled';
type Ticket={
  schema:1,scope:'an-store-demo-only',phase:DemoPhase,
  order:string,version:DemoVersion,amount:number,
  issued:number,expires:number
};
const MAX_TICKET_LENGTH=1800;
const QUOTE_SECONDS=15*60;
const FULFILLED_SECONDS=60*60;
const secrets=()=> {
  const key=process.env.STORE_DEMO_SECRET;
  if(!key||key.length<32)throw new Error('STORE_DEMO_SECRET missing or too short');
  return key;
};
const hmac=(body:string)=>createHmac('sha256',secrets())
  .update('an-store:demo-only:v1:').update(body).digest();
export const demoProduct=(id:unknown)=>{
  if(typeof id!=='string'||!['v1','v2','v3'].includes(id))return null;
  return catalog.versions.find(v=>v.id===id)!;
};
export const demoAvailable=()=>!!process.env.STORE_DEMO_SECRET &&
  process.env.STORE_DEMO_SECRET.length>=32 && catalog.paymentStatus==='disabled';
export const demoPrice=(version:DemoVersion)=>demoProduct(version)!.priceVnd;
export function mintDemo(phase:DemoPhase,version:DemoVersion,order?:string,now=Math.floor(Date.now()/1000)){
  const product=demoProduct(version);
  if(!product||!demoAvailable())throw Error('Demo not configured');
  const ticket:Ticket={
    schema:1,scope:'an-store-demo-only',phase,order:order||randomUUID(),
    version,amount:product.priceVnd,issued:now,
    expires:now+(phase==='quote'?QUOTE_SECONDS:FULFILLED_SECONDS)
  };
  if(!/^[a-f0-9-]{36}$/.test(ticket.order))throw Error('Bad order id');
  const payload=Buffer.from(JSON.stringify(ticket)).toString('base64url');
  return {token:payload+'.'+hmac(payload).toString('base64url'),ticket};
}
export function parseDemo(value:unknown,phase:DemoPhase,now=Math.floor(Date.now()/1000)):
  {ok:true,ticket:Ticket}|{ok:false,reason:'invalid'|'expired'}{
  if(typeof value!=='string'||value.length>MAX_TICKET_LENGTH||
    !/^[a-zA-Z0-9_-]{40,1600}\.[a-zA-Z0-9_-]{43}$/.test(value))return {ok:false,reason:'invalid'};
  const [payload,signature]=value.split('.');
  let signed:Buffer;
  try{signed=Buffer.from(signature,'base64url')}catch{return {ok:false,reason:'invalid'}}
  const correct=hmac(payload);
  if(signed.length!==correct.length||!timingSafeEqual(signed,correct))return {ok:false,reason:'invalid'};
  let t:Ticket;
  try{t=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'))}catch{return {ok:false,reason:'invalid'}}
  const product=demoProduct(t.version);
  if(!product||t.schema!==1||t.scope!=='an-store-demo-only'||t.phase!==phase||
    t.amount!==product.priceVnd||typeof t.order!=='string'||
    !/^[a-f0-9-]{36}$/.test(t.order)||!Number.isSafeInteger(t.issued)||
    !Number.isSafeInteger(t.expires)||t.expires-t.issued!==(phase==='quote'?QUOTE_SECONDS:FULFILLED_SECONDS)||
    t.issued>now+60)return {ok:false,reason:'invalid'};
  if(t.expires<now)return {ok:false,reason:'expired'};
  return {ok:true,ticket:t};
}
export const demoResponse=(body:unknown,status=200)=>Response.json(body,{status,headers:{
  'Cache-Control':'no-store, private','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'
}});
export function demoSameOrigin(r:Request){
  const raw=r.headers.get('origin');
  if(!raw)return false;
  try{
    const origin=new URL(raw),url=new URL(r.url);
    if(origin.origin===url.origin)return true;
    // Next.js may internally canonicalize 127.0.0.1 to localhost in local CI.
    // Compare with the actual request Host while still requiring the same scheme.
    const requestHost=r.headers.get('host');
    const protocol=r.headers.get('x-forwarded-proto')||url.protocol.slice(0,-1);
    return !!requestHost && origin.host===requestHost && origin.protocol===protocol+':';
  }catch{return false}
}
export function demoOrder(ticket:Ticket){
  const v=demoProduct(ticket.version)!;
  return {orderId:ticket.order,version:v.id,name:v.name,amount:v.priceVnd,
    expiresAt:new Date(ticket.expires*1000).toISOString(),
    status:ticket.phase==='quote'?'DEMO_PENDING':'DEMO_FULFILLED',
    paid:false,isDemo:true,captionCount:v.captionCount,groupCount:v.groupCount};
}
