import { appConfig } from '../config';
import { IWhatSappSettings } from '../types/whatsapp-settings';
const accessToken = appConfig.metaBusinessToken;
export function priceToMetaFormat(price: any, currency:string) {
  currency = currency.toUpperCase();
  if (['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(currency)) {
    return `${parseFloat(price).toFixed(2)} ${currency}`;
  } else {
    return `${parseFloat(price)} ${currency}`;
  }
}

interface CatalogItemTypes {
  itemId: string;
  name: string;
  description: string;
  price: any;
  currency: string;
  imageUrl: string;
}

export class WhatsappCatalogHelper {
  static async createMetaCatalogItem(
    { itemId, name, description, price, currency, imageUrl }: CatalogItemTypes,
    whatsappSettings: IWhatSappSettings
  ) {
    const url = `https://graph.facebook.com/v23.0/${whatsappSettings.catalogId}/items_batch`;
    const headers = { Authorization: `Bearer ${accessToken}` };

    const payload = {
      item_type: 'PRODUCT_ITEM',
      requests: JSON.stringify([
        {
          method: 'CREATE',
          data: {
            id: itemId,
            title: name,
            description,
            price: priceToMetaFormat(price, currency),
            image_link: imageUrl || 'https://example.com/placeholder.png',
            link: 'https://cot.credobyte.ai/',
            availability: 'in stock',
            condition: 'new',
          },
        },
      ]),
    };

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = `${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.log('====================================');
        console.log(errorData);
        console.log('====================================');
        errorMessage = errorData.message || errorMessage;
      } catch {
        throw new Error(errorMessage);
      }
    }

    return await response.json();
  }

  static async updateMetaCatalogItem(
    { itemId, name, description, price, currency = 'USD', imageUrl }: CatalogItemTypes,
    whatsappSettings: IWhatSappSettings
  ) {
    const url = `https://graph.facebook.com/v23.0/${whatsappSettings.catalogId}/items_batch`;
    const headers = { Authorization: `Bearer ${whatsappSettings.accessToken}` };

    const payload = {
      item_type: 'PRODUCT_ITEM',
      requests: JSON.stringify([
        {
          method: 'UPDATE',
          data: {
            id: `item_${itemId}`,
            title: name,
            description,
            price: priceToMetaFormat(price, currency),
            image_link: imageUrl,
            link: 'https://cot.credobyte.ai/',
            availability: 'in stock',
            condition: 'new',
          },
        },
      ]),
    };

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        ...headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        throw new Error(errorMessage);
      }
    }

    return await response.json();
  }

  static async deleteMetaCatalogItem({ itemId }: CatalogItemTypes, whatsappSettings: IWhatSappSettings) {
    const url = `https://graph.facebook.com/v23.0/${whatsappSettings.catalogId}/items_batch`;
    const headers = { Authorization: `Bearer ${whatsappSettings.accessToken}` };

    const payload = {
      item_type: 'PRODUCT_ITEM',
      requests: JSON.stringify([
        {
          method: 'DELETE',
          data: { id: `item_${itemId}` },
        },
      ]),
    };

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        ...headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        throw new Error(errorMessage);
      }
    }

    return await response.json();
  }
}
