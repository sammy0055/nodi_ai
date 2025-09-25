// src/store/authAtoms.ts
import { atom, useSetRecoilState, useRecoilValue } from 'recoil';
import uuid from 'react-uuid';
import type { AdminUser } from '../../types/users';
import type { BaseRequestAttributes } from '../../types/request';

export const userAtom = atom<AdminUser | null>({
  key: uuid(),
  default: null,
});

export const useAdminUserValue = (): AdminUser | null => useRecoilValue(userAtom);
export const useAdminUserSetRecoilState = () => useSetRecoilState(userAtom);

export const requestAtom = atom<BaseRequestAttributes[] | []>({
  key: uuid(),
  default: [],
});

export const useRequestValue = (): BaseRequestAttributes[] | [] => useRecoilValue(requestAtom);
export const useRequestSetRecoilState = () => useSetRecoilState(requestAtom);
