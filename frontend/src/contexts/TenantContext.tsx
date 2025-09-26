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
} from '../store/authAtoms';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../routes';
import type { User } from '../types/users';
import type { OrganizationPayload } from '../types/organization';
import { ProductService } from '../services/productService';
import type { Product, ProductOption } from '../types/product';
import { BranchService } from '../services/branchService';
import type { IBranch } from '../types/branch';

export async function contextLoader() {
  try {
    const { getOrganization } = new OrganizationService();
    const { fetchCurrentUser } = new UserService();
    const { getProducts, getProductOptions } = new ProductService();
    const { getBranches } = new BranchService();
    const [userResult, orgResult, productsResult, pOptionResults, branchResults] = await Promise.allSettled([
      fetchCurrentUser(),
      getOrganization(),
      getProducts(),
      getProductOptions(),
      getBranches(),
    ]);

    const user = userResult.status === 'fulfilled' ? userResult.value : null;
    const org = orgResult.status === 'fulfilled' ? orgResult.value : null;
    const products = productsResult.status === 'fulfilled' ? productsResult.value : null;
    const productOptons = pOptionResults.status === 'fulfilled' ? pOptionResults.value : null;
    const branches = branchResults.status === 'fulfilled' ? branchResults.value : null;

    return {
      user: user?.data,
      org: org?.data,
      products: products?.data.data,
      productOptions: productOptons?.data,
      branches: branches?.data.data,
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
  };
  children: React.ReactNode;
}) => {
  const setUser = useUserSetRecoilState();
  const setOrg = useOrgSetRecoilState();
  const setWhatsapp = useWhatsappSetRecoilState();
  const setProducts = useProductsSetRecoilState();
  const setProductOptions = useProductOptionSetRecoilState();
  const setBranches = useBranchSetRecoilState();
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
    // 🔑 Handle redirects once, based on missing data
    if (!data.user) {
      navigate(`/app/auth/${PageRoutes.LOGIN}`, { replace: true });
    } else if (!data.org) {
      navigate(`/app/auth/${PageRoutes.CREATE_ORGANIZATION}`, { replace: true });
    }
  }, [data, setUser, setOrg]);

  return <>{children}</>;
};
