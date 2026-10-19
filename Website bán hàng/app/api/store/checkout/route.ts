import {and,eq,gt,count,lt} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {storeOrders} from '../../../../db/schema';
import {quoteStoreCart,STORE_PRODUCTS} from '../../../../lib/store-products';
import {storeMode,verifyStorePaid} from '../../../../lib/store-payments';
import {digest,json,sameOrigin} from '../../../../lib/access';
import {sign,verify} from '../../../../lib/payment-crypto';
import {payos,secrets} from '../../../../lib/payos';

function owner(r:Request){
 const v=r.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 return /^[a-f0-9]{64}$/.test(v)?v:null;
}
export async function POST(r:Request){
 if(!sameOrigin(r))return json({error:'Nguồn yêu cầu không hợp lệ.'},403);
 const token=owner(r);
 if(!token)return json({error:'Thiếu phiên đặt hàng.'},401);
 let body:unknown;
 try{if(Number(r.headers.get('content-length')||0)>4096)return json({error:'Dữ liệu quá lớn.'},413);body=await r.json()}catch{return json({error:'Giỏ hàng không hợp lệ.'},400)}
 const quote=quoteStoreCart((body as {items?:unknown})?.items);
 if(!quote)return json({error:'Chọn 1–5 bộ caption hợp lệ.'},400);
 const db=getDb(),now=Date.now(),mode=storeMode(),ownerHash=await digest(token);
 const [rate]=await db.select({n:count()}).from(storeOrders).where(gt(storeOrders.created,now-60000));
 if((rate?.n||0)>=15)return json({error:'Có nhiều yêu cầu. Vui lòng thử lại sau một phút.'},429);
 const id=now*1000+crypto.getRandomValues(new Uint32Array(1))[0]%1000;
 const itemsJson=JSON.stringify(quote.items);
 await db.insert(storeOrders).values({id,ownerHash,itemsJson,amount:quote.amount,mode,
   status:mode==='demo'?'DEMO_PENDING':'CREATING',created:now});
 if(mode==='demo')return json({orderCode:id,amount:quote.amount,items:quote.items,mode,
   checkoutUrl:'/store/checkout.html?order='+id});
 try{
   const origin=new URL(r.url).origin;
   const s=secrets();
   const base={amount:quote.amount,cancelUrl:origin+'/store/checkout.html?order='+id+'&result=cancel',
    description:'An Store',orderCode:id,
    returnUrl:origin+'/store/checkout.html?order='+id+'&result=return'};
   const signed={...base,signature:await sign(base,s.PAYOS_CHECKSUM_KEY),expiredAt:Math.floor(now/1000)+1800};
   const response=await payos('/v2/payment-requests',signed),data=response.data;
   if(!await verify(data,response.signature,s.PAYOS_CHECKSUM_KEY) ||
      data.orderCode!==id||data.amount!==quote.amount||
      typeof data.accountNumber!=='string'||data.accountNumber!==process.env.PAYOS_EXPECTED_ACCOUNT_NUMBER||
      typeof data.paymentLinkId!=='string'||typeof data.checkoutUrl!=='string'||
      new URL(data.checkoutUrl).origin!=='https://pay.payos.vn')
     throw Error('Sai kênh thanh toán hoặc chữ ký không hợp lệ');
   await db.update(storeOrders).set({status:'PENDING',checkoutUrl:data.checkoutUrl,
     linkId:data.paymentLinkId,paymentAccount:data.accountNumber}).where(eq(storeOrders.id,id));
   return json({orderCode:id,amount:quote.amount,items:quote.items,mode,checkoutUrl:data.checkoutUrl});
 }catch{
   await db.update(storeOrders).set({status:'ERROR'}).where(eq(storeOrders.id,id));
   return json({error:'Không tạo được link payOS trên kênh đã xác minh. Chưa chuyển tiền.'},502);
 }
}
export async function GET(r:Request){
 if(new URL(r.url).searchParams.get('catalog')==='1')
   return json({mode:storeMode(),products:Object.entries(STORE_PRODUCTS).map(([id,p])=>({id,name:p.name,price:p.price}))});
 const token=owner(r);
 if(!token)return json({error:'Không tìm thấy phiên của đơn hàng.'},401);
 const id=Number(new URL(r.url).searchParams.get('order'));
 if(!Number.isSafeInteger(id)||id<=0)return json({error:'Mã đơn không hợp lệ.'},400);
 const db=getDb();
 const hash=await digest(token);
 let [order]=await db.select().from(storeOrders).where(and(eq(storeOrders.id,id),eq(storeOrders.ownerHash,hash))).limit(1);
 if(!order)return json({error:'Đơn không thuộc phiên này hoặc đã hết hạn.'},404);
 if(order.mode==='live'&&order.linkId&&order.status==='PENDING'&&Date.now()-order.checked>10000){
   await db.update(storeOrders).set({checked:Date.now()}).where(and(eq(storeOrders.id,id),lt(storeOrders.checked,Date.now()-10000)));
   try{await verifyStorePaid(order)}catch{/* Never mark paid on verification failure. */}
   [order]=await db.select().from(storeOrders).where(and(eq(storeOrders.id,id),eq(storeOrders.ownerHash,hash))).limit(1);
 }
 if(!order)return json({error:'Đơn không còn tồn tại.'},404);
 const ids=JSON.parse(order.itemsJson) as (keyof typeof STORE_PRODUCTS)[];
 return json({orderCode:order.id,amount:order.amount,mode:order.mode,status:order.status,
   items:ids.map(id=>({id,name:STORE_PRODUCTS[id]?.name||id,price:STORE_PRODUCTS[id]?.price||0})),
   created:order.created,checkoutUrl:order.mode==='live'?order.checkoutUrl:undefined});
}
