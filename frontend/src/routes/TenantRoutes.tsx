import { Navigate, Route, Routes, useLoaderData } from 'react-router';
import { TenantLayout } from '../layouts/TenantLayout';
import { PageRoutes } from '.';
import { RootLoaderWrapper } from '../contexts/TenantContext';
import SettingsPage from '../pages/tenant/Settings';
import ProductsPage from '../pages/tenant/ProductsPage';
import BranchPage from '../pages/tenant/BranchPage';
import BranchInventoryPage from '../pages/tenant/BranchInventoryPage';
import AreasZonesPage from '../pages/tenant/AreasZonesPage';
import BillingPage from '../pages/tenant/BillingPage';
import OrdersPage from '../pages/tenant/OrderPage';
import CustomersPage from '../pages/tenant/CustomerPage';

export default function TenantRoutes() {
  const data = useLoaderData();
  return (
    <RootLoaderWrapper data={data}>
      <TenantLayout>
        <Routes>
          <Route path="/" element={<Navigate to={PageRoutes.APP_DASHBOARD} />} />
          {/* <Route path={PageRoutes.APP_DASHBOARD} element={<div>dashboard page here</div>} /> */}
          <Route path={PageRoutes.ORDERS} element={<OrdersPage />} />
          <Route path={PageRoutes.PRODUCTS} element={<ProductsPage />} />
          <Route path={PageRoutes.INVENTORY} element={<BranchInventoryPage />} />
          <Route path={PageRoutes.CUSTOMERS} element={<CustomersPage/>} />
          <Route path={PageRoutes.BILLING} element={<BillingPage />} />
          <Route path={PageRoutes.BRANCHS} element={<BranchPage />} />
          <Route path={PageRoutes.AreasZones} element={<AreasZonesPage />} />
          <Route path={PageRoutes.SETTINGS} element={<SettingsPage />} />
        </Routes>
      </TenantLayout>
    </RootLoaderWrapper>
  );
}
