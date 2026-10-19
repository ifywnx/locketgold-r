export const PLANS={standard:39000,plus:59000} as const;
export type Plan=keyof typeof PLANS;
export function parsePlan(value:unknown):Plan|null{return value==='standard'||value==='plus'?value:null}
export function planForAmount(amount:number):Plan{return amount===59000?'plus':'standard'}
