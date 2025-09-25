import React, { useState } from 'react';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import Input from '../../atoms/Input/Input';
import Button from '../../atoms/Button/Button';

interface ForgotPasswordFormProps {
  onResetPassword: (email: string) => void;
  onBackToLogin: () => void;
  isLoading?: boolean;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onResetPassword,
  onBackToLogin,
  isLoading = false,
}) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResetPassword(email);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <p className="text-neutral-600 mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>
      
      <Input
        id="email"
        label="Email address"
        type="email"
        placeholder="name@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        leftIcon={<FiMail className="text-neutral-400" />}
      />
      
      <Button type="submit" className="w-full" isLoading={isLoading}>
        Send reset link
      </Button>
      
      <div className="text-center mt-6">
        <button
          type="button"
          onClick={onBackToLogin}
          className="flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
        >
          <FiArrowLeft className="mr-2" />
          Back to sign in
        </button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;