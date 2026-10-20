// Prices are server-authoritative TEST values; payOS live remains disabled.
export const STORE_PRODUCTS={"trend":{"name":"Xu hướng & Meme","price":19000},"genz":{"name":"Gen Z & Slang","price":39000},"reaction":{"name":"Cà khịa & Phản ứng","price":19000},"love":{"name":"Tình cảm & Chữa lành","price":19000},"premium":{"name":"Tiếng Việt tinh tế","price":29000},"holiday":{"name":"Mùa lễ & Kỷ niệm","price":19000},"daily":{"name":"Sinh viên & Đời thường","price":19000}} as const;
export type StoreProductId=keyof typeof STORE_PRODUCTS;
export function quoteStoreCart(value:unknown){
 if(!Array.isArray(value)||value.length<1||value.length>7||!value.every(x=>typeof x==='string'))return null;
 const chosen=[...new Set(value)] as StoreProductId[];
 if(chosen.length!==value.length||chosen.some(x=>!Object.prototype.hasOwnProperty.call(STORE_PRODUCTS,x)))return null;
 const amount=chosen.reduce((total,key)=>total+STORE_PRODUCTS[key].price,0);
 return {items:chosen,amount,products:chosen.map(key=>({id:key,...STORE_PRODUCTS[key]}))};
}
