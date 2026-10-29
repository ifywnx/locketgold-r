/** CI verifies evidence, prices and generated metadata from the canonical catalog. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=process.cwd(),manifest=JSON.parse(fs.readFileSync(root+'/lib/version-catalog.json'));
assert.equal(manifest.paymentStatus,'disabled');
assert.deepEqual(manifest.versions.map(v=>v.id),['v1','v2','v3']);
assert.deepEqual(manifest.versions.map(v=>v.priceVnd),[49000,89000,129000]);
assert.deepEqual(manifest.versions.map(v=>v.captionCount),[107,300,705]);
assert.deepEqual(manifest.versions.map(v=>v.groupCount),[12,21,21]);
assert.deepEqual(manifest.versions.map(v=>v.dynamicOverlayCount),[11,11,11]);
assert(manifest.versions.every(v=>v.verification.device==='not-tested'&&v.verification.configuration==='source-present'));
const sources={};
for(const v of manifest.versions){
  const rows=JSON.parse(fs.readFileSync(root+'/public/welcome/'+v.captionFile));
  assert.equal(rows.length,v.captionCount,v.id);
  assert.equal(new Set(rows.map(x=>x.group)).size,v.groupCount,v.id);
  assert.equal(new Set(rows.map(x=>JSON.stringify([x.group,x.text,x.icon,x.colors]))).size,rows.length);
  sources[v.id]=rows;
}
const sig=x=>JSON.stringify([x.group,x.text,x.icon,x.colors]);
const third=new Set(sources.v3.map(sig));
assert(sources.v2.every(x=>third.has(sig(x))),'V2 is not a subset of V3');
const browserFile=fs.readFileSync(root+'/public/welcome/version-data.js','utf8');
assert(browserFile.includes('window.AN_STORE_VERSION_CATALOG = '+JSON.stringify(manifest)));
const html=fs.readFileSync(root+'/public/welcome/index.html','utf8');
assert(html.includes('src="version-data.js"')&&html.includes('src="version-ui.js"'));
assert(!html.includes('data-plan="v2"'),'Cards should render from the catalog, not duplicated literals');
const plans=fs.readFileSync(root+'/lib/plans.ts','utf8');
assert(plans.includes("catalog from './version-catalog.json'"));
assert(plans.includes("plus:129000"),'Legacy amount mapping must remain intact');
console.log('PASS manifest catalog/prices 49k/89k/129k, V2 subset, provenance, browser/API sync');
