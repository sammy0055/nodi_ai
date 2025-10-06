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
  useZoneSetRecoilState,
  useAreaSetRecoilState,
  useSubscriptionPlanSetRecoilState,
  useSubscriptionSetRecoilState,
  useCreditUsageSetRecoilState,
  useCreditBalanceSetRecoilState,
  useOrdersSetRecoilState,
} from '../store/authAtoms';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../routes';
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

export async function contextLoader() {
  try {
    const { getOrganization } = new OrganizationService();
    const { fetchCurrentUser } = new UserService();
    const { getProducts, getProductOptions } = new ProductService();
    const { getBranches, getZones, getAreas } = new BranchService();
    const { getInventories } = new BranchInventoryService();
    const { getSubscriptionPlans, getSubscription, getCrediteBalance, getCreditUsage } = new SubscriptionService();
    const { getOrders } = new OrderService();
    const [
      userResult,
      orgResult,
      productsResult,
      pOptionResults,
      branchResults,
      zoneResults,
      areaResults,
      inventoryResults,
      subsriptionPlanResults,
      subscriptionResults,
      creditUsageResults,
      creditBalanceResults,
      orderResults,
    ] = await Promise.allSettled([
      fetchCurrentUser(),
      getOrganization(),
      getProducts(),
      getProductOptions(),
      getBranches(),
      getZones(),
      getAreas(),
      getInventories(),
      getSubscriptionPlans(),
      getSubscription(),
      getCreditUsage(),
      getCrediteBalance(),
      getOrders(),
    ]);

    const user = userResult.status === 'fulfilled' ? userResult.value : null;
    const org = orgResult.status === 'fulfilled' ? orgResult.value : null;
    const products = productsResult.status === 'fulfilled' ? productsResult.value : null;
    const productOptons = pOptionResults.status === 'fulfilled' ? pOptionResults.value : null;
    const branches = branchResults.status === 'fulfilled' ? branchResults.value : null;
    const branchInventories = inventoryResults.status === 'fulfilled' ? inventoryResults.value : null;
    const zones = zoneResults.status === 'fulfilled' ? zoneResults.value : null;
    const areas = areaResults.status === 'fulfilled' ? areaResults.value : null;
    const subscriptionPlans = subsriptionPlanResults.status === 'fulfilled' ? subsriptionPlanResults.value : null;
    const subscription = subscriptionResults.status === 'fulfilled' ? subscriptionResults.value : null;
    const creditUsage = creditUsageResults.status === 'fulfilled' ? creditUsageResults.value : null;
    const creditBalance = creditBalanceResults.status === 'fulfilled' ? creditBalanceResults.value : null;
    const orders = orderResults.status === 'fulfilled' ? orderResults.value : null;

    return {
      user: user?.data,
      org: org?.data,
      products: products?.data.data,
      productOptions: productOptons?.data,
      branches: branches?.data.data,
      zones: zones?.data.data,
      areas: areas?.data.data,
      branchInventories: branchInventories?.data.data,
      subscriptionPlans: subscriptionPlans?.data,
      subscription: subscription?.data,
      creditUsage: creditUsage?.data,
      creditBalance: creditBalance?.data,
      orders: orders?.data.data,
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
  };
  children: React.ReactNode;
}) => {
  const setUser = useUserSetRecoilState();
  const setOrg = useOrgSetRecoilState();
  const setWhatsapp = useWhatsappSetRecoilState();
  const setProducts = useProductsSetRecoilState();
  const setProductOptions = useProductOptionSetRecoilState();
  const setBranches = useBranchSetRecoilState();
  const setZones = useZoneSetRecoilState();
  const setAreas = useAreaSetRecoilState();
  const setBranchInventory = useBranchInventorySetRecoilState();
  const setSubscriptionPlan = useSubscriptionPlanSetRecoilState();
  const setSubscription = useSubscriptionSetRecoilState();
  const setCreditUsage = useCreditUsageSetRecoilState();
  const setCreditBalance = useCreditBalanceSetRecoilState();
  const setOrders = useOrdersSetRecoilState();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!data) return;
    if (data.user) {
      setUser(data.user);
    }

    if (data.org) {
      setOrg(data.org);
      if (data.org.whatsappsettings) {
        setWhatsapp(data.org.whatsappsettings[0]);
      }
    }

    if (data.products) {
      setProducts(data.products);
    }
    if (data.productOptions) {
      setProductOptions(data.productOptions);
    }
    if (data.branches) {
      setBranches(data.branches);
    }
    if (data.zones) {
      setZones(data.zones);
    }
    if (data.areas) {
      setAreas(data.areas);
    }
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
    if (data.orders) {
      setOrders(data.orders);
    }
    // 🔑 Handle redirects once, based on missing data
    if (!data.user) {
      navigate(`/app/auth/${PageRoutes.LOGIN}`, { replace: true });
    } else if (!data.org) {
      navigate(`/app/auth/${PageRoutes.CREATE_ORGANIZATION}`, { replace: true });
    }
  }, [data, setUser, setOrg, setProductOptions, setWhatsapp, setProducts, setBranches, setBranchInventory]);

  return <>{children}</>;
};
