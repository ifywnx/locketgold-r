import catalog from './version-catalog.json';
/** Harmless import-only module for a simulated checkout or public preview.
 * Never include MITM hosts, scripts, proxy credentials or entitlement rewrites.
 */
export function safePreviewModule(version:string){
  const product=catalog.versions.find(v=>v.id===version);
  if(!product)return null;
  return [
    '#!name=An Store · DEMO '+product.shortName,
    '#!desc=DEMO ONLY - thử nhập Shadowrocket; không mở khóa Locket, Gold hay nội dung trả phí.',
    '#!category=General','#!system=iOS','',
    '[Rule]','DOMAIN-SUFFIX,an-store-preview.invalid,DIRECT',''
  ].join('\n');
}
