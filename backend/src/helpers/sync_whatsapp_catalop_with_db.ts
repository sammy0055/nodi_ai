import { ProductModel } from '../models/products.model';
import { getWhatsappCatalog } from './whatsapp-catalog';

const priceInt = (priceStr: string) => parseInt(priceStr.replace(/[^\d]/g, ''), 10);

export const syncMetaCatalogToDB = async ({
  catalogId,
  organizationId,
}: {
  catalogId: string;
  organizationId: string;
}) => {
  const params = 'fields=id,retailer_id,name,price,availability,description&limit=100';
  let url = `https://graph.facebook.com/v23.0/${catalogId}/products?${params}`;
  const json = await getWhatsappCatalog(url);

  while (url) {
    for (const item of json.data ?? []) {
      await ProductModel.upsert({
        id: item.retailer_id,
        name: item.name,
        price: priceInt(item.price),
        metaProductId: item.id,
        organizationId: organizationId,
        description: item.description || '',
      });
    }

    url = json.paging?.next ?? '';
  }
};

// async function syncDBToMeta(catalogId: string) {
//   const products = await Product.findAll({
//     where: { metaCatalogId: catalogId },
//   });

//   const batch = products.map((p) => ({
//     method: 'POST',
//     relative_url: `${catalogId}/products`,
//     body: new URLSearchParams({
//       retailer_id: p.retailerId,
//       name: p.name,
//       price: p.price.toString(),
//       currency: 'NGN',
//       availability: 'in stock',
//     }).toString(),
//   }));

//   await fetch(`https://graph.facebook.com/${META_VERSION}`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       access_token: ACCESS_TOKEN,
//       batch,
//     }),
//   });
// }
