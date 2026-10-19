const env=process.env;
import {and,eq,or,gt} from 'drizzle-orm';
import {getDb} from '../../../db';
import {accessCodes,orders} from '../../../db/schema';
import {valid,digest,json} from '../../../lib/access';
export async function GET(r:Request){
 const token=r.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 if(!await valid(token))return json({error:'Phiên không hợp lệ.'},403);
 const hash=await digest(token),db=getDb();
 const [order]=await db.select({id:orders.id}).from(orders).innerJoin(accessCodes,eq(orders.codeHash,accessCodes.hash)).where(and(or(eq(accessCodes.sessionHash,hash),and(eq(accessCodes.hash,hash),eq(accessCodes.singleUse,0))),eq(accessCodes.revoked,0),gt(accessCodes.expires,Date.now()),or(eq(orders.amount,129000),eq(orders.amount,59000)),eq(orders.status,'PAID'))).limit(1);
 if(!order)return json({error:'Mục này dành cho gói 59k.'},403);
 const e=env as unknown as Record<string,string>;
 if(!e.SHARED_APPLE_EMAIL||!e.SHARED_APPLE_PASSWORD)return json({error:'Liên hệ ifywnx để nhận tài khoản tải ứng dụng.'},503);
 return json({email:e.SHARED_APPLE_EMAIL,password:e.SHARED_APPLE_PASSWORD});
}
