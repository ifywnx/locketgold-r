import {demoAvailable,parseDemo,demoResponse,demoSameOrigin,demoOrder} from '../../../../lib/demo-checkout';
export const runtime='nodejs';

// Read-only validation of a signed pending demo quote after page refresh.
// No payment, real database order, entitlement or premium download.
export async function POST(r:Request){
 if(!demoAvailable())return demoResponse({error:'Chế độ mô phỏng chưa được cấu hình.'},503);
 if(!demoSameOrigin(r))return demoResponse({error:'Yêu cầu không cùng nguồn.'},403);
 let data:unknown;
 try{data=await r.json()}catch{return demoResponse({error:'Phiếu DEMO không hợp lệ.'},400)}
 const token=typeof data==='object'&&data!==null&&(data as {quoteToken?:unknown}).quoteToken;
 const result=parseDemo(token,'quote');
 if(!result.ok)return demoResponse({error:result.reason==='expired'?'Phiếu DEMO đã hết hạn.':'Phiếu DEMO không hợp lệ.',reason:result.reason},result.reason==='expired'?410:403);
 return demoResponse({order:demoOrder(result.ticket),quoteToken:token,
  note:'Phiếu DEMO chờ xác nhận, không phải giao dịch thanh toán.'});
}
