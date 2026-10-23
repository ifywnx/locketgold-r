import {and, count, desc, eq, gte, sql, type SQL} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {storeOrders} from '../../../../db/schema';
import {admin, json} from '../../../../lib/access';
import {STORE_PRODUCTS} from '../../../../lib/store-products';
import {storeMode} from '../../../../lib/store-payments';

export const dynamic='force-dynamic';
const statuses=['DEMO_COMPLETED','DEMO_PENDING','CREATING','PENDING','PAID_AWAITING_DELIVERY','CANCELLED','EXPIRED','ERROR'] as const;
type Status=(typeof statuses)[number];
const limit=20;
const formatDay=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'});
function dayKey(ms:number){
  const fields=formatDay.formatToParts(new Date(ms));
  const value=(type:string)=>fields.find(x=>x.type===type)?.value||'00';
  return value('year')+'-'+value('month')+'-'+value('day');
}
function whereClause(start:number,mode:string,status:string,search:string):SQL|undefined{
  const parts:SQL[]=[gte(storeOrders.created,start)];
  if(mode==='demo'||mode==='live')parts.push(eq(storeOrders.mode,mode));
  if(statuses.includes(status as Status))parts.push(eq(storeOrders.status,status));
  if(search){
    const id=Number(search);
    if(!Number.isSafeInteger(id)||id<=0)return sql`1=0`;
    parts.push(eq(storeOrders.id,id));
  }
  return and(...parts);
}
const num=(value:unknown)=>Number(value||0)||0;

export async function GET(request:Request){
  if(!await admin())return json({error:'Bạn không có quyền xem dữ liệu cửa hàng.'},403);
  const params=new URL(request.url).searchParams;
  const wanted=Number(params.get('days')||30);
  const days=[7,30,90].includes(wanted)?wanted:30;
  const mode=params.get('mode')||'all';
  const status=params.get('status')||'all';
  const search=(params.get('search')||'').trim();
  if(search&&!/^\d{1,16}$/.test(search))
    return json({error:'Mã đơn phải là dãy số hợp lệ (tối đa 16 chữ số).'},400);
  const requestedPage=Number(params.get('page')||1);
  const page=Number.isSafeInteger(requestedPage)?Math.min(Math.max(requestedPage,1),10000):1;
  const now=Date.now(),start=now-days*86400000;
  const db=getDb(),rangeWhere=gte(storeOrders.created,start);
  const filtered=whereClause(start,mode,status,search);
  const [totalResult,orders,groups,trend]=await Promise.all([
    db.select({value:count()}).from(storeOrders).where(filtered),
    db.select({
      id:storeOrders.id,itemsJson:storeOrders.itemsJson,amount:storeOrders.amount,
      status:storeOrders.status,mode:storeOrders.mode,created:storeOrders.created,
      paid:storeOrders.paid
    }).from(storeOrders).where(filtered).orderBy(desc(storeOrders.created),desc(storeOrders.id))
      .limit(limit).offset((page-1)*limit),
    db.select({
      mode:storeOrders.mode,status:storeOrders.status,n:count(),
      total:sql<number>`coalesce(sum(${storeOrders.amount}),0)`
    }).from(storeOrders).where(rangeWhere).groupBy(storeOrders.mode,storeOrders.status),
    db.select({
      day:sql<string>`date(${storeOrders.created}/1000,'unixepoch','+7 hours')`,
      mode:storeOrders.mode,n:count()
    }).from(storeOrders).where(rangeWhere)
      .groupBy(sql`date(${storeOrders.created}/1000,'unixepoch','+7 hours')`,storeOrders.mode)
  ]);
  const groupCount=(m:string,s:string)=>num(groups.find(row=>row.mode===m&&row.status===s)?.n);
  const demoCount=groups.filter(row=>row.mode==='demo').reduce((n,row)=>n+num(row.n),0);
  const liveCount=groups.filter(row=>row.mode==='live').reduce((n,row)=>n+num(row.n),0);
  const livePaid=groups.find(row=>row.mode==='live'&&row.status==='PAID_AWAITING_DELIVERY');
  const total=num(totalResult[0]?.value);
  const timeline=new Map<string,{date:string,demo:number,live:number}>();
  for(let index=days-1;index>=0;index--){
    const key=dayKey(now-index*86400000);
    timeline.set(key,{date:key,demo:0,live:0});
  }
  for(const item of trend){
    const row=timeline.get(item.day);
    if(row&&(item.mode==='demo'||item.mode==='live'))row[item.mode]=num(item.n);
  }

  // Count product selections without exposing session identifiers or customer data.
  let productCounts:Record<string,{demo:number,live:number}>={};
  try{
    const raw=await db.all(sql`
      SELECT j.value AS sku, so.mode AS mode, COUNT(*) AS quantity
      FROM store_orders so, json_each(so.items_json) j
      WHERE so.created >= ${start}
      GROUP BY j.value,so.mode
    `) as unknown as Array<{sku:string,mode:string,quantity:number}>;
    for(const row of raw){
      if(!Object.prototype.hasOwnProperty.call(STORE_PRODUCTS,row.sku))continue;
      const item=productCounts[row.sku]||{demo:0,live:0};
      if(row.mode==='demo'||row.mode==='live')item[row.mode]=num(row.quantity);
      productCounts[row.sku]=item;
    }
  }catch{/* A provider without JSON1 does not break order reporting. */}
  const productPopularity=Object.entries(STORE_PRODUCTS).map(([id,product])=>({
    id,name:product.name,demo:productCounts[id]?.demo||0,live:productCounts[id]?.live||0
  })).sort((a,b)=>(b.demo+b.live)-(a.demo+a.live));
  const safeOrders=orders.map(order=>{
    let ids:string[]=[];
    try{
      const parsed=JSON.parse(order.itemsJson);
      if(Array.isArray(parsed))ids=parsed.filter((item):item is string=>typeof item==='string').slice(0,7);
    }catch{/* Unreadable legacy order payloads remain visible. */}
    return {
      id:order.id,created:order.created,mode:order.mode,status:order.status,
      quotedAmount:order.amount,paid:order.paid,
      eligibleForFiles:(order.mode==='demo'&&order.status==='DEMO_COMPLETED')||
        (order.mode==='live'&&order.status==='PAID_AWAITING_DELIVERY'&&!!order.paid),
      products:ids.map(id=>({id,name:STORE_PRODUCTS[id as keyof typeof STORE_PRODUCTS]?.name||'Gói không xác định'}))
    };
  });
  return json({
    readonly:true,storeMode:storeMode(),
    period:{days,from:start,to:now},
    metrics:{
      allOrders:demoCount+liveCount,demoOrders:demoCount,liveOrders:liveCount,
      verifiedLiveOrders:num(livePaid?.n),verifiedRevenue:num(livePaid?.total),
      awaitingPayment:groupCount('live','CREATING')+groupCount('live','PENDING'),
      eligibleForFiles:groupCount('demo','DEMO_COMPLETED')+groupCount('live','PAID_AWAITING_DELIVERY'),
      errors:groupCount('demo','ERROR')+groupCount('live','ERROR')
    },
    trend:[...timeline.values()],productPopularity,
    pagination:{page,pageSize:limit,total,pages:Math.ceil(total/limit)},
    filters:{mode,status,search},
    orders:safeOrders
  });
}