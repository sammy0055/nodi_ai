import { createBrowserRouter, RouterProvider } from 'react-router';
import { RecoilRoot } from 'recoil';
import App from '../App';
import TenantRoutes from './TenantRoutes';
import AdminRoutes from './AdminRoutes';
import AuthRoutes from './AuthRoute';
import { contextLoader } from '../contexts/TenantContext';
import AdminAuthRoutes from './AdminAuthRoute';
import { adminContextLoader } from '../contexts/AdminContext';
import WhatsAppRedirect from '../pages/tenant/WhatsAppRedirect';

export const PageRoutes = {
  LOGIN: 'sign-in',
  SIGNUP: 'sign-up',
  FORGOT_PASSWORD: 'forgot-password',
  CREATE_ORGANIZATION: 'create-organization',
  APP_DASHBOARD: 'dashboard',
  ORDERS: 'orders',
  SETTINGS: 'settings',
  PRODUCTS: 'products',
  INVENTORY: 'inventory',
  CUSTOMERS: 'customers',
  BILLING: 'billing',
  ADMIN_DASHBOARD: 'dashboard',
} as const;

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/app/*',
    element: <TenantRoutes />,
    loader: contextLoader,
  },
  {
    path: '/app/auth/*',
    element: <AuthRoutes />,
  },
  {
    path: '/app/whatsapp-redirect',
    element: <WhatsAppRedirect />,
  },
  {
    path: '*',
    element: <div>NoFound routes</div>,
  },
  {
    path: '/admin/*',
    element: <AdminRoutes />,
    loader: adminContextLoader,
  },
  {
    path: '/admin/auth/*',
    element: <AdminAuthRoutes />,
  },
]);

export function AppRoutes() {
  return (
    <RecoilRoot>
      <RouterProvider router={router} />
    </RecoilRoot>
  );
}
