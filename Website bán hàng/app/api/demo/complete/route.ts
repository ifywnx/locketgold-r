import {demoAvailable,parseDemo,mintDemo,demoResponse,demoSameOrigin,demoOrder} from '../../../../lib/demo-checkout';
export const runtime='nodejs';
export async function POST(r:Request){
 if(!demoAvailable())return demoResponse({error:'Chế độ mô phỏng chưa được cấu hình.'},503);
 if(!demoSameOrigin(r))return demoResponse({error:'Yêu cầu không cùng nguồn.'},403);
 let input:unknown;
 try{input=await r.json()}catch{return demoResponse({error:'Mã đơn demo không hợp lệ.'},400)}
 const quote=typeof input==='object'&&input!==null&&(input as {quoteToken?:unknown}).quoteToken;
 const check=parseDemo(quote,'quote');
 if(!check.ok)return demoResponse({error:check.reason==='expired'?'Đơn demo hết hạn. Hãy tạo lại.':'Mã đơn demo không hợp lệ.',reason:check.reason},check.reason==='expired'?410:403);
 const {ticket,token}=mintDemo('fulfilled',check.ticket.version,check.ticket.order);
 return demoResponse({order:demoOrder(ticket),receiptToken:token,
  note:'ĐÃ XÁC NHẬN DEMO. Không có khoản tiền nào được thu hoặc quyền truy cập gói thật được cấp.'});
}
