import {planForAmount} from '../../../lib/plans';
import {and,eq,isNull,gt} from 'drizzle-orm';
import {getDb} from '../../../db';
import {accessCodes,orders} from '../../../db/schema';
import {digest,valid,json,sameOrigin} from '../../../lib/access';
async function planForCode(hash:string){const [order]=await getDb().select().from(orders).where(and(eq(orders.codeHash,hash),eq(orders.status,'PAID'))).limit(1);return planForAmount(order?.amount||39000)}
export async function POST(r:Request){
 if(!sameOrigin(r))return json({error:'Yêu cầu không hợp lệ.'},403);
 let code,session;try{const b=await r.json() as {code:string,session:string};code=b.code?.trim();session=b.session}catch{return json({error:'Mã không hợp lệ.'},400)}
 if(!code||!/^[a-f0-9]{64}$/.test(code)||!session||!/^[a-f0-9]{64}$/.test(session))return json({error:'Dán đầy đủ mã và thử lại.'},400);
 const db=getDb(),hash=await digest(code),sessionHash=await digest(session);
 const [row]=await db.select().from(accessCodes).where(eq(accessCodes.hash,hash)).limit(1);
 if(!row||row.revoked||row.expires<=Date.now())return json({error:'Mã không đúng, hết hạn hoặc đã thu hồi.'},403);
 if(!row.singleUse)return json({path:'/download/'+code+'/Locket_ifywnx.sgmodule',plan:await planForCode(hash)});
 const changed=await db.update(accessCodes).set({sessionHash,activated:Date.now()}).where(and(eq(accessCodes.id,row.id),isNull(accessCodes.sessionHash),eq(accessCodes.revoked,0),gt(accessCodes.expires,Date.now()))).returning({id:accessCodes.id});
 // Retry from the same browser is safe after a lost network response.
 const [current]=changed.length?[]:await db.select().from(accessCodes).where(eq(accessCodes.id,row.id)).limit(1);
 if(!changed.length && (current?.sessionHash!==sessionHash||current.revoked||current.expires<=Date.now()))return json({error:'Mã này đã kích hoạt ở phiên khác. Liên hệ ifywnx nếu cần hỗ trợ.'},409);
 return json({path:'/download/'+session+'/Locket_ifywnx.sgmodule',plan:await planForCode(hash)});
}
export async function GET(r:Request){const token=r.headers.get('authorization')?.replace(/^Bearer /,'')||'';if(!await valid(token))return json({error:'Phiên không còn hiệu lực.'},403);const hash=await digest(token);const [row]=await getDb().select().from(accessCodes).where(eq(accessCodes.sessionHash,hash)).limit(1);return json({path:'/download/'+token+'/Locket_ifywnx.sgmodule',plan:await planForCode(row?.hash||hash)})}
