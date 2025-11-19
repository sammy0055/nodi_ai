import React, { useState } from 'react';
import LoginForm from '../../components/organisms/LoginForm/LoginForm';
import AuthTemplate from '../../components/templates/AuthTemplate/AuthTemplate';
import { useNavigate } from 'react-router';
import { PageRoutes } from '../../routes';
import { AuthService } from '../../services/authService';
import type { CodeResponse } from '@react-oauth/google';

const LoginPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const authService = new AuthService();
  const handleLogin = async (email: string, password: string) => {
    const { data } = await authService.login(email, password);
    if (data) navigate('/app');
  };

  const handleGoogleLogin = async (credentialResponse: CodeResponse) => {
    setIsLoading(true);
    await authService.signinWithGoogle(credentialResponse.code);
    navigate('/app');
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
