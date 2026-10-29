import catalog from '../../../../lib/version-catalog.json';
import {and,eq} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {versionOrders} from '../../../../db/schema';
import {digest,json} from '../../../../lib/access';

// Read-only order inspection for a future legitimate V1/V2/V3 checkout.
// Never infer SKU solely from amount; legacy Plus also cost 129,000 VND.
export async function GET(r:Request,{params}:{params:Promise<{version:string}>}){
  const {version}=await params;
  const catalogItem=catalog.versions.find(v=>v.id===version);
  if(!catalogItem)return json({error:'Không tìm thấy phiên bản này.'},404);
  const owner=(r.headers.get('authorization')||'').replace(/^Bearer /,'');
  if(!/^[a-f0-9]{64}$/.test(owner))return json({error:'Thiếu phiên truy cập hợp lệ.'},401);
  const rawId=new URL(r.url).searchParams.get('order')||'';
  if(!/^[1-9][0-9]*$/.test(rawId)||!Number.isSafeInteger(Number(rawId)))
    return json({error:'Mã đơn không hợp lệ.'},400);
  const [order]=await getDb().select().from(versionOrders).where(and(
    eq(versionOrders.id,Number(rawId)),
    eq(versionOrders.ownerHash,await digest(owner)),
    eq(versionOrders.versionId,catalogItem.id)
  )).limit(1);
  if(!order)return json({error:'Không tìm thấy đơn đã xác minh của đúng phiên bản.'},404);
  if(order.status!=='PAID'||!order.paid)return json({error:'Đơn chưa được xác nhận thanh toán.'},403);
  if(order.amount!==catalogItem.priceVnd)return json({error:'Giá hoặc phiên bản không khớp.'},409);
  return json({version:catalogItem.id,amount:order.amount,paidAt:order.paid,
    entitlement:'verified',installReady:false,
    message:'Đơn được xác minh nhưng chưa mở đường tải trả phí trên môi trường bán hàng.'});
}
