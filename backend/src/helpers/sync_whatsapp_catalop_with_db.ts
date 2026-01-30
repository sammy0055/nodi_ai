import { ProductModel } from '../models/products.model';
import { getWhatsappCatalog } from './whatsapp-catalog';

function splitCurrencyAndPrice(value: string) {
  const match = value.match(/^([A-Z]+)\s*([\d,]+(?:\.\d+)?)$/);

  if (!match) return null;

  return {
    currency: match[1],
    price: parseFloat(match[2].replace(/,/g, '')),
  };
}

export const syncMetaCatalogToDB = async ({
  catalogId,
  organizationId,
}: {
  catalogId: string;
  organizationId: string;
}) => {
  const params = 'fields=id,retailer_id,name,price,availability,description&limit=100';
  let url: string | null = `https://graph.facebook.com/v23.0/${catalogId}/products?${params}`;

  while (url) {
    const json = await getWhatsappCatalog(url);

    for (const item of json.data ?? []) {
      // Check if product already exists by metaProductId
      const existing = await ProductModel.findOne({
        where: {
          metaProductId: item.retailer_id,
          organizationId,
        },
      });

      if (!existing) {
        // Create with OUR UUID, store Meta IDs separately
        await ProductModel.create({
          name: item.name,
          price: splitCurrencyAndPrice(item.price)?.price!,
          currency: splitCurrencyAndPrice(item.price)?.currency! as any,
          metaProductId: item.retailer_id,
          organizationId,
          description: item.description || '',
          imageUrl: item.imageUrl || '',
        });
      } else {
        // Update only safe fields
        await existing.update({
          name: item.name,
          price: splitCurrencyAndPrice(item.price)?.price!,
          description: item.description || '',
        });
      }
    }

    url = json.paging?.next ?? null;
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
