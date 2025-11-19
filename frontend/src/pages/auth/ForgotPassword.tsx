import React, { useState } from 'react';
import ForgotPasswordForm from '../../components/organisms/ForgotPasswordForm/ForgotPasswordForm';
import AuthTemplate from '../../components/templates/AuthTemplate/AuthTemplate';
import { PageRoutes } from '../../routes';
import { useNavigate } from 'react-router';
import { AuthService } from '../../services/authService';

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { createPasswordResetLink } = new AuthService();

  const handleResetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      await createPasswordResetLink(email);
      setIsLoading(false);
      alert('kindly check your email for password reset link');
    } catch (error: any) {
      setIsLoading(false);
      alert('something went wrong, please try again');
    }
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
