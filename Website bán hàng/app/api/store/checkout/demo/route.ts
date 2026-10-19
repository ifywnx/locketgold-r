import {and,eq} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {storeOrders} from '../../../../db/schema';
import {digest,json,sameOrigin} from '../../../../lib/access';
export async function POST(r:Request){
 if(!sameOrigin(r))return json({error:'Nguồn yêu cầu không hợp lệ.'},403);
 const token=r.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 if(!/^[a-f0-9]{64}$/.test(token))return json({error:'Thiếu phiên đơn hàng.'},401);
 let orderCode:unknown;
 try{({orderCode}=await r.json())}catch{return json({error:'Mã đơn không hợp lệ.'},400)}
 if(!Number.isSafeInteger(orderCode)||Number(orderCode)<=0)return json({error:'Mã đơn không hợp lệ.'},400);
 const db=getDb(),hash=await digest(token);
 const [row]=await db.select().from(storeOrders).where(and(eq(storeOrders.id,Number(orderCode)),eq(storeOrders.ownerHash,hash))).limit(1);
 if(!row||row.mode!=='demo')return json({error:'Đơn thử nghiệm không tồn tại.'},404);
 if(row.status==='DEMO_COMPLETED')return json({status:'DEMO_COMPLETED'});
 if(row.status!=='DEMO_PENDING')return json({error:'Đơn không thể xác nhận thử.'},409);
 await db.update(storeOrders).set({status:'DEMO_COMPLETED'}).where(and(eq(storeOrders.id,row.id),eq(storeOrders.status,'DEMO_PENDING')));
 // Demo completion NEVER issues licenses, access codes or changes existing paid orders.
 return json({status:'DEMO_COMPLETED'});
}
