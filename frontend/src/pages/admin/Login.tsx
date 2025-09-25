import React, { useState } from 'react';
import LoginForm from '../../components/organisms/LoginForm/LoginForm';
import AuthTemplate from '../../components/templates/AuthTemplate/AuthTemplate';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import { AdminUserService } from '../../services/admin/AdminUserService';

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    const authService = new AdminUserService();
    const { data } = await authService.login(email, password);
    if (data) navigate('/admin');
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    console.log('Logging in with Google');
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Google login successful!');
    }, 1500);
  };

  return (
    <AuthTemplate title="Welcome back" subtitle="Sign in to your AI Agent dashboard">
      <LoginForm
        onLogin={handleLogin}
        onGoogleLogin={handleGoogleLogin}
        onForgotPassword={() => navigate(`/app/auth/${PageRoutes.FORGOT_PASSWORD}`)}
        onSignUp={() => navigate(`/app/auth/${PageRoutes.SIGNUP}`)}
        isLoading={isLoading}
      />
    </AuthTemplate>
  );
};

export default LoginPage;
