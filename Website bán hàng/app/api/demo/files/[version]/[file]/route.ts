import {demoAvailable,parseDemo,demoProduct} from '../../../../../../lib/demo-checkout';
import previewV1 from '../../../../../../public/welcome/v1-caption-data.json';
import previewV2 from '../../../../../../public/welcome/v2-caption-data.json';
import previewV3 from '../../../../../../public/welcome/caption-data.json';
export const runtime='nodejs';
const previews={v1:previewV1,v2:previewV2,v3:previewV3};
const headers={
 'Cache-Control':'no-store, private','Referrer-Policy':'no-referrer',
 'X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'"
};
export async function GET(r:Request,{params}:{params:Promise<{version:string,file:string}>}){
 const {version,file}=await params;
 if(!demoProduct(version)||!['sample.json','instructions.txt','receipt.json'].includes(file))
  return new Response('Not found',{status:404,headers});
 if(!demoAvailable())return new Response('Demo disabled',{status:503,headers});
 const ticket=new URL(r.url).searchParams.get('ticket');
 const result=parseDemo(ticket,'fulfilled');
 if(!result.ok)return new Response(result.reason==='expired'?'Demo expired':'Forbidden',
  {status:result.reason==='expired'?410:403,headers});
 if(result.ticket.version!==version)return new Response('Wrong version',{status:403,headers});
 const v=demoProduct(version)!;
 let content:string;let mime='text/plain; charset=utf-8';
 if(file==='sample.json'){
  const samples=previews[version as keyof typeof previews].slice(0,Math.min(12,v.captionCount));
  content=JSON.stringify({demo:true,version,package:v.name,listedPriceVnd:v.priceVnd,
    fullCaptionCount:v.captionCount,deliveredSampleCount:samples.length,
    warning:'DEMO PREVIEW ONLY. Not the paid package; no entitlement or Locket integration.',
    samples},null,2)+'\n';mime='application/json; charset=utf-8';
 }else if(file==='receipt.json'){
  content=JSON.stringify({demo:true,orderId:result.ticket.order,version,priceVnd:v.priceVnd,
   simulatedStatus:'DEMO_FULFILLED',paid:false,
   notice:'Mô phỏng, không phải hóa đơn, giấy phép, hoặc bằng chứng thanh toán.',
   expiresAt:new Date(result.ticket.expires*1000).toISOString()},null,2)+'\n';
  mime='application/json; charset=utf-8';
 }else{
  content=[
   'AN STORE — HƯỚNG DẪN BẢN MẪU DEMO',
   'Phiên bản: '+v.name+' ('+version.toUpperCase()+')',
   'Giá niêm yết: '+v.priceVnd.toLocaleString('vi-VN')+' VND',
   'Thư viện đầy đủ được giới thiệu: '+v.captionCount+' caption tĩnh.',
   '',
   'Đây là lượt mua GIẢ LẬP; hệ thống không thu tiền.',
   'File sample.json chỉ chứa tối đa 12 mẫu để kiểm tra luồng giao hàng.',
   'Không chứa mã cài thật, Gold, tài khoản, mật khẩu hoặc quyền trả phí.',
   'Đơn thật và hệ thống mã kích hoạt cũ hoàn toàn độc lập.',
   'Sau khi mã demo hết hạn, hãy chạy lại quy trình từ đầu.'
  ].join('\n')+'\n';
 }
 return new Response(content,{headers:{...headers,'Content-Type':mime,
  'Content-Disposition':'attachment; filename="an-store-'+version+'-demo-'+file+'"'}});
}
