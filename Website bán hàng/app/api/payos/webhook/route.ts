import {eq} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {orders} from '../../../../db/schema';
import {json} from '../../../../lib/access';
import {verify} from '../../../../lib/payment-crypto';
import {ACCOUNT,secrets,settle} from '../../../../lib/payos';
export async function POST(r:Request){
 if(Number(r.headers.get('content-length')||0)>16384)return json({error:'Too large'},413);
 let b;try{const raw=await r.text();if(raw.length>16384)return json({error:'Too large'},413);b=JSON.parse(raw)}catch{return json({error:'Invalid JSON'},400)}
 try{
 if(!b.data||!await verify(b.data,b.signature,secrets().PAYOS_CHECKSUM_KEY))return json({error:'Invalid signature'},401);
 const d=b.data;
 // Signed test/unknown events are acknowledged without creating any entitlement.
 if(b.code!=='00'||b.success!==true||d.code!=='00')return json({success:true});
 if(!Number.isSafeInteger(d.orderCode))return json({success:true});
 const [order]=await getDb().select().from(orders).where(eq(orders.id,d.orderCode)).limit(1);
 if(!order||order.status==='PAID')return json({success:true});
 if(d.currency!=='VND'||d.amount!==order.amount||(d.accountNumber!==ACCOUNT&&d.accountNumber!==order.paymentAccount)||d.paymentLinkId!==order.linkId)return json({error:'Payment mismatch'},400);
 if(!await settle(order))return json({error:'Payment not settled'},409);
 return json({success:true});
 }catch{return json({error:'Verification unavailable'},503)}
}
