'use strict';
/* Run from this directory with Node.js: node test.js */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,file),'utf8');
const script=read('An-Trend-Meme.lab.js');
const manifest=JSON.parse(read('catalog.json'));
const moduleText=read('An-Trend-Meme.lab.sgmodule');
const url='https://firebaseremoteconfig.googleapis.com/v1/projects/locket-4252a/namespaces/firebase:fetch';
const ids=manifest.groups.flatMap(group=>group.items.map(item=>item.overlay_id));
assert.equal(manifest.caption_total,143);
assert.deepEqual(manifest.groups.map(g=>g.items.length),[53,65,25]);
assert.equal(new Set(ids).size,143);
assert(manifest.groups.every(g=>g.items.every(i=>i.caption.type==='static_content')));

function run(body,reqUrl=url){
  let calls=0,answer;
  vm.runInNewContext(script,{
    $request:{url:reqUrl},
    $response:{body},
    $done(result){calls++;answer=result;}
  },{filename:'An-Trend-Meme.lab.js',timeout:1200});
  assert.equal(calls,1,'$done must be called exactly once');
  assert.equal(typeof answer?.body,'string');
  return answer.body;
}
const original={
  status:'OK',
  entries:{
    overlay_items:JSON.stringify([{section:'Server captions',items:[{
      overlay_id:'caption:server_native',caption:{text:'Keep server original'}
    }]}]),
    feature_gates:'{"gold":false,"video":false}',
    subscriptions:'do not touch',
    other_config:'original value'
  }
};
const initialJSON=JSON.stringify(original);
const modified=JSON.parse(run(initialJSON));
const overlays=JSON.parse(modified.entries.overlay_items);
assert.equal(overlays.reduce((sum,g)=>sum+g.items.length,0),144);
assert.equal(new Set(overlays.flatMap(g=>g.items.map(i=>i.overlay_id))).size,144);
assert.deepEqual(modified.entries.feature_gates,original.entries.feature_gates);
assert.deepEqual(modified.entries.subscriptions,original.entries.subscriptions);
assert.deepEqual(modified.entries.other_config,original.entries.other_config);
assert.equal(modified.status,'OK');
assert.equal(overlays[0].items[0].caption.text,'Keep server original');
for(const group of manifest.groups){
  const installed=overlays.find(x=>x.section===group.section);
  assert(installed,'A source group is missing');
  assert.deepEqual(JSON.parse(JSON.stringify(installed.items)),group.items,'An overlay payload was modified');
}
// Idempotence: do not duplicate overlays when rewriting the same response twice.
const twice=JSON.parse(run(JSON.stringify(modified)));
assert.equal(JSON.parse(twice.entries.overlay_items).reduce((n,g)=>n+g.items.length,0),144);
// Never change a pre-existing source overlay's text if the app already provides it.
const first=manifest.groups[0].items[0];
const native={
  entries:{overlay_items:JSON.stringify([{section:manifest.groups[0].section,items:[{
    overlay_id:first.overlay_id,caption:{type:'static_content',text:'App supplied caption'}
  }]}])}
};
const nativeOutput=JSON.parse(run(JSON.stringify(native)));
const nativeItems=JSON.parse(nativeOutput.entries.overlay_items).flatMap(x=>x.items);
assert.equal(nativeItems.length,143);
assert.equal(nativeItems.find(x=>x.overlay_id===first.overlay_id).caption.text,'App supplied caption');
// Input guards and fail-closed behavior.
assert.equal(run(initialJSON,'https://example.com/other'),initialJSON);
assert.equal(run('{not json'),'{not json');
assert.equal(run(JSON.stringify({foo:'bar'})),JSON.stringify({foo:'bar'}));
const malformed=JSON.stringify({entries:{overlay_items:'{"not":"an array"}'}});
assert.equal(run(malformed),malformed);
const unexpected=JSON.stringify({entries:{overlay_items:42}});
assert.equal(run(unexpected),unexpected);
const minimal=JSON.parse(run(JSON.stringify({entries:{}})));
assert.equal(JSON.parse(minimal.entries.overlay_items).flatMap(g=>g.items).length,143);
assert.match(moduleText,/__SIGNED_SCRIPT_URL__/);
assert(!/api\.revenuecat\.com|Locket_An\.js|Locket_Unlocked\.js|feature_gates|subscriptions/i.test(moduleText));
console.log('PASS: 143 unique static captions in 3 packs');
console.log('PASS: source payloads and incoming data preserved');
console.log('PASS: no entitlement fields modified');
console.log('PASS: rerun is idempotent; existing IDs not overwritten');
console.log('PASS: wrong URL and malformed responses unchanged');
console.log('PASS: placeholder module excludes premium-unlock scripts');
console.log('NOTE: these are mock tests, NOT tests on a Locket iPhone.');
