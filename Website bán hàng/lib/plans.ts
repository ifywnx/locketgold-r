import catalog from './version-catalog.json';
// The V1/V2 display prices and legacy plan amounts share a canonical manifest.
// Do not add V3 to the historical payment plan parser: old 129k Plus orders
// cannot safely be distinguished from new V3 orders by amount alone.
function versionPrice(id:'v1'|'v2'){
 const version=catalog.versions.find(v=>v.id===id);
 if(!version)throw new Error('Missing version '+id);
 return version.priceVnd;
}
export const PLANS={standard:versionPrice('v1'),v2:versionPrice('v2'),plus:129000} as const;
export type Plan=keyof typeof PLANS;
export function parsePlan(value:unknown):Plan|null{return value==='standard'||value==='v2'||value==='plus'?value:null}
export function planForAmount(amount:number):Plan{return amount===129000||amount===59000?'plus':amount===89000?'v2':'standard'}
