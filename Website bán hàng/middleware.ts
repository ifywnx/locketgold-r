import {NextResponse, type NextRequest} from 'next/server';
export function middleware(r:NextRequest){const pw=process.env.ADMIN_PASSWORD;const expected=pw?'Basic '+btoa('admin:'+pw):'';if(!pw||pw.length<24||r.headers.get('authorization')!==expected)return new NextResponse('Đăng nhập quản trị',{status:401,headers:{'WWW-Authenticate':'Basic realm="ifywnx admin", charset="UTF-8"','Cache-Control':'no-store'}});return NextResponse.next();}
export const config={matcher:['/admin/:path*','/api/admin/:path*']};
