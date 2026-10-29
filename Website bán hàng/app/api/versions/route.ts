import catalog from '../../../lib/version-catalog.json';
export async function GET(){
  // Public, audited product metadata only. No private order or payment config.
  return Response.json(catalog,{headers:{'Cache-Control':'public, max-age=0, must-revalidate'}});
}
