import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { RecoilRoot } from 'recoil';
import App from '../App';
import AuthRoutes from './AuthRoute';
import {
  areaAndZoneContextLoader,
  billingContextLoader,
  branchContextLoader,
  customerContextLoader,
  inventoryContextLoader,
  ordersContextLoader,
  productContextLoader,
  reviewContextLoader,
  settingsContextLoader,
  tenantContextLoader,
} from '../contexts/TenantContext';
import AdminAuthRoutes from './AdminAuthRoute';
import {
  adminConversationLoader,
  adminLayoutLoader,
  adminNotificationLoader,
  adminOrganizationStatisticsLoader,
  adminRequestLoader,
  adminSettingsLoader,
  adminSubscriptonLoader,
} from '../contexts/AdminContext';
import RequestRoutePage from '../pages/admin/RequestRoutePage';
import SubscriptionPlansPage from '../pages/admin/SubscriptionPlanPage';
import AdminLayout from '../layouts/AdminLayout';
import OrganizationsPage from '../pages/admin/OrganizationsPage';
import ConversationLogsPage from '../pages/admin/ConversationLogPage';
import NotificationsPage from '../pages/admin/NotificationsPage';
import EmailSettingsPage from '../pages/admin/SettingsPage';
import { TenantLayout } from '../layouts/TenantLayout';
import OrdersPage from '../pages/tenant/OrderPage';
import AreasZonesPage from '../pages/tenant/AreasZonesPage';
import BranchesPage from '../pages/tenant/BranchPage';
import ProductsPage from '../pages/tenant/ProductsPage';
import BranchInventoryPage from '../pages/tenant/BranchInventoryPage';
import CustomersPage from '../pages/tenant/CustomerPage';
import ReviewsPage from '../pages/tenant/ReviewPage';
import BillingPage from '../pages/tenant/BillingPage';
import SettingsPage from '../pages/tenant/Settings';
import { PrivacyPolicy } from '../pages/privacyPolicy';

export const PageRoutes = {
  LOGIN: 'sign-in',
  SIGNUP: 'sign-up',
  FORGOT_PASSWORD: 'forgot-password',
  RESET_PASSWORD: 'reset-password',
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
  ADMIN_SUBSCRIPTION_PLAN: 'subscriptions',
  ADMIN_ORGANIZATIONS: 'organizations',
  ADMIN_CONVERSATION_LOGS: 'conversations',
  ADMIN_ACTIVITIES: 'activities',
  ADMIN_SETTINGS: 'settings',
  REVIEWS: 'reviews',
} as const;

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/privacy_policy',
    element: <PrivacyPolicy />,
  },
  {
    path: '/app/*',
    element: <TenantLayout />,
    loader: tenantContextLoader,
    children: [
      { index: true, element: <Navigate to={PageRoutes.ORDERS} /> },
      { path: PageRoutes.ORDERS, element: <OrdersPage />, loader: ordersContextLoader },
      { path: PageRoutes.AreasZones, element: <AreasZonesPage />, loader: areaAndZoneContextLoader },
      { path: PageRoutes.BRANCHS, element: <BranchesPage />, loader: branchContextLoader },
      { path: PageRoutes.PRODUCTS, element: <ProductsPage />, loader: productContextLoader },
      { path: PageRoutes.INVENTORY, element: <BranchInventoryPage />, loader: inventoryContextLoader },
      { path: PageRoutes.CUSTOMERS, element: <CustomersPage />, loader: customerContextLoader },
      { path: PageRoutes.REVIEWS, element: <ReviewsPage />, loader: reviewContextLoader },
      { path: PageRoutes.BILLING, element: <BillingPage />, loader: billingContextLoader },
      { path: PageRoutes.SETTINGS, element: <SettingsPage />, loader: settingsContextLoader },
    ],
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
      { index: true, element: <Navigate to="request" /> },
      { path: 'request', element: <RequestRoutePage />, loader: adminRequestLoader },
      { path: PageRoutes.ADMIN_SUBSCRIPTION_PLAN, element: <SubscriptionPlansPage />, loader: adminSubscriptonLoader },
      {
        path: PageRoutes.ADMIN_ORGANIZATIONS,
        element: <OrganizationsPage />,
        loader: adminOrganizationStatisticsLoader,
      },
      {
        path: PageRoutes.ADMIN_CONVERSATION_LOGS,
        element: <ConversationLogsPage />,
        loader: adminConversationLoader,
      },
      {
        path: PageRoutes.ADMIN_ACTIVITIES,
        element: <NotificationsPage />,
        loader: adminNotificationLoader,
      },
      {
        path: PageRoutes.ADMIN_SETTINGS,
        element: <EmailSettingsPage />,
        loader: adminSettingsLoader,
      },
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
