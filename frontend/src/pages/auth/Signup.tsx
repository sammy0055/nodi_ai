import React, { useState } from 'react';
import SignUpForm from '../../components/organisms/SignUpForm/SignUpForm';
import AuthTemplate from '../../components/templates/AuthTemplate/AuthTemplate';
import { PageRoutes } from '../../routes';
import { useNavigate } from 'react-router';
import { AuthService } from '../../services/authService';
import type { CodeResponse } from '@react-oauth/google';

const SignUpPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, signupWithGoogle } = new AuthService();
  const handleSignUp = async (email: string, password: string, name: string) => {
    const { data } = await signUp({ email, password, name });
    if (data) navigate('/app');
  };

  const handleGoogleSignUp = async (credentialResponse: CodeResponse) => {
    setIsLoading(true);
    await signupWithGoogle(credentialResponse.code);
    setIsLoading(true);
    navigate('/app');
  };
  return (
    <AuthTemplate title="Create account" subtitle="Get started with AI Agents for your e-commerce">
      <SignUpForm
        onSignUp={handleSignUp}
        onGoogleSignUp={handleGoogleSignUp}
        onLogin={() => navigate(`/app/auth/${PageRoutes.LOGIN}`)}
        isLoading={isLoading}
      />
    </AuthTemplate>
  );
};

export default SignUpPage;
