import {demoAvailable,demoProduct,demoOrder,demoResponse,demoSameOrigin,mintDemo} from '../../../../lib/demo-checkout';
export const runtime='nodejs';
export async function POST(r:Request){
 if(!demoAvailable())return demoResponse({error:'Chế độ mô phỏng chưa được cấu hình trên máy chủ.',demoEnabled:false},503);
 if(!demoSameOrigin(r))return demoResponse({error:'Yêu cầu không cùng nguồn.',demoEnabled:false},403);
 let input:unknown;
 try{input=await r.json()}catch{return demoResponse({error:'Dữ liệu gói không hợp lệ.'},400)}
 const version=typeof input==='object'&&input!==null&&(input as {version?:unknown}).version;
 const v=demoProduct(version);
 if(!v)return demoResponse({error:'Chỉ có bản thử V1, V2 hoặc V3.'},400);
 const {ticket,token}=mintDemo('quote',v.id as 'v1'|'v2'|'v3');
 return demoResponse({order:demoOrder(ticket),quoteToken:token,
   note:'MÔ PHỎNG. Không tạo đơn thật, không thanh toán, không gửi dữ liệu lên payOS.'});
}
