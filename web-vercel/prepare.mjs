import { cpSync, existsSync } from 'node:fs';
const source = new URL('../Website bán hàng/', import.meta.url);
for (const name of ['app','lib','db','public','scripts','next.config.ts','tsconfig.json','postcss.config.mjs','next-env.d.ts']) {
  const path = new URL(name, source);
  if (existsSync(path)) cpSync(path, new URL(name, import.meta.url), {recursive:true});
}
