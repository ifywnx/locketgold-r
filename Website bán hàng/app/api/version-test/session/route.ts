import catalog from '../../../../lib/version-catalog.json';
import {admin,json} from '../../../../lib/access';
import {issueTestToken} from '../../../../lib/version-test';

export async function POST(r:Request){
  // Next can normalize r.url to localhost behind a proxy. Compare to the
  // actual requested Host as well; a browser cannot set Origin arbitrarily.
  const origin=r.headers.get('origin');
  const requestHost=r.headers.get('host');
  const canonical=new URL(r.url).origin;
  const hostOrigin=requestHost?new URL(r.url).protocol+'//'+requestHost:null;
  if(!origin||(origin!==canonical&&origin!==hostOrigin))
    return json({error:'Yêu cầu không cùng nguồn.'},403);
  if(!await admin())return json({error:'Sai mật khẩu quản trị hoặc chưa cấu hình ADMIN_PASSWORD.'},401);
  let version:unknown;
  try{version=(await r.json()).version}catch{return json({error:'Dữ liệu không hợp lệ.'},400)}
  const v=catalog.versions.find(v=>v.id===version);
  if(!v)return json({error:'Phiên bản không hợp lệ.'},400);
  const token=issueTestToken(v.id as 'v1'|'v2'|'v3');
  return json({version:v.id,expiresInSeconds:43200,
    moduleUrl:'/api/version-test/files/'+v.id+'/An-Locket.sgmodule?token='+encodeURIComponent(token),
    notice:'Chỉ dành cho chủ cửa hàng thử cài. Không phải quyền mua hàng.'});
}
