import {and,eq} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {storeOrders} from '../../../../db/schema';
import {digest,json} from '../../../../lib/access';
import {makeLinks,productExists} from '../../../../lib/store-delivery';

export async function GET(req:Request){
  const token=req.headers.get('authorization')?.replace(/^Bearer /,'')||'';
  const orderId=Number(new URL(req.url).searchParams.get('order'));
  if(!/^[a-f0-9]{64}$/.test(token))return json({error:'Thiếu phiên đơn hàng.'},401);
  if(!Number.isSafeInteger(orderId)||orderId<=0)return json({error:'Mã đơn không hợp lệ.'},400);
  const [order]=await getDb().select().from(storeOrders).where(and(eq(storeOrders.id,orderId),eq(storeOrders.ownerHash,await digest(token)))).limit(1);
  if(!order)return json({error:'Đơn không tồn tại trong phiên này.'},404);
  const demo=order.mode==='demo'&&order.status==='DEMO_COMPLETED';
  const live=order.mode==='live'&&order.status==='PAID_AWAITING_DELIVERY'&&!!order.paid;
  if(!demo&&!live)return json({error:'Chưa hoàn tất thanh toán hoặc đơn chưa được xác minh.'},403);
  let keys:unknown;
  try{keys=JSON.parse(order.itemsJson)}catch{return json({error:'Danh sách sản phẩm không hợp lệ.'},500)}
  if(!Array.isArray(keys)||!keys.every(k=>typeof k==='string'&&productExists(k)))
    return json({error:'Danh sách sản phẩm không hợp lệ.'},500);
  try{
    const origin=new URL(req.url).origin;
    return json({orderCode:orderId,mode:demo?'demo':'live',
      note:demo?'File DEMO: chỉ 1 caption thử cho mỗi nhóm. Không cấp gói đã mua.':'File Caption Only: chưa xác minh khả năng hoạt động trên Locket thực tế.',
      packs:keys.map(k=>makeLinks(origin,orderId,k))});
  }catch{return json({error:'Chưa thiết lập dịch vụ tạo liên kết tải file.'},503)}
}
