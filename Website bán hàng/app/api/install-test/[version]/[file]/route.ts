import catalog from '../../../../../lib/version-catalog.json';
import {secureHeaders} from '../../../../../lib/access';

/**
 * Public: safe import-only module. Never return paid scripts, VPN profiles,
 * subscription-rewrite logic or full product configurations.
 */
export async function GET(_request:Request,{params}:{params:Promise<{version:string,file:string}>}){
  const {version,file}=await params;
  const v=catalog.versions.find(v=>v.id===version);
  if(!v)return new Response('Not found',{status:404,headers:secureHeaders});
  if(file!=='An-Preview.sgmodule')
    return Response.json({error:'Bộ cài đầy đủ cần quyền truy cập riêng. API xem thử không cấp file trả phí.'},{status:410,headers:secureHeaders});
  const body=[
    '#!name=An Store · Module thử '+v.shortName,
    '#!desc=Chỉ dùng thử nhập vào Shadowrocket, không thay đổi ứng dụng hoặc mở khóa chức năng trả phí.',
    '#!category=General','#!system=iOS','',
    '[Rule]','DOMAIN-SUFFIX,an-store-preview.invalid,DIRECT',''
  ].join('\n');
  return new Response(body,{headers:{...secureHeaders,'Content-Type':'text/plain; charset=utf-8','Content-Disposition':`attachment; filename="An-Preview-${version}.sgmodule"`}});
}
