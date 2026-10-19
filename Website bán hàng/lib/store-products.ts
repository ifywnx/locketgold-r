// Single source of truth for independently priced preview caption collections.
// Prices are TEST VALUES until the merchant approves them and validates fulfillment.
export const STORE_PRODUCTS={
 trend:{name:'Xu hướng & Hài hước',price:19000},
 love:{name:'Tình cảm & Tâm trạng',price:19000},
 premium:{name:'Tiếng Việt tinh tế',price:29000},
 genz:{name:'Gen Z & Cá tính',price:19000},
 holiday:{name:'Lễ hội & Các mùa',price:29000},
} as const;
export type StoreProductId=keyof typeof STORE_PRODUCTS;
export function quoteStoreCart(value:unknown){
 if(!Array.isArray(value)||value.length<1||value.length>5||!value.every(x=>typeof x==='string'))return null;
 const chosen=[...new Set(value)] as StoreProductId[];
 if(chosen.length!==value.length||chosen.some(x=>!Object.prototype.hasOwnProperty.call(STORE_PRODUCTS,x)))return null;
 const amount=chosen.reduce((total,key)=>total+STORE_PRODUCTS[key].price,0);
 return {items:chosen,amount,products:chosen.map(key=>({id:key,...STORE_PRODUCTS[key]}))};
}
