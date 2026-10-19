const env=process.env;
import { eq,or,and } from 'drizzle-orm';
import { getDb } from '../db';
import { accessCodes } from '../db/schema';
import {headers} from 'next/headers';
import {timingSafeEqual,createHash} from 'node:crypto';
export async function digest(token:string){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('')}
export function newToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('')}
export async function valid(token:string){if(!/^[a-f0-9]{64}$/.test(token))return false;const hash=await digest(token);const [row]=await getDb().select().from(accessCodes).where(or(eq(accessCodes.sessionHash,hash),and(eq(accessCodes.hash,hash),eq(accessCodes.singleUse,0)))).limit(1);return !!row&&!row.revoked&&row.expires>Date.now()}
export async function admin(){const h=await headers();const value=h.get('authorization')||'';const password=process.env.ADMIN_PASSWORD;if(!password||password.length<24)return false;const expected='Basic '+Buffer.from('admin:'+password).toString('base64');const hash=(s:string)=>createHash('sha256').update(s).digest();return timingSafeEqual(hash(value),hash(expected));}
export const secureHeaders={'Cache-Control':'no-store, private','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
export function json(data:unknown,status=200){return Response.json(data,{status,headers:secureHeaders})}
export function sameOrigin(r:Request){return r.headers.get('origin')===new URL(r.url).origin}
