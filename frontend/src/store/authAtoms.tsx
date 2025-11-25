// src/store/authAtoms.ts
import { atom, useSetRecoilState, useRecoilValue } from 'recoil';
import uuid from 'react-uuid';
import type { User } from '../types/users';
import type { IOrganization } from '../types/organization';
import type { IWhatSappSettings } from '../types/whatsapp';
import type { Product, ProductOption } from '../types/product';
import type { IArea, IBranch, IBranchInventory, IZone } from '../types/branch';
import type {
  CreditBalanceAttributes,
  ISubscription,
  ISubscriptionPlan,
  UsageRecordAttributes,
} from '../types/subscription';
import type { IOrder } from '../pages/tenant/OrderPage';
import type { Customer, Pagination } from '../types/customer';
import type { IReview } from '../pages/tenant/ReviewPage';

export const userAtom = atom<User | null>({
  key: uuid(),
  default: null,
});

export const orgAtom = atom<IOrganization>({
  key: uuid(),
  default: {
    id: '',
    name: '',
    brandTone: '',
    businessType: 'bakery',
    AIAssistantName: '',
    currency: 'LBP',
    status: 'active',
  },
});

export const whatsappAtom = atom<IWhatSappSettings | null>({
  key: uuid(),
  default: null,
});

export const productsAtom = atom<Product[] | []>({
  key: uuid(),
  default: [],
});

export const productOptionAtom = atom<ProductOption[] | []>({
  key: uuid(),
  default: [],
});

export const branchAtom = atom<IBranch[] | []>({
  key: uuid(),
  default: [],
});

export const zoneAtom = atom<IZone[] | []>({
  key: uuid(),
  default: [],
});

export const branchInventoryAtom = atom<IBranchInventory[] | []>({
  key: uuid(),
  default: [],
});

export const areaAtom = atom<IArea[] | []>({
  key: uuid(),
  default: [],
});

export const subscriptionPlansAtom = atom<ISubscriptionPlan[] | []>({
  key: uuid(),
  default: [],
});

export const subscriptionAtom = atom<ISubscription | null>({
  key: uuid(),
  default: null,
});

export const creditUsageAtom = atom<UsageRecordAttributes[] | []>({
  key: uuid(),
  default: [],
});

export const creditBalanceAtom = atom<CreditBalanceAttributes | null>({
  key: uuid(),
  default: null,
});

export const ordersAtom = atom<IOrder[] | []>({
  key: uuid(),
  default: [],
});

export const customerAtom = atom<Customer[] | []>({
  key: uuid(),
  default: [],
});

export const reviewAtom = atom<IReview[] | []>({
  key: uuid(),
  default: [],
});

export const paginationAtom = atom<Pagination | null>({
  key: uuid(),
  default: null,
});

// Read values
export const useUserValue = (): User | null => useRecoilValue(userAtom);
export const useOrgValue = (): IOrganization => useRecoilValue(orgAtom);
export const useWhatsappValue = (): IWhatSappSettings | null => useRecoilValue(whatsappAtom);
export const useProductsValue = (): Product[] | [] => useRecoilValue(productsAtom);
export const useProductOptionValue = (): ProductOption[] | [] => useRecoilValue(productOptionAtom);
export const useBranchValue = (): IBranch[] | [] => useRecoilValue(branchAtom);
export const useZoneValue = (): IZone[] | [] => useRecoilValue(zoneAtom);
export const useAreaValue = (): IArea[] | [] => useRecoilValue(areaAtom);
export const useBranchInventoryValue = (): IBranchInventory[] | [] => useRecoilValue(branchInventoryAtom);
export const useSubscriptionPlanValue = (): ISubscriptionPlan[] | [] => useRecoilValue(subscriptionPlansAtom);
export const useSubscriptionValue = (): ISubscription | null => useRecoilValue(subscriptionAtom);
export const useCreditUsageValue = (): UsageRecordAttributes[] | [] => useRecoilValue(creditUsageAtom);
export const useCreditBalanceValue = (): CreditBalanceAttributes | null => useRecoilValue(creditBalanceAtom);
export const useOrdersValue = (): IOrder[] | [] => useRecoilValue(ordersAtom);
export const useCustomerValue = (): Customer[] | [] => useRecoilValue(customerAtom);
export const useReviewValue = (): IReview[] | [] => useRecoilValue(reviewAtom);
export const usePaginationValue = (): Pagination | null => useRecoilValue(paginationAtom);

// Set values
export const useUserSetRecoilState = () => useSetRecoilState(userAtom);
export const useOrgSetRecoilState = () => useSetRecoilState(orgAtom);
export const useWhatsappSetRecoilState = () => useSetRecoilState(whatsappAtom);
export const useProductsSetRecoilState = () => useSetRecoilState(productsAtom);
export const useProductOptionSetRecoilState = () => useSetRecoilState(productOptionAtom);
export const useBranchSetRecoilState = () => useSetRecoilState(branchAtom);
export const useZoneSetRecoilState = () => useSetRecoilState(zoneAtom);
export const useAreaSetRecoilState = () => useSetRecoilState(areaAtom);
export const useBranchInventorySetRecoilState = () => useSetRecoilState(branchInventoryAtom);
export const useSubscriptionPlanSetRecoilState = () => useSetRecoilState(subscriptionPlansAtom);
export const useSubscriptionSetRecoilState = () => useSetRecoilState(subscriptionAtom);
export const useCreditUsageSetRecoilState = () => useSetRecoilState(creditUsageAtom);
export const useCreditBalanceSetRecoilState = () => useSetRecoilState(creditBalanceAtom);
export const useOrdersSetRecoilState = () => useSetRecoilState(ordersAtom);
export const useCustomersSetRecoilState = () => useSetRecoilState(customerAtom);
export const useReviewsSetRecoilState = () => useSetRecoilState(reviewAtom);
export const usePaginationSetRecoilState = () => useSetRecoilState(paginationAtom);
