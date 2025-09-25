import React, { useState } from 'react';
import ForgotPasswordForm from '../../components/organisms/ForgotPasswordForm/ForgotPasswordForm';
import AuthTemplate from '../../components/templates/AuthTemplate/AuthTemplate';
import { PageRoutes } from '../../routes';
import { useNavigate } from 'react-router';

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
const navigate = useNavigate();
  const handleResetPassword = (email: string) => {
    setIsLoading(true);
    console.log('Resetting password for:', email);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Password reset email sent!');
    }, 1500);
  };
  return (
    <AuthTemplate title="Reset password" subtitle="We'll help you get back into your account">
      <ForgotPasswordForm
        onResetPassword={handleResetPassword}
        onBackToLogin={() => navigate(`/app/auth/${PageRoutes.LOGIN}`)}
        isLoading={isLoading}
      />
    </AuthTemplate>
  );
};

export default ForgotPasswordPage;
