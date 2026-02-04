import { appConfig } from '../config';
import { IWhatSappSettings } from '../types/whatsapp-settings';
import { v4 } from 'uuid';
const accessToken = appConfig.metaBusinessToken;
export function priceToMetaFormat(price: any, currency: string) {
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

export interface MetaCatalogProduct {
  id: string;
  name: string;
  retailer_id: string;
  price: string;
  description: string;
  imageUrl: string;
}

export interface MetaPagingCursors {
  before?: string;
  after?: string;
}

export interface MetaPaging {
  cursors?: MetaPagingCursors;
  next?: string;
  previous?: string;
}

export interface MetaCatalogProductsResponse {
  data: MetaCatalogProduct[];
  paging?: MetaPaging;
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
      const errorData = await response.json();
      throw new Error(`Error ${response.status}: ${errorData.error.message}`);
    }

    return await response.json();
  }

  static async updateMetaCatalogItem(
    { itemId, name, description, price, currency = 'USD', imageUrl }: Partial<CatalogItemTypes>,
    whatsappSettings: IWhatSappSettings
  ) {
    const url = `https://graph.facebook.com/v23.0/${whatsappSettings.catalogId}/items_batch`;
    const headers = { Authorization: `Bearer ${accessToken}` };

    const payload = {
      item_type: 'PRODUCT_ITEM',
      requests: JSON.stringify([
        {
          method: 'UPDATE',
          data: {
            id: itemId,
            title: name,
            description,
            price: priceToMetaFormat(price, currency),
            image_link: `${imageUrl}?ver=${v4()}` || 'https://example.com/placeholder.png',
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
      const errorData = await response.json();
      throw new Error(`Error ${response.status}: ${errorData.error.message}`);
    }

    return await response.json();
  }

  static async deleteMetaCatalogItem(
    { itemId }: Pick<CatalogItemTypes, 'itemId'>,
    whatsappSettings: IWhatSappSettings
  ) {
    const url = `https://graph.facebook.com/v23.0/${whatsappSettings.catalogId}/items_batch`;
    const headers = { Authorization: `Bearer ${accessToken}` };

    const payload = {
      item_type: 'PRODUCT_ITEM',
      requests: JSON.stringify([
        {
          method: 'DELETE',
          data: { id: itemId },
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
      const errorData = await response.json();
      throw new Error(`Error ${response.status}: ${errorData.error.message}`);
    }

    return await response.json();
  }
}

export const getWhatsappCatalog = async (url: string): Promise<MetaCatalogProductsResponse> => {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error ${response.status}: ${errorData.error.message}`);
  }

  const data = await response.json();
  const image = JSON.parse(data.data[0].images[0]);
  return {
    ...data,
    data: {
      ...data.data,
      imageUrl: image.url,
    },
  };
};
