import { z } from 'zod';
import { admin, digest, newToken, json, sameOrigin } from '../../../lib/access';
import { getDb } from '../../../db';
import { accessCodes } from '../../../db/schema';
import { desc,eq } from 'drizzle-orm';
export async function GET(){if(!await admin())return json({error:'Bạn không có quyền quản trị.'},403);const rows=await getDb().select({id:accessCodes.id,label:accessCodes.label,expires:accessCodes.expires,revoked:accessCodes.revoked}).from(accessCodes).orderBy(desc(accessCodes.created));return json(rows)}
export async function POST(r:Request){if(!sameOrigin(r)||!await admin())return json({error:'Không có quyền.'},403);let b;try{b=z.object({action:z.string().optional(),id:z.string().optional(),label:z.string().optional(),days:z.number().optional()}).parse(await r.json())}catch{return json({error:'Dữ liệu không hợp lệ.'},400)}
if(b.action==='revoke'&&typeof b.id==='string'){await getDb().update(accessCodes).set({revoked:1}).where(eq(accessCodes.id,b.id));return json({ok:true})}
if(typeof b.label!=='string'||!b.label.trim()||b.label.length>80||typeof b.days!=='number'||!Number.isInteger(b.days)||b.days<1||b.days>365)return json({error:'Nhập tên và thời hạn 1–365 ngày.'},400);
const token=newToken();await getDb().insert(accessCodes).values({id:crypto.randomUUID(),hash:await digest(token),label:b.label.trim(),expires:Date.now()+b.days*86400000,singleUse:1,created:Date.now()});return json({token})}
