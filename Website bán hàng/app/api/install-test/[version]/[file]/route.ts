import bundles from '../../../../../lib/install-test-assets.json';
import {publicOrigin,secureHeaders} from '../../../../../lib/access';
export async function GET(r:Request,{params}:{params:Promise<{version:string,file:string}>}){
 const {version,file}=await params;
 if(version!=='v1'&&version!=='v2')return new Response('Not found',{status:404});
 const files=bundles[version] as Record<string,string>;
 const source=file==='An-Locket.conf'?'An-Locket.sgmodule':file;
 if(!Object.hasOwn(files,source))return new Response('Not found',{status:404});
 const base=publicOrigin(r)+'/api/install-test/'+version+'/';
 const body=files[source].replaceAll('__ASSET_BASE__/',base).replace(/^#!url=.*$/m,'#!url='+base+file).replaceAll('/welcome/images/locket-gold-an.png',publicOrigin(r)+'/welcome/images/locket-gold-an.png');
 return new Response(body,{headers:{...secureHeaders,'Content-Type':file.endsWith('.mobileconfig')?'application/x-apple-aspen-config':file.endsWith('.js')?'application/javascript; charset=utf-8':'text/plain; charset=utf-8','Content-Disposition':`attachment; filename="${file}"`}});
}
