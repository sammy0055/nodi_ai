const API_BASE_URL =
  import.meta.env.VITE_ENV_PROD === 'PROD' ? import.meta.env.VITE_BACKEND_PROD_APP_URL : 'http://localhost:4000/api';
// import.meta.env.VITE_BACKEND_PROD_APP_URL
export const APP_USER_API_ROUTES = {
  ADMIN_GET_REQUESTS: `${API_BASE_URL}/app-user/request/get-requests`,
  ADMIN_APPROVE_REQUEST: `${API_BASE_URL}/app-user/request/approve`,
  ADMIN_UPDATE_ORG_WABA: `${API_BASE_URL}/app-user/request/update-waba`,
  ADMIN_LOGIN: `${API_BASE_URL}/app-user/login`,
  CURRENT_ADMIN_USER: `${API_BASE_URL}/app-user/current-user`,
};
export const API_ROUTES = {
  ...APP_USER_API_ROUTES,
  LOGIN: `${API_BASE_URL}/user/login`,
  SIGNUP: `${API_BASE_URL}/user/sign-up`,
  CREATE_ORGANIZATION: `${API_BASE_URL}/organization/create`,
  UPDATE_ORGANIZATION: `${API_BASE_URL}/organization/update-organization`,
  GET_OGANIZATION: `${API_BASE_URL}/organization/get-organization`,
  CURRENT_USER: `${API_BASE_URL}/user/current-user`,
  WHATSAPP_AUTH: `${API_BASE_URL}/whatsapp-settings/get-whatsapp-auth-url`,
  EXCHANGE_WABA_CODE: `${API_BASE_URL}/whatsapp-settings/exchange-whatsapp-code-for-access-token`,
  GET_REQUST: `${API_BASE_URL}/organization/request/get-request`,
  ADD_PRODUCT: `${API_BASE_URL}/organization/product/create-product`,
  GET_PRODUCTS: `${API_BASE_URL}/organization/product/products`,
  UPDATE_PRODUCT: `${API_BASE_URL}/organization/product/products`,
  DELETE_PRODUCT: `${API_BASE_URL}/organization/product/products`,
  ADD_PRODUCT_OPTION: `${API_BASE_URL}/organization/product-option/create`,
  UPDATE_PRODUCT_OPTION: `${API_BASE_URL}/organization/product-option/update`,
  GET_PRODUCT_OPTIONS: `${API_BASE_URL}/organization/product-option/get-many`,
  DELETE_PRODUCT_OPTIONS: `${API_BASE_URL}/organization/product-option/delete`,
  APP_PRODUCT_OPTION_CHOICE: `${API_BASE_URL}/organization/product-option-choice/create`,
  UPDATE_PRODUCT_CHOICE: `${API_BASE_URL}/organization/product-option-choice/update`,
  DELETE_PRODUCT_CHOICE: `${API_BASE_URL}/organization/product-option-choice/delete`,
  CREATE_BRANCH: `${API_BASE_URL}/organization/branch/create-branch`,
  GET_BRANCHES: `${API_BASE_URL}/organization/branch/branches`,
  UPDATE_BRANCH: `${API_BASE_URL}/organization/branch/branches`,
  DELETE_BRANCH: `${API_BASE_URL}/organization/branch/branches`,
  CREATE_ZONE: `${API_BASE_URL}/organization/zone/create-zone`,
  GET_ZONES: `${API_BASE_URL}/organization/zone/get-zones`,
  UPDATE_ZONE: `${API_BASE_URL}/organization/zone/update-zone`,
  DELETE_ZONE: `${API_BASE_URL}/organization/zone/remove-zone`,
  CREATE_AREA: `${API_BASE_URL}/organization/area/create-area`,
  GET_AREAS: `${API_BASE_URL}/organization/area/areas`,
  UPDATE_AREA: `${API_BASE_URL}/organization/area/areas`,
  DELETE_AREA: `${API_BASE_URL}/organization/area/areas`,
  CREATE_BRANCH_INVENTORY: `${API_BASE_URL}/organization/branch-inventory/create`,
  UPDATE_BRANCH_INVENTORY: `${API_BASE_URL}/organization/branch-inventory/update`,
  GET_BRANCH_INVENTORIES: `${API_BASE_URL}/organization/branch-inventory/get-inventories`,
  DELETE_BRANCH_INVENTOTRY: `${API_BASE_URL}/organization/branch-inventory/inventory`,
  CREATE_CATALOG_REQUEST: `${API_BASE_URL}/organization/request/create`,
  GET_SUBSCRIPTION_PLANS: `${API_BASE_URL}/organization/subscription-plan/get-subscription-plans`,
  GET_SUBSCRIPTION: `${API_BASE_URL}/organization/subscription/get-subscription`,
  GET_CREDIT_USAGE: `${API_BASE_URL}/organization/subscription/get-credit-usage`,
  GET_CREDIT_BALANCE: `${API_BASE_URL}/organization/subscription/get-credit-balance`,
  SUBSCRIBE_TO_PLAN: `${API_BASE_URL}/organization/subscription/create-checkout-session`,
  UPGRADE_SUBSCRIPTION_PLAN: `${API_BASE_URL}/organization/subscription/upgrade-subscription`,
  GET_ORDERS: `${API_BASE_URL}/organization/order/get-all`,
  UPDATE_ORDER_STATUS: `${API_BASE_URL}/organization/order/update-order-status`,
  GET_CUSTOMERS: `${API_BASE_URL}/organization/customers/get-all`,
} as const;

export type ApiRouteName = keyof typeof API_ROUTES;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  credentials?: RequestCredentials; // "include" | "same-origin" | "omit"
}

export async function ApiClient<T>(
  route: ApiRouteName,
  { method = 'GET', body, headers = {}, credentials = 'include' }: ApiOptions = {}
): Promise<T> {
  const url = API_ROUTES[route]; // resolve to actual URL

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials,
  });

  if (!response.ok) {
    let errorMessage = `${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}
