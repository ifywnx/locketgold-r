import {valid,secureHeaders} from '../../../../lib/access';
import {assets} from '../../../../lib/private-assets';
export async function GET(r:Request,{params}:{params:Promise<{token:string,file:string}>}){
 const {token,file}=await params;
 if(!await valid(token))return new Response('Access denied',{status:403,headers:secureHeaders});
 if(!Object.hasOwn(assets,file))return new Response('Not found',{status:404,headers:secureHeaders});
 const base=new URL(r.url).origin+'/download/'+token+'/';
 const body=assets[file].replaceAll('__ASSET_BASE__/',base).replaceAll('/welcome/images/locket-gold-an.png',new URL(r.url).origin+'/welcome/images/locket-gold-an.png').replace(/https:\/\/raw\.githubusercontent\.com\/ifywnx\/locket-gold-ywnx\/refs\/heads\/main\/(?:modules|js|downloads)\//g,base);
 const type=file.endsWith('.mobileconfig')?'application/x-apple-aspen-config':file.endsWith('.js')?'application/javascript; charset=utf-8':'text/plain; charset=utf-8';
 return new Response(body,{headers:{...secureHeaders,'Content-Type':type,...(file.endsWith('.mobileconfig')?{'Content-Disposition':`attachment; filename="${file}"`}:{})}});
}
