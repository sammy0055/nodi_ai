import { Navigate, Route, Routes } from 'react-router';
import { AuthLayout } from '../layouts/AuthLayout';
import LoginPage from '../pages/admin/Login';
import { PageRoutes } from '.';

export default function AdminAuthRoutes() {
  return (
    <AuthLayout>
      <Routes>
        <Route path="/" element={<Navigate to={PageRoutes.LOGIN} />} />
        <Route path={PageRoutes.LOGIN} element={<LoginPage />} />
      </Routes>
    </AuthLayout>
  );
}
