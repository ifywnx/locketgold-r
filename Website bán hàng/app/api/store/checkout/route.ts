import {and,eq,lt} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {storeOrders} from '../../../../db/schema';
import {STORE_PRODUCTS} from '../../../../lib/store-products';
import {verifyStorePaid} from '../../../../lib/store-payments';
import {digest,json} from '../../../../lib/access';

// Retired 2026-10-29: disable all *new* standalone caption checkout requests,
// regardless of demo/live configuration; do not mutate the historical ledger.
export async function POST(){
  return json({error:'An Store đã ngừng nhận đơn caption lẻ. Vui lòng xem lộ trình các phiên bản V1–V6.',salesEnabled:false},410);
}

function owner(r:Request){
  const v=r.headers.get('authorization')?.replace(/^Bearer /,'')||'';
  return /^[a-f0-9]{64}$/.test(v)?v:null;
}

export async function GET(r:Request){
  // Do not advertise the retired standalone product prices or new checkout.
  if(new URL(r.url).searchParams.get('catalog')==='1')
    return json({mode:'retired',salesEnabled:false,products:[],message:'Không còn bán caption lẻ. Xem các phiên bản trên trang chủ.'});
  const token=owner(r);
  if(!token)return json({error:'Không tìm thấy phiên của đơn hàng.'},401);
  const id=Number(new URL(r.url).searchParams.get('order'));
  if(!Number.isSafeInteger(id)||id<=0)return json({error:'Mã đơn không hợp lệ.'},400);
  const db=getDb(),hash=await digest(token);
  let [order]=await db.select().from(storeOrders)
    .where(and(eq(storeOrders.id,id),eq(storeOrders.ownerHash,hash))).limit(1);
  if(!order)return json({error:'Đơn không thuộc phiên này hoặc đã hết hạn.'},404);
  // Existing orders and entitlements remain available, including verified live orders.
  if(order.mode==='live'&&order.linkId&&order.status==='PENDING'&&Date.now()-order.checked>10000){
    await db.update(storeOrders).set({checked:Date.now()})
      .where(and(eq(storeOrders.id,id),lt(storeOrders.checked,Date.now()-10000)));
    try{await verifyStorePaid(order)}catch{/* Never mark paid on failed verification. */}
    [order]=await db.select().from(storeOrders)
      .where(and(eq(storeOrders.id,id),eq(storeOrders.ownerHash,hash))).limit(1);
  }
  if(!order)return json({error:'Đơn không còn tồn tại.'},404);
  let ids:string[]=[];
  try{
    const data=JSON.parse(order.itemsJson);
    if(Array.isArray(data))ids=data.filter((v):v is string=>typeof v==='string');
  }catch{return json({error:'Dữ liệu đơn đã lưu không hợp lệ.'},500)}
  return json({orderCode:order.id,amount:order.amount,mode:order.mode,status:order.status,
    items:ids.map(id=>({id,name:STORE_PRODUCTS[id as keyof typeof STORE_PRODUCTS]?.name||id,
      price:STORE_PRODUCTS[id as keyof typeof STORE_PRODUCTS]?.price||0})),
    created:order.created,checkoutUrl:order.mode==='live'?order.checkoutUrl:undefined});
}
