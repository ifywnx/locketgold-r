import {eq} from 'drizzle-orm';
import {getDb} from '../db';
import {storeOrders} from '../db/schema';
import {verify} from './payment-crypto';
import {payos,secrets} from './payos';

export type StoreOrder=typeof storeOrders.$inferSelect;
export function storeMode(): 'demo'|'live' {
  const e=process.env;
  // Test checkout is the default, regardless of any payOS keys being configured.
  return e.STORE_PAYMENTS_MODE==='live' &&
    e.STORE_FULFILLMENT_READY==='true' &&
    e.STORE_PRICES_APPROVED==='true' &&
    e.STORE_FILES_READY==='true' && e.STORE_DOWNLOAD_SECRET?.length>=32 &&
    !!e.PAYOS_EXPECTED_ACCOUNT_NUMBER &&
    !!e.PAYOS_CLIENT_ID && !!e.PAYOS_API_KEY && !!e.PAYOS_CHECKSUM_KEY ? 'live':'demo';
}
export async function verifyStorePaid(order:StoreOrder){
  if(order.mode!=='live'||!order.linkId||order.status==='PAID_AWAITING_DELIVERY')return false;
  const response=await payos('/v2/payment-requests/'+order.id);
  const data=response.data;
  if(!await verify(data,response.signature,secrets().PAYOS_CHECKSUM_KEY))throw Error('Invalid payOS response signature');
  if(data.id!==order.linkId||data.orderCode!==order.id||data.amount!==order.amount)
    throw Error('Store order mismatch');
  // payOS GET may omit accountNumber; the initial signed create response and
  // webhook verify the destination account. Check it here only if present.
  if(typeof data.accountNumber==='string' &&
     (data.accountNumber!==order.paymentAccount||data.accountNumber!==process.env.PAYOS_EXPECTED_ACCOUNT_NUMBER))
    throw Error('Store recipient mismatch');
  const db=getDb();
  if(data.status==='CANCELLED'||data.status==='EXPIRED'){
    await db.update(storeOrders).set({status:String(data.status)}).where(eq(storeOrders.id,order.id));
    return false;
  }
  if(data.status!=='PAID'||typeof data.amountPaid!=='number'||data.amountPaid<order.amount)return false;
  await db.update(storeOrders).set({status:'PAID_AWAITING_DELIVERY',paid:Date.now()}).where(eq(storeOrders.id,order.id));
  // Do not issue access tokens for an integration that has not been validated.
  return true;
}
