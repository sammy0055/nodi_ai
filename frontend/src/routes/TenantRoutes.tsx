import { Navigate, Route, Routes, useLoaderData } from 'react-router';
import { TenantLayout } from '../layouts/TenantLayout';
import { PageRoutes } from '.';
import { RootLoaderWrapper } from '../contexts/TenantContext';
import SettingsPage from '../pages/tenant/Settings';
import ProductsPage from '../pages/tenant/ProductsPage';

export default function TenantRoutes() {
  const data = useLoaderData();
  return (
    <RootLoaderWrapper data={data}>
      <TenantLayout>
        <Routes>
          <Route path="/" element={<Navigate to={PageRoutes.APP_DASHBOARD} />} />
          <Route path={PageRoutes.APP_DASHBOARD} element={<div>dashboard page here</div>} />
          <Route path={PageRoutes.ORDERS} element={<div>ORDERS page here</div>} />
          <Route path={PageRoutes.PRODUCTS} element={<ProductsPage />} />
          <Route path={PageRoutes.INVENTORY} element={<div>INVENTORY page here</div>} />
          <Route path={PageRoutes.CUSTOMERS} element={<div>CUSTOMERS page here</div>} />
          <Route path={PageRoutes.BILLING} element={<div>BILLING page here</div>} />
          <Route path={PageRoutes.SETTINGS} element={<SettingsPage />} />
        </Routes>
      </TenantLayout>
    </RootLoaderWrapper>
  );
}
