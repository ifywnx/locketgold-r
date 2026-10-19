import {verify} from './payment-crypto';
const env=process.env;
import {eq} from 'drizzle-orm';
import {getDb} from '../db';
import {orders,accessCodes} from '../db/schema';
export const PRICE=39000, ACCOUNT='0366663940', BIN='970422';
export function secrets(){const e=env as unknown as Record<string,string>;if(!e.PAYOS_CLIENT_ID||!e.PAYOS_API_KEY||!e.PAYOS_CHECKSUM_KEY)throw Error('Thanh toán chưa được cấu hình.');return e}
export async function payos(path:string,body?:unknown){
 const s=secrets();const r=await fetch('https://api-merchant.payos.vn'+path,{method:body?'POST':'GET',headers:{'x-client-id':s.PAYOS_CLIENT_ID,'x-api-key':s.PAYOS_API_KEY,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(15000)});
 const d=await r.json() as {code:string,data:Record<string,unknown>,signature?:string};
 if(!r.ok||d.code!=='00'||!d.data)throw Error('payOS chưa xử lý được yêu cầu. Vui lòng thử lại.');return d;
}
export async function settle(order:typeof orders.$inferSelect){
 const response=await payos('/v2/payment-requests/'+order.id);const {data}=response;
 if(!await verify(data,response.signature,secrets().PAYOS_CHECKSUM_KEY))throw Error('Invalid payment response signature');
 if(data.id!==order.linkId||data.orderCode!==order.id||data.amount!==order.amount)throw Error('Thông tin đơn không khớp.');
 if(data.status==='CANCELLED'||data.status==='EXPIRED'){await getDb().update(orders).set({status:data.status}).where(eq(orders.id,order.id));return false;}
 if(data.status!=='PAID'||typeof data.amountPaid!=='number'||data.amountPaid<order.amount)return false;
 const db=getDb(),now=Date.now();
 // A batch is atomic; the primary key guarantees one access code per order.
 await db.batch([
 db.insert(accessCodes).values({id:'payos:'+order.id,label:'payOS #'+order.id,hash:order.codeHash,expires:253402300799000,singleUse:1,created:now}).onConflictDoNothing(),
 db.update(orders).set({status:'PAID',paid:now}).where(eq(orders.id,order.id))
 ]);return true;
}
