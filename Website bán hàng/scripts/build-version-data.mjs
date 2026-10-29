/**
 * Build artifact derived exclusively from lib/version-catalog.json.
 * This makes plain HTML, modal, phone preview, price selector and version API
 * read the same source of truth. Run inside either Next root/mirror.
 */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(readFileSync(join(root,'lib/version-catalog.json'),'utf8'));
if(catalog.schemaVersion!==1||catalog.paymentStatus!=='disabled'||!Array.isArray(catalog.versions)||catalog.versions.length!==3)
  throw Error('Unexpected version catalog schema or unsafe payment status');
const ids=new Set(),plans=new Set();
for(const v of catalog.versions){
  if(!/^v[123]$/.test(v.id)||ids.has(v.id)||plans.has(v.planId)||!Number.isSafeInteger(v.priceVnd)||v.priceVnd<=0||
  !Number.isInteger(v.captionCount)||!Number.isInteger(v.groupCount)||!Number.isInteger(v.dynamicOverlayCount)||!/^[-\w]+\.json$/.test(v.captionFile)||
  v.verification?.device!=='not-tested'||v.verification?.caption!=='repository')throw Error('Invalid version: '+v.id);
  ids.add(v.id);plans.add(v.planId);
  const rows=JSON.parse(readFileSync(join(root,'public/welcome',v.captionFile),'utf8'));
  if(rows.length!==v.captionCount||new Set(rows.map(x=>x.group)).size!==v.groupCount)
    throw Error('Version '+v.id+' caption count does not match source JSON');
}
const expected={v1:107,v2:300,v3:705};
for(const [id,count] of Object.entries(expected))
 if(catalog.versions.find(v=>v.id===id)?.captionCount!==count)throw Error('Unexpected known caption count: '+id);
const artifact='/* Generated from lib/version-catalog.json. Do not edit. */\n'+
  'window.AN_STORE_VERSION_CATALOG = '+JSON.stringify(catalog)+';\n';
const dest=join(root,'public/welcome/version-data.js');
if(process.argv.includes('--check')){
 if(!existsSync(dest)||readFileSync(dest,'utf8')!==artifact)throw Error('Generated version-data.js out of date');
 console.log('PASS version catalog matches all source caption files and generated UI metadata');
}else{
 if(!existsSync(dest)||readFileSync(dest,'utf8')!==artifact)writeFileSync(dest,artifact);
 console.log('Prepared version metadata: '+catalog.versions.map(x=>x.id+'='+x.captionCount).join(', '));
}
