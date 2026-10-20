import {publicOrigin} from '../../../../../../lib/access';
import {eq} from 'drizzle-orm';
import {getDb} from '../../../../../../db';
import {storeOrders} from '../../../../../../db/schema';
import {checkSignature,productExists,productScript,productConfig,productJson} from '../../../../../../lib/store-delivery';

type Context={params:Promise<{order:string,filename:string}>};
export async function GET(req:Request,{params}:Context){
  const {order:rawId,filename}=await params;
  const id=Number(rawId);
  const match=/^([a-z0-9_-]+)\.(sgmodule|conf|js|json)$/.exec(filename);
  const query=new URL(req.url).searchParams;
  const expiry=Number(query.get('exp'));
  const signature=query.get('sig')||'';
  if(!Number.isSafeInteger(id)||id<=0||!match||!productExists(match[1])||
     !checkSignature(id,match[1],expiry,signature)){
    return Response.json({error:'Liên kết tải file không hợp lệ hoặc đã hết hạn.'},{status:403,headers:{'Cache-Control':'no-store'}});
  }
  const sku=match[1],kind=match[2];
  const [saved]=await getDb().select().from(storeOrders).where(eq(storeOrders.id,id)).limit(1);
  if(!saved)return new Response('Không tìm thấy đơn.',{status:404});
  const demo=saved.mode==='demo'&&saved.status==='DEMO_COMPLETED';
  const live=saved.mode==='live'&&saved.status==='PAID_AWAITING_DELIVERY'&&!!saved.paid;
  if(!demo&&!live)return new Response('Đơn chưa được xác minh.',{status:403});
  let purchased:unknown;
  try{purchased=JSON.parse(saved.itemsJson)}catch{return new Response('Lỗi dữ liệu đơn.',{status:500})}
  if(!Array.isArray(purchased)||!purchased.includes(sku))return new Response('Bộ caption này không thuộc đơn.',{status:403});
  const origin=publicOrigin(req);
  const jsUrl=origin+'/api/store/files/'+encodeURIComponent(String(id))+'/'+sku+'.js?exp='+expiry+'&sig='+signature;
  let body:string,type:string;
  switch(kind){
    case 'sgmodule':body=productConfig(sku,jsUrl,'sgmodule',demo);type='text/plain; charset=utf-8';break;
    case 'conf':body=productConfig(sku,jsUrl,'conf',demo);type='text/plain; charset=utf-8';break;
    case 'js':body=productScript(sku,demo);type='application/javascript; charset=utf-8';break;
    case 'json':body=productJson(sku,demo);type='application/json; charset=utf-8';break;
    default:return new Response('Không hỗ trợ.',{status:404});
  }
  const headers:Record<string,string>={
    'Content-Type':type,'Cache-Control':'no-store,private',
    'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',
    'Content-Security-Policy':"default-src 'none'",
  };
  if(kind!=='js')headers['Content-Disposition']='attachment; filename="An-'+sku+(demo?'-DEMO':'')+'.'+kind+'"';
  return new Response(body,{status:200,headers});
}
