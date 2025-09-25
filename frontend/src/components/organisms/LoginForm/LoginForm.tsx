import React, { useState } from 'react';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import Input from '../../atoms/Input/Input';
import Button from '../../atoms/Button/Button';
import GoogleButton from '../../molecules/GoogleButton/GoogleButton';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void> | void;
  onGoogleLogin: () => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
  isLoading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onGoogleLogin, onForgotPassword, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await onLogin(email, password);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      // Handle different error types
      if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during login');
      }
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Error Message Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-error-50 border border-error-200 text-error-700 rounded-lg">
          <FiAlertCircle className="text-error-600 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <Input
        id="email"
        label="Email address"
        type="email"
        placeholder="name@company.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(null); // Clear error when user starts typing
        }}
        required
        leftIcon={<FiMail className="text-neutral-400" />}
        error={error ? '' : undefined} // Pass empty string to show error state
      />

      <Input
        id="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError(null); // Clear error when user starts typing
        }}
        required
        leftIcon={<FiLock className="text-neutral-400" />}
        error={error ? '' : undefined} // Pass empty string to show error state
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200"
        >
          Forgot password?
        </button>
      </div>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Sign in to your account
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-neutral-500">Or continue with</span>
        </div>
      </div>

      <GoogleButton onClick={onGoogleLogin} text="Sign in" />

      <div className="text-center mt-6">
        <p className="text-neutral-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSignUp}
            className="font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
          >
            Sign up
          </button>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
