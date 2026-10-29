import {PLANS,parsePlan,planForAmount} from '../../../lib/plans';
import catalog from '../../../lib/version-catalog.json';
import {and,eq,gt,lt,count} from 'drizzle-orm';
import {getDb} from '../../../db';
import {orders} from '../../../db/schema';
import {digest,newToken,json,sameOrigin} from '../../../lib/access';
import {sign,verify,seal,unseal} from '../../../lib/payment-crypto';
import {ACCOUNT,BIN,payos,secrets,settle} from '../../../lib/payos';
function owner(r:Request){const v=r.headers.get('authorization')?.replace(/^Bearer /,'')||'';return /^[a-f0-9]{64}$/.test(v)?v:null}
export async function POST(r:Request){
 if(!sameOrigin(r))return json({error:'Yêu cầu không hợp lệ.'},403);
 // A displayed price is not an open sale; disable all new checkouts server-side.
 if(catalog.paymentStatus!=='enabled')return json({error:'An Store chưa mở thanh toán. Bạn vẫn có thể xem bộ cài thử.',salesEnabled:false},410);
 let plan;try{const b=await r.json() as {plan?:unknown};plan=parsePlan(b.plan)}catch{return json({error:'Chọn gói hợp lệ.'},400)}
 if(!plan)return json({error:'Chọn gói hợp lệ.'},400);
 // Retired bundle: preserve existing paid orders and access, reject *new* Plus orders.
 if(plan==='plus')return json({error:'Gói 129.000đ đã ngừng mở bán. Vui lòng chọn V1 hoặc V2.'},410);
 const amount=PLANS[plan];
 const token=owner(r);if(!token)return json({error:'Thiếu phiên đặt hàng.'},400);
 const db=getDb(),ownerHash=await digest(token),now=Date.now();
 const [existing]=await db.select().from(orders).where(eq(orders.ownerHash,ownerHash)).orderBy(orders.created).limit(1);
 if(existing && existing.amount!==amount)return json({error:'Phiên này đã có đơn khác gói. Hoàn tất hoặc huỷ đơn trước.'},409);
 if(existing?.checkoutUrl)return json({orderCode:existing.id,checkoutUrl:existing.checkoutUrl,amount:existing.amount,plan:planForAmount(existing.amount)});
 if(existing)return json({error:'Đơn đang được xử lý. Chờ một lát rồi thử lại.'},409);
 const [recent]=await db.select({n:count()}).from(orders).where(gt(orders.created,now-60000));
 if(recent.n>=20)return json({error:'Có nhiều đơn đang tạo. Vui lòng thử lại sau một phút.'},429);
 const id=now*1000+crypto.getRandomValues(new Uint32Array(1))[0]%1000;
 const code=newToken(),s=secrets();
 await db.insert(orders).values({id,ownerHash,amount,status:'CREATING',created:now,codeHash:await digest(code),codeCipher:await seal(code,s.PAYOS_CHECKSUM_KEY)});
 try{
 const origin=r.headers.get('origin')==='https://ifywnx.netlify.app'?'https://ifywnx.netlify.app':new URL(r.url).origin;
 const body={amount,cancelUrl:origin+'/?payment=cancelled',description:'An Store',orderCode:id,returnUrl:origin+'/?payment=return'};
 const res=await payos('/v2/payment-requests',{...body,signature:await sign(body,s.PAYOS_CHECKSUM_KEY),expiredAt:Math.floor(now/1000)+1800});
 const d=res.data;
 if(!await verify(d,res.signature,s.PAYOS_CHECKSUM_KEY)||(d.accountNumber!==ACCOUNT && !(typeof d.accountNumber==='string'&&/^VQR[A-Z0-9]{5,}$/.test(d.accountNumber)))||d.bin!==BIN||d.amount!==amount||d.orderCode!==id||typeof d.paymentLinkId!=='string'||typeof d.checkoutUrl!=='string'||new URL(d.checkoutUrl).origin!=='https://pay.payos.vn')throw Error('Kênh payOS chưa khớp tài khoản MB Bank đã chọn.');
 await db.update(orders).set({status:'PENDING',paymentAccount:d.accountNumber as string,linkId:d.paymentLinkId,checkoutUrl:d.checkoutUrl}).where(eq(orders.id,id));
 return json({orderCode:id,checkoutUrl:d.checkoutUrl,amount,plan});
 }catch{await db.update(orders).set({status:'ERROR'}).where(eq(orders.id,id));return json({error:'Chưa tạo được thanh toán đúng tài khoản MB Bank. Vui lòng liên hệ An; chưa cần chuyển tiền.'},502)}
}
export async function GET(r:Request){
 const token=owner(r);if(!token)return json({error:'Thiếu phiên đặt hàng.'},401);
 const id=Number(new URL(r.url).searchParams.get('order'));if(!Number.isSafeInteger(id)||id<=0)return json({error:'Đơn không hợp lệ.'},400);
 const db=getDb();let [order]=await db.select().from(orders).where(and(eq(orders.id,id),eq(orders.ownerHash,await digest(token)))).limit(1);
 if(!order)return json({error:'Không tìm thấy đơn của bạn.'},404);
 if(order.status!=='PAID'&&order.linkId){
 const now=Date.now();const claimed=await db.update(orders).set({checked:now}).where(and(eq(orders.id,id),lt(orders.checked,now-10000))).returning({id:orders.id});
 if(claimed.length){try{await settle(order)}catch{/* Do not mark paid on provider error. */}}
 [order]=await db.select().from(orders).where(eq(orders.id,id)).limit(1);
 }
 return json({status:order.status,amount:order.amount,plan:planForAmount(order.amount),...(order.status==='PAID'?{code:await unseal(order.codeCipher,secrets().PAYOS_CHECKSUM_KEY)}:{})});
}
