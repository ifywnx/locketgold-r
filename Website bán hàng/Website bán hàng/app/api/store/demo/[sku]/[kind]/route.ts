import {productExists,productConfig,productJson,productScript} from '../../../../../lib/store-delivery';
import {publicOrigin,secureHeaders} from '../../../../../lib/access';
export async function GET(r:Request,{params}:{params:Promise<{sku:string,kind:string}>}){
 const {sku,kind}=await params;
 if(!productExists(sku)||!['sgmodule','conf','js','json'].includes(kind))return new Response('Not found',{status:404,headers:secureHeaders});
 const origin=publicOrigin(r), script=origin+'/api/store/demo/'+sku+'/js';
 const body=kind==='js'?productScript(sku,true):kind==='json'?productJson(sku,true):productConfig(sku,script,kind as 'sgmodule'|'conf',true);
 return new Response(body,{headers:{...secureHeaders,'Content-Type':kind==='js'?'application/javascript; charset=utf-8':'text/plain; charset=utf-8','Content-Disposition':`attachment; filename="${sku}.${kind}"`}});
}
