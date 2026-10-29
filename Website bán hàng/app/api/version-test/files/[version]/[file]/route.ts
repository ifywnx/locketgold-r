import bundles from '../../../../../../lib/install-test-assets.json';
import {secureHeaders} from '../../../../../../lib/access';
import {checkTestToken} from '../../../../../../lib/version-test';

const allowed=new Set(['An-Locket.sgmodule','Locket_An.js','Locket_Unlocked.js','deleteHeader.js','An-Locket-DNS.mobileconfig']);
export async function GET(request:Request,{params}:{params:Promise<{version:string,file:string}>}){
  const {version,file}=await params;
  if(!['v1','v2','v3'].includes(version)||!allowed.has(file))return new Response('Not found',{status:404,headers:secureHeaders});
  const token=new URL(request.url).searchParams.get('token')||'';
  if(!checkTestToken(version,token))return new Response('Owner-only link is invalid or expired',{status:403,headers:secureHeaders});
  const files=bundles[version as keyof typeof bundles] as Record<string,string>;
  const origin=new URL(request.url).origin;
  const base=origin+'/api/version-test/files/'+version+'/';
  const url=(name:string)=>base+name+'?token='+encodeURIComponent(token);
  let content=files[file];
  if(file==='An-Locket.sgmodule'){
    content=content.replace(/^#!url=.*$/m,'#!url='+url(file));
  }
  content=content.replaceAll('__ASSET_BASE__/assets/locket-gold-an.png',origin+'/welcome/images/locket-gold-an.png')
    .replace(/__ASSET_BASE__\/([\w.-]+)/g,(_match,name:string)=>url(name))
    .replaceAll('/welcome/images/locket-gold-an.png',origin+'/welcome/images/locket-gold-an.png');
  const type=file.endsWith('.js')?'application/javascript; charset=utf-8':file.endsWith('.mobileconfig')?'application/x-apple-aspen-config':'text/plain; charset=utf-8';
  return new Response(content,{headers:{...secureHeaders,'Content-Type':type,
    ...(file.endsWith('.mobileconfig')?{'Content-Disposition':'attachment; filename="An-Locket-DNS.mobileconfig"'}:{})}});
}
