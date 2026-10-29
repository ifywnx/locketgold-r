import {redirect} from 'next/navigation';
// Caption-only storefront retired; preserve historical /store/checkout.html for existing orders.
export default function StoreHome(){redirect('/welcome/index.html#versions')}
