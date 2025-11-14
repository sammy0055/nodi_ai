export interface WhatsAppWebhookPayload {
  object: 'whatsapp_business_account';
  entry: WhatsAppEntry[];
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppChange {
  value: WhatsAppValue;
  field: string; // usually "messages"
}

export interface WhatsAppValue {
  messaging_product: 'whatsapp';
  metadata: WhatsAppMetadata;
  contacts?: WhatsAppContact[];
  messages?: WhatsAppMessage[];
}

export interface WhatsAppMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface WhatsAppContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  text?: {
    body: string;
  };
  order?: Order;
  interactive?: Interative;
  type: 'text' | 'order' | 'interactive';
}

export interface ProductItem {
  product_retailer_id: string;
  quantity: number;
  item_price: number;
  currency: string;
}

interface Order {
  catalog_id: string;
  text: string;
  product_items: ProductItem[];
}

interface Interative {
  type: 'nfm_reply';
  nfm_reply: {
    response_json: {
      zone_id: string;
      area_id: string;
      note: '12 old refinery street apartment 5 near plot avenue';
      flow_token: string;
    };
    body: string;
    name: string;
  };
}
