import {demoAvailable,parseDemo,demoResponse,demoSameOrigin,demoOrder} from '../../../../lib/demo-checkout';
export const runtime='nodejs';
export async function POST(r:Request){
 if(!demoAvailable())return demoResponse({error:'Chế độ mô phỏng chưa được cấu hình.'},503);
 if(!demoSameOrigin(r))return demoResponse({error:'Yêu cầu không cùng nguồn.'},403);
 let input:unknown;
 try{input=await r.json()}catch{return demoResponse({error:'Biên nhận không hợp lệ.'},400)}
 const receipt=typeof input==='object'&&input!==null&&(input as {receiptToken?:unknown}).receiptToken;
 const result=parseDemo(receipt,'fulfilled');
 if(!result.ok)return demoResponse({error:result.reason==='expired'?'Biên nhận demo đã hết hạn.':'Biên nhận không hợp lệ.',reason:result.reason},result.reason==='expired'?410:403);
 return demoResponse({order:demoOrder(result.ticket),receiptToken:receipt,note:'Chỉ khôi phục quyền tải bản mẫu mô phỏng.'});
}
