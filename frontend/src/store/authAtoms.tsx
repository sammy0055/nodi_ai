// src/store/authAtoms.ts
import { atom, useSetRecoilState, useRecoilValue } from 'recoil';
import uuid from 'react-uuid';
import type { User } from '../types/users';
import type { IOrganization } from '../types/organization';
import type { IWhatSappSettings } from '../types/whatsapp';
import type { Product, ProductOption } from '../types/product';
import type { IArea, IBranch, IBranchInventory, IZone } from '../types/branch';

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
