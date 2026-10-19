export const PLANS={standard:49000,v2:89000,plus:129000} as const;
export type Plan=keyof typeof PLANS;
export function parsePlan(value:unknown):Plan|null{return value==='standard'||value==='v2'||value==='plus'?value:null}
export function planForAmount(amount:number):Plan{return amount===129000||amount===59000?'plus':amount===89000?'v2':'standard'}
