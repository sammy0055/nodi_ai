import React, { useState } from 'react';
import SignUpForm from '../../components/organisms/SignUpForm/SignUpForm';
import AuthTemplate from '../../components/templates/AuthTemplate/AuthTemplate';
import { PageRoutes } from '../../routes';
import { useNavigate } from 'react-router';
import { AuthService } from '../../services/authService';

const SignUpPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const handleSignUp = async (email: string, password: string, name: string) => {
    const authService = new AuthService();
    const { data } = await authService.signUp({ email, password, name });
    if (data) navigate("/app");
  };

  const handleGoogleSignUp = () => {
    setIsLoading(true);
    console.log('Signing up with Google');
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Google sign up successful!');
    }, 1500);
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
