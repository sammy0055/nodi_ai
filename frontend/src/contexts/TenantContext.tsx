import React from 'react';
import { OrganizationService } from '../services/organizationService';
import { UserService } from '../services/userService';
import {
  useUserSetRecoilState,
  useOrgSetRecoilState,
  useWhatsappSetRecoilState,
  useProductsSetRecoilState,
  useProductOptionSetRecoilState,
  useBranchSetRecoilState,
  useBranchInventorySetRecoilState,
  useSubscriptionPlanSetRecoilState,
  useSubscriptionSetRecoilState,
  useCreditUsageSetRecoilState,
  useCreditBalanceSetRecoilState,
  useCustomersSetRecoilState,
  useReviewsSetRecoilState,
} from '../store/authAtoms';
import type { User } from '../types/users';
import type { OrganizationPayload } from '../types/organization';
import { ProductService } from '../services/productService';
import type { Product, ProductOption } from '../types/product';
import { BranchService } from '../services/branchService';
import type { IArea, IBranch, IBranchInventory, IZone } from '../types/branch';
import { BranchInventoryService } from '../services/branchInventory';
import { SubscriptionService } from '../services/subscriptionService';
import type {
  CreditBalanceAttributes,
  ISubscription,
  ISubscriptionPlan,
  UsageRecordAttributes,
} from '../types/subscription';
import { OrderService } from '../services/orderService';
import type { IOrder } from '../pages/tenant/OrderPage';
import { CustomerService } from '../services/customerService';
import type { Customer, Pagination } from '../types/customer';
import { ReviewService } from '../services/reviewService';
import type { IReview } from '../pages/tenant/ReviewPage';

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
  const [orderResults] = await Promise.allSettled([getOrders()]);
  const orders = orderResults.status === 'fulfilled' ? orderResults.value : null;
  return {
    orders: orders?.data,
  };
};

export async function contextLoader() {
  try {
    const { getInventories } = new BranchInventoryService();
    const { getSubscriptionPlans, getSubscription, getCrediteBalance, getCreditUsage } = new SubscriptionService();

    const { getAllCustomers } = new CustomerService();
    const { getReviews } = new ReviewService();
    const [
      inventoryResults,
      subsriptionPlanResults,
      subscriptionResults,
      creditUsageResults,
      creditBalanceResults,

      customerResults,
      reviewResults,
    ] = await Promise.allSettled([
      getInventories(),
      getSubscriptionPlans(),
      getSubscription(),
      getCreditUsage(),
      getCrediteBalance(),
      getAllCustomers(),
      getReviews(),
    ]);

    const branchInventories = inventoryResults.status === 'fulfilled' ? inventoryResults.value : null;
    const subscriptionPlans = subsriptionPlanResults.status === 'fulfilled' ? subsriptionPlanResults.value : null;
    const subscription = subscriptionResults.status === 'fulfilled' ? subscriptionResults.value : null;
    const creditUsage = creditUsageResults.status === 'fulfilled' ? creditUsageResults.value : null;
    const creditBalance = creditBalanceResults.status === 'fulfilled' ? creditBalanceResults.value : null;

    const customers = customerResults.status === 'fulfilled' ? customerResults.value : null;
    const reviews = reviewResults.status === 'fulfilled' ? reviewResults.value : null;

    return {
      branchInventories: branchInventories?.data.data,
      subscriptionPlans: subscriptionPlans?.data,
      subscription: subscription?.data,
      creditUsage: creditUsage?.data,
      creditBalance: creditBalance?.data,
      customers: { data: customers?.data.data, pagination: customers?.data.pagination },
      reviews: { data: reviews?.data.data, pagination: reviews?.data.pagination },
    };
  } catch (error: any) {
    console.error('error in Tenant contextLoader:', error.message);
  }
}

export const RootLoaderWrapper = ({
  data,
  children,
}: {
  data: {
    user: User;
    org: OrganizationPayload;
    products: Product[];
    productOptions: ProductOption[];
    branches: IBranch[];
    zones: IZone[];
    areas: IArea[];
    branchInventories: IBranchInventory[];
    subscriptionPlans: ISubscriptionPlan[];
    subscription: ISubscription;
    creditUsage: UsageRecordAttributes[];
    creditBalance: CreditBalanceAttributes;
    orders: IOrder[];
    customers: { data: Customer[]; pagination: Pagination };
    reviews: { data: IReview[]; pagination: Pagination };
  };
  children: React.ReactNode;
}) => {
  const setUser = useUserSetRecoilState();
  const setOrg = useOrgSetRecoilState();
  const setWhatsapp = useWhatsappSetRecoilState();
  const setProducts = useProductsSetRecoilState();
  const setProductOptions = useProductOptionSetRecoilState();
  const setBranches = useBranchSetRecoilState();

  const setBranchInventory = useBranchInventorySetRecoilState();
  const setSubscriptionPlan = useSubscriptionPlanSetRecoilState();
  const setSubscription = useSubscriptionSetRecoilState();
  const setCreditUsage = useCreditUsageSetRecoilState();
  const setCreditBalance = useCreditBalanceSetRecoilState();

  const setCustomers = useCustomersSetRecoilState();
  const setReviews = useReviewsSetRecoilState();

  React.useEffect(() => {
    if (!data) return;
    if (data.branchInventories) {
      setBranchInventory(data.branchInventories);
    }
    if (data.subscriptionPlans) {
      setSubscriptionPlan(data.subscriptionPlans);
    }
    if (data.subscription) {
      setSubscription(data.subscription);
    }
    if (data.creditUsage) {
      setCreditUsage(data.creditUsage);
    }
    if (data.creditBalance) {
      setCreditBalance(data.creditBalance);
    }
    if (data.customers.data) {
      setCustomers(data.customers.data);
      // setPagination(data.customers.pagination);
    }
    if (data.reviews.data) {
      setReviews(data.reviews.data);
      // setReviews(data.reviews.pagination);
    }
  }, [data, setUser, setOrg, setProductOptions, setWhatsapp, setProducts, setBranches, setBranchInventory]);

  return <>{children}</>;
};
