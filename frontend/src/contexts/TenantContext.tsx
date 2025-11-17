import { OrganizationService } from '../services/organizationService';
import { UserService } from '../services/userService';
import { ProductService } from '../services/productService';
import { BranchService } from '../services/branchService';
import { BranchInventoryService } from '../services/branchInventory';
import { SubscriptionService } from '../services/subscriptionService';

import { OrderService } from '../services/orderService';
import { CustomerService } from '../services/customerService';
import { ReviewService } from '../services/reviewService';

export const tenantContextLoader = async () => {
  const { getOrganization } = new OrganizationService();
  const { fetchCurrentUser } = new UserService();
  const [userResult, orgResult] = await Promise.allSettled([fetchCurrentUser(), getOrganization()]);
  const user = userResult.status === 'fulfilled' ? userResult.value : null;
  const org = orgResult.status === 'fulfilled' ? orgResult.value : null;
  return {
    user: user?.data,
    org: org?.data,
  };
};

export const areaAndZoneContextLoader = async () => {
  const { getZones, getAreas, getBranches } = new BranchService();
  const [zoneResults, areaResults, branchResults] = await Promise.allSettled([getZones(), getAreas(), getBranches()]);
  const zones = zoneResults.status === 'fulfilled' ? zoneResults.value : null;
  const areas = areaResults.status === 'fulfilled' ? areaResults.value : null;
  const branches = branchResults.status === 'fulfilled' ? branchResults.value : null;
  return {
    zones: zones?.data,
    areas: areas?.data,
    branches: branches?.data,
  };
};

export const branchContextLoader = async () => {
  const { getBranches } = new BranchService();
  const [branchResults] = await Promise.allSettled([getBranches()]);

  const branches = branchResults.status === 'fulfilled' ? branchResults.value : null;
  return {
    branches: branches?.data,
  };
};

export const productContextLoader = async () => {
  const { getProducts, getProductOptions } = new ProductService();
  const [productsResult, pOptionResults] = await Promise.allSettled([getProducts(), getProductOptions()]);

  const products = productsResult.status === 'fulfilled' ? productsResult.value : null;
  const productOptons = pOptionResults.status === 'fulfilled' ? pOptionResults.value : null;

  return { products: products?.data, productOptions: productOptons?.data };
};

export const inventoryContextLoader = async () => {
  const { getInventories } = new BranchInventoryService();
  const { getProducts } = new ProductService();
  const { getBranches } = new BranchService();
  const [inventoryResults, branchResults, productsResult] = await Promise.allSettled([
    getInventories(),
    getBranches(),
    getProducts(),
  ]);

  const inventory = inventoryResults.status === 'fulfilled' ? inventoryResults.value : null;
  const branches = branchResults.status === 'fulfilled' ? branchResults.value : null;
  const products = productsResult.status === 'fulfilled' ? productsResult.value : null;

  return {
    inventory: inventory?.data,
    braches: branches?.data,
    products: products?.data,
  };
};

export const ordersContextLoader = async () => {
  const { getOrders } = new OrderService();
  const [orderResults] = await Promise.allSettled([getOrders({})]);
  const orders = orderResults.status === 'fulfilled' ? orderResults.value : null;
  return {
    orders: orders?.data,
  };
};

export const customerContextLoader = async () => {
  const { getAllCustomers } = new CustomerService();
  const [customerResults] = await Promise.allSettled([getAllCustomers()]);
  const customers = customerResults.status === 'fulfilled' ? customerResults.value : null;
  return {
    customers: { data: customers?.data },
  };
};

export const reviewContextLoader = async () => {
  const { getReviews } = new ReviewService();
  const [reviewResults] = await Promise.allSettled([getReviews({})]);
  const reviews = reviewResults.status === 'fulfilled' ? reviewResults.value : null;
  return {
    reviews: { data: reviews?.data },
  };
};

export async function billingContextLoader() {
  try {
    const { getSubscriptionPlans, getSubscription, getCrediteBalance, getCreditUsage } = new SubscriptionService();

    const [subsriptionPlanResults, subscriptionResults, creditUsageResults, creditBalanceResults] =
      await Promise.allSettled([getSubscriptionPlans(), getSubscription(), getCreditUsage(), getCrediteBalance()]);

    const subscriptionPlans = subsriptionPlanResults.status === 'fulfilled' ? subsriptionPlanResults.value : null;
    const subscription = subscriptionResults.status === 'fulfilled' ? subscriptionResults.value : null;
    const creditUsage = creditUsageResults.status === 'fulfilled' ? creditUsageResults.value : null;
    const creditBalance = creditBalanceResults.status === 'fulfilled' ? creditBalanceResults.value : null;

    return {
      subscriptionPlans: subscriptionPlans?.data,
      subscription: subscription?.data,
      creditUsage: creditUsage?.data,
      creditBalance: creditBalance?.data,
    };
  } catch (error: any) {
    console.error('error in Tenant contextLoader:', error.message);
  }
}
