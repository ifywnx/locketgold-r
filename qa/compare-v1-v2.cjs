/* Offline comparison only. No network access, no Locket accounts, no real subscription or purchase requests. */
'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');

function txt(p){return fs.readFileSync(path.join(root,p),'utf8')}
function safeJSON(v){try{return typeof v==='string'?JSON.parse(v):v}catch{return null}}
function baseline(){
  return {entries:{
    feature_gates:JSON.stringify({server_only_feature:'keep-me'}),
    upsell_features:JSON.stringify({server_upsell:true}),
    overlay_items:JSON.stringify([{section:'Server only',items:[{
      overlay_id:'caption:server_fixture',source:'remote',
      caption:{text:'SERVER_FIXTURE',type:'static_content',background:{colors:['#000','#fff']}}
    }]}]),
    unrelated_server_key:'do-not-remove'
  }, unrelatedRoot:'root-retained'}
}
const scripts={
  v1:txt('v1/Locket_Unlocked.js'),
  v2:txt('v2/Locket_Unlocked.js')
};
function execute(version, url, agent, responseBody){
  let done=null,calls=0;
  const sandbox={
    $request:{url,headers:{'User-Agent':agent}},
    $response:{body:responseBody},
    $done(result){done=result;calls++}
  };
  const start=process.hrtime.bigint();
  vm.runInNewContext(scripts[version], sandbox, {filename:version+'/Locket_Unlocked.js',timeout:10000});
  const elapsed=Number(process.hrtime.bigint()-start)/1e6;
  assert.equal(calls,1,version+' should finish via $done once');
  const output=typeof done?.body==='string'?done.body:responseBody;
  return {output:output, elapsedMs:+elapsed.toFixed(2),changed:output!==responseBody,
    parsed:safeJSON(output),rawDoneHasBody:typeof done?.body==='string'};
}
function overlayStats(data){
  const groups=safeJSON(data?.entries?.overlay_items);
  if(!Array.isArray(groups))return {groups:0,total:0,unique:0,foundServerFixture:false};
  const ids=groups.flatMap(g=>Array.isArray(g.items)?g.items.map(it=>it?.overlay_id).filter(Boolean):[]);
  return {
    groups:groups.length,total:ids.length,unique:new Set(ids).size,
    foundServerFixture:ids.includes('caption:server_fixture'),
    sampleGroups:groups.slice(0,7).map(g=>g.section).filter(Boolean)
  };
}
function collect(data){
  const flags=safeJSON(data?.entries?.feature_gates)||{};
  const upsell=safeJSON(data?.entries?.upsell_features)||{};
  const entries=data?.entries||{};
  const checks=['longer_video','video','video_audio','high_quality_video','ai_captions','magic_cutout','group_chats','custom_widget_frames','camera_roll','remove_ads'];
  const gates=Object.fromEntries(checks.map(k=>[k,Object.hasOwn(flags,k)?flags[k]:null]));
  const interesting=Object.fromEntries(Object.entries(entries)
    .filter(([k])=>/video|quality|duration|widget_frame_event|feature_discovery_popup_config|overlay_items/i.test(k))
    .filter(([k])=>k!=='overlay_items')
    .slice(0,25).map(([k,v])=>[k,typeof v==='string'?v.slice(0,75):v]));
  return {
    entriesCount:Object.keys(entries).length,
    serverKeysPreserved:entries.unrelated_server_key==='do-not-remove'&&flags.server_only_feature==='keep-me'&&upsell.server_upsell===true,
    overlay:overlayStats(data),gates,entrySamples:interesting
  };
}
const remoteUrl='https://firebaseremoteconfig.googleapis.com/v1/projects/locket-4252a/namespaces/firebase:fetch';
const unrelatedUrl='https://unrelated.example.org/v1/test';
const body=JSON.stringify(baseline());
const variants={};
for(const version of ['v1','v2']){
  const r=execute(version,remoteUrl,'Locket/1.0',body);
  assert(r.parsed,version+' should produce valid JSON');
  variants[version]={codeBytes:Buffer.byteLength(scripts[version]),elapsedMs:r.elapsedMs,
    changed:r.changed,...collect(r.parsed)};
}
const responseCases={};
for(const [name,url,agent] of [
 ['valid_url_and_locket_agent',remoteUrl,'Locket/1.0'],
 ['unrelated_url_and_agent',unrelatedUrl,'OtherApp/1.0'],
 ['valid_url_other_agent',remoteUrl,'OtherApp/1.0'],
 ['unrelated_url_locket_agent',unrelatedUrl,'Locket/1.0']
]){
  responseCases[name]={};
  for(const version of ['v1','v2']){
    const r=execute(version,url,agent,body);
    responseCases[name][version]={changed:r.changed,doneWithBody:r.rawDoneHasBody};
  }
}
const staticFiles={
  v1CaptionPreview:safeJSON(txt('Website bán hàng/public/welcome/v1-caption-data.json')),
  v2CaptionPreview:safeJSON(txt('Website bán hàng/public/welcome/caption-data.json'))
};
function dataStats(arr){
  return {
    count:arr.length,
    groups:new Set(arr.map(x=>x.group)).size,
    uniqueIds:new Set(arr.map(x=>x.id||x.group+'|'+x.text)).size,
    icons:arr.filter(x=>x.icon).length,
    gradients:arr.filter(x=>Array.isArray(x.colors)&&x.colors.length>=2).length
  }
}
const preview={
  v1:dataStats(staticFiles.v1CaptionPreview),
  v2:dataStats(staticFiles.v2CaptionPreview)
};
const sameDns=fs.readFileSync(path.join(root,'v1/An-Locket-DNS.mobileconfig'))
  .equals(fs.readFileSync(path.join(root,'v2/An-Locket-DNS.mobileconfig')));
const sameLogo=fs.readFileSync(path.join(root,'v1/assets/locket-gold-an.png'))
  .equals(fs.readFileSync(path.join(root,'v2/assets/locket-gold-an.png')));
const sameSubscriptionCode=txt('v1/Locket_An.js')===txt('v2/Locket_An.js');
const moduleBytes={
  v1:Buffer.byteLength(txt('v1/An-Locket.sgmodule')),
  v2:Buffer.byteLength(txt('v2/An-Locket.sgmodule'))
};
const report={
  title:'An Store V1/V2 — offline behavior comparison',
  disclaimer:'Synthetic Remote Config only. Does NOT prove features work in real Locket or that Gold is valid.',
  preview,
  modules:{sameDns,sameLogo,sameSubscriptionCode,moduleBytes},
  variants,responseCases
};
fs.mkdirSync(path.join(root,'qa','results'),{recursive:true});
fs.writeFileSync(path.join(root,'qa','results','v1-v2-offline.json'),JSON.stringify(report,null,2)+'\n');
const lines=[
 '# V1 vs V2 — offline test',
 '',
 '**Test type:** local Node.js VM using synthetic Remote Config JSON. No third-party API, account, real payment or modified production.',
 '',
 '| Metric | V1 | V2 |',
 '|---|---:|---:|',
 '| Web caption samples | '+preview.v1.count+' | '+preview.v2.count+' |',
 '| Web preview groups | '+preview.v1.groups+' | '+preview.v2.groups+' |',
 '| Remote Config overlay groups (fixture) | '+variants.v1.overlay.groups+' | '+variants.v2.overlay.groups+' |',
 '| Remote Config overlay IDs (fixture) | '+variants.v1.overlay.total+' | '+variants.v2.overlay.total+' |',
 '| Unique overlay IDs (fixture) | '+variants.v1.overlay.unique+' | '+variants.v2.overlay.unique+' |',
 '| Preserves sample server overlay | '+variants.v1.overlay.foundServerFixture+' | '+variants.v2.overlay.foundServerFixture+' |',
 '| Preserves non-overridden upstream keys | '+variants.v1.serverKeysPreserved+' | '+variants.v2.serverKeysPreserved+' |',
 '| Fake response changed (expected endpoint + agent) | '+variants.v1.changed+' | '+variants.v2.changed+' |',
 '',
 'Same DNS profile: **'+sameDns+'**. Same popup logo image: **'+sameLogo+'**. Exact same Gold-script code: **'+sameSubscriptionCode+'**.',
 '',
 '## Declared feature flags',
 '',
 '| Flag | V1 | V2 |',
 '|---|---|---|',
 ...Object.keys(variants.v1.gates).map(k=>'| '+k+' | '+String(variants.v1.gates[k]??'-')+' | '+String(variants.v2.gates[k]??'-')+' |'),
 '',
 '## Offline request selection (changed mock response?)',
 '',
 '| Fixture | V1 | V2 |',
 '|---|---|---|',
 ...Object.entries(responseCases).map(([k,v])=>'| '+k+' | '+v.v1.changed+' | '+v.v2.changed+' |'),
 '',
 'These reflect the JavaScript checks on mock input, not which actual requests a phone routes through a proxy.',
 '',
 '## Known limits',
 '',
 '- No real Locket traffic, iPhone or Shadowrocket runtime used.',
 '- A declared flag does not mean the mobile app supports a feature.',
 '- No conclusion about valid paid Gold entitlements on the provider server.',
 '- Timings are quick synthetic CI measurements, not phone performance benchmarks.'
];
fs.writeFileSync(path.join(root,'qa','results','v1-v2-offline.md'),lines.join('\n')+'\n');
console.log('V1-V2_OFFLINE_REPORT '+JSON.stringify({
  preview,modules:{sameDns,sameLogo,sameSubscriptionCode},
  versions:Object.fromEntries(Object.entries(variants).map(([k,v])=>[k,{
    codeBytes:v.codeBytes,elapsedMs:v.elapsedMs,entriesCount:v.entriesCount,
    overlay:v.overlay,serverKeysPreserved:v.serverKeysPreserved,gates:v.gates
  }])),
  responseCases
}));
assert.equal(preview.v1.count,107);
assert.equal(preview.v2.count,705);
assert.equal(preview.v1.uniqueIds,107);
assert.equal(preview.v2.uniqueIds,705);
assert.equal(variants.v1.overlay.total,118);
assert.equal(variants.v2.overlay.total,717);
assert.equal(variants.v1.overlay.foundServerFixture,false);
assert.equal(variants.v2.overlay.foundServerFixture,true);
assert.equal(variants.v1.serverKeysPreserved,true);
assert.equal(variants.v2.serverKeysPreserved,true);
assert.equal(sameDns,true);
assert.equal(sameLogo,true);
assert.equal(responseCases.unrelated_url_and_agent.v1.changed,false);
assert.equal(responseCases.unrelated_url_and_agent.v2.changed,false);
assert.equal(responseCases.valid_url_and_locket_agent.v1.changed,true);
assert.equal(responseCases.valid_url_and_locket_agent.v2.changed,true);
assert.equal(responseCases.valid_url_other_agent.v1.changed,false);
assert.equal(responseCases.valid_url_other_agent.v2.changed,true);
console.log('PASS: fixture execution, V1/V2 caption statistics, DNS/logo equality, request scope checks');
