import {createHmac,randomBytes,timingSafeEqual} from 'node:crypto';

// Separate owner test links from customer orders. Signed by an admin-only
// secret; expiration and product version are authenticated together.
const TTL=12*60*60;
function secret(){
  const value=process.env.ADMIN_PASSWORD||'';
  if(value.length<24)throw new Error('ADMIN_PASSWORD is not configured for owner testing.');
  return value;
}
function mac(data:string){return createHmac('sha256',secret()).update('an-store-owner-install-v1:'+data).digest('hex');}
export function issueTestToken(version:'v1'|'v2'|'v3'){
  const exp=Math.floor(Date.now()/1000)+TTL;
  const nonce=randomBytes(16).toString('hex');
  const payload=version+'.'+exp+'.'+nonce;
  return payload+'.'+mac(payload);
}
export function checkTestToken(version:string,token:string){
  const m=/^(v[123])\.([0-9]{10})\.([a-f0-9]{32})\.([a-f0-9]{64})$/.exec(token);
  if(!m||version!==m[1])return false;
  const now=Math.floor(Date.now()/1000),expires=Number(m[2]);
  if(!Number.isSafeInteger(expires)||expires<now||expires>now+TTL)return false;
  try{
    const expected=Buffer.from(mac(m[1]+'.'+m[2]+'.'+m[3]),'hex');
    const supplied=Buffer.from(m[4],'hex');
    return expected.length===supplied.length&&timingSafeEqual(expected,supplied);
  }catch{return false;}
}
