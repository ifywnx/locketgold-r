import { cpSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const source = new URL('../Website bán hàng/', import.meta.url);
for (const name of ['app','lib','db','public','scripts','next.config.ts','tsconfig.json','postcss.config.mjs','next-env.d.ts']) {
  const path = new URL(name, source);
  if (existsSync(path)) cpSync(path, new URL(name, import.meta.url), {recursive:true});
}

// Vercel builds from a mirrored root; regenerate from canonical version folders.
execFileSync(process.execPath, [fileURLToPath(new URL('./scripts/build-install-assets.mjs', import.meta.url))], {stdio: 'inherit'});
