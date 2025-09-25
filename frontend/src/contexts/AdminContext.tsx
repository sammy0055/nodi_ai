import React from 'react';
import { useNavigate } from 'react-router';
import { AdminUserService } from '../services/admin/AdminUserService';
import { useAdminUserSetRecoilState, useRequestSetRecoilState } from '../store/admin/authAtoms';

export async function adminContextLoader() {
  try {
    const { fetchCurrentUser, getRequests } = new AdminUserService();
    const [userResult, requests] = await Promise.allSettled([fetchCurrentUser(), getRequests()]);

    const user = userResult.status === 'fulfilled' ? userResult.value : null;
    const req = requests.status === 'fulfilled' ? requests.value : null;

    return { user: user?.data, requests: req?.data };
  } catch (error: any) {
    console.error('error in Tenant contextLoader:', error.message);
  }
}

export const AdminRootLoaderWrapper = ({ data, children }: { data: any; children: React.ReactNode }) => {
  const setAdminUser = useAdminUserSetRecoilState();
  const setRequestData = useRequestSetRecoilState();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!data) return;
    if (data.user) {
      setAdminUser(data.user);
    }
    
    if (data.requests) {
      setRequestData(data.requests);
    }

    // 🔑 Handle redirects once, based on missing data
    if (!data.user) {
      navigate(`/admin/auth`, { replace: true });
    }
  }, [data, setAdminUser]);

  return <>{children}</>;
};
