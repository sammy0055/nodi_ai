import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { RecoilRoot } from 'recoil';
import App from '../App';
import TenantRoutes from './TenantRoutes';
import AuthRoutes from './AuthRoute';
import { contextLoader } from '../contexts/TenantContext';
import AdminAuthRoutes from './AdminAuthRoute';
import { adminLayoutLoader, adminRequestLoader, adminSubscriptonLoader } from '../contexts/AdminContext';
import RequestRoutePage from '../pages/admin/RequestRoutePage';
import WhatsAppDetailsPage from '../pages/admin/WhatsAppDetailsPage';
import SubscriptionPlansPage from '../pages/admin/SubscriptionPlanPage';
import AdminLayout from '../layouts/AdminLayout';

export const PageRoutes = {
  LOGIN: 'sign-in',
  SIGNUP: 'sign-up',
  FORGOT_PASSWORD: 'forgot-password',
  CREATE_ORGANIZATION: 'create-organization',
  APP_DASHBOARD: 'dashboard',
  ORDERS: 'orders',
  SETTINGS: 'settings',
  PRODUCTS: 'products',
  BRANCHS: 'branches',
  AreasZones: 'areasZones',
  INVENTORY: 'inventory',
  CUSTOMERS: 'customers',
  BILLING: 'billing',
  ADMIN_DASHBOARD: 'dashboard',
  ADMIN_UPDATE_WABA: 'update-waba',
  ADMIN_SUBSCRIPTION_PLAN: 'subscriptions',
  REVIEWS: 'reviews',
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
    path: '*',
    element: <div>NoFound routes</div>,
  },
  {
    path: '/admin/*',
    element: <AdminLayout />,
    loader: adminLayoutLoader,
    children: [
      { index: true, element: <Navigate to="dashboard" /> },
      { path: 'dashboard', element: <div>admin dashboard page</div> },
      { path: 'request', element: <RequestRoutePage />, loader: adminRequestLoader },
      { path: 'billing', element: <div>billing page</div>, loader: () => '' },
      { path: PageRoutes.ADMIN_UPDATE_WABA, element: <WhatsAppDetailsPage />, loader: () => '' },
      { path: PageRoutes.ADMIN_SUBSCRIPTION_PLAN, element: <SubscriptionPlansPage />, loader: adminSubscriptonLoader },
    ],
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
