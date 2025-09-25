import { Navigate, Route, Routes, useLoaderData } from 'react-router';
import AdminLayout from '../layouts/AdminLayout';
import RequestRoutePage from '../pages/admin/RequestRoutePage';
import { AdminRootLoaderWrapper } from '../contexts/AdminContext';

export default function AdminRoutes() {
   const data = useLoaderData();
  return (
    <AdminRootLoaderWrapper data={data}>
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<div>admin dashboard page</div>} />
        <Route path="request" element={<RequestRoutePage />} />
        <Route path="billing" element={<div>billing page</div>} />
      </Routes>
    </AdminLayout>
    </AdminRootLoaderWrapper>
  );
}
