
import {admin} from '../../lib/access';
import Panel from './panel';
export const dynamic='force-dynamic';
export default async function Page(){if(!await admin())return <main><h1>Không có quyền quản trị</h1><a href="/">Về trang cài đặt</a></main>;return <Panel/>}
