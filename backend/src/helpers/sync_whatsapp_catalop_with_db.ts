import { ProductModel } from '../models/products.model';
import { getWhatsappCatalog, WhatsappCatalogHelper } from './whatsapp-catalog';

const priceInt = (priceStr: string) => parseInt(priceStr.replace(/[^\d]/g, ''), 10);

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
          metaProductId: item.id,
          organizationId,
        },
      });

      if (!existing) {
        // Create with OUR UUID, store Meta IDs separately
        const product = await ProductModel.create({
          name: item.name,
          price: priceInt(item.price),
          metaProductId: item.id,
          organizationId,
          description: item.description || '',
        });

        await WhatsappCatalogHelper.updateMetaCatalogItem(
          {
            itemId: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
          },
          { catalogId } as any
        );
      } else {
        // Update only safe fields
        await existing.update({
          name: item.name,
          price: priceInt(item.price),
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
