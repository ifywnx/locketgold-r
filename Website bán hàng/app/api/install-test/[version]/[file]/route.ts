import {safePreviewModule} from '../../../../../lib/demo-preview-module';
import {secureHeaders} from '../../../../../lib/access';
/** Public import-only preview. Owner testing is a separate authenticated API. */
export async function GET(_request:Request,{params}:{params:Promise<{version:string,file:string}>}){
  const {version,file}=await params;
  const body=safePreviewModule(version);
  if(!body)return new Response('Not found',{status:404,headers:secureHeaders});
  if(file!=='An-Preview.sgmodule')
    return Response.json({error:'Bộ cài đầy đủ chỉ dành cho phiên đã xác minh quyền truy cập.'},
      {status:410,headers:secureHeaders});
  return new Response(body,{headers:{...secureHeaders,'Content-Type':'text/plain; charset=utf-8',
    'Content-Disposition':'attachment; filename="An-Preview-'+version+'.sgmodule"'}});
}
