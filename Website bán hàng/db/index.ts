import {createClient} from '@libsql/client';
import {drizzle} from 'drizzle-orm/libsql';
import * as schema from './schema';
let db:ReturnType<typeof drizzle<typeof schema>>;
export function getDb(){return db ??= drizzle(createClient({url:process.env.DATABASE_URL||'file:./data/app.db'}),{schema});}
