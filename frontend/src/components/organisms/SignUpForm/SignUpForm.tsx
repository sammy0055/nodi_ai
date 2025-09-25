// src/components/organisms/SignUpForm/SignUpForm.tsx
import React, { useState } from 'react';
import { FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import Input from '../../atoms/Input/Input';
import Button from '../../atoms/Button/Button';
import GoogleButton from '../../molecules/GoogleButton/GoogleButton';

interface SignUpFormProps {
  onSignUp: (email: string, password: string, name: string) =>Promise<void> | void;
  onGoogleSignUp: () => void;
  onLogin: () => void;
  isLoading?: boolean;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUp, onGoogleSignUp, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await onSignUp(email, password, name);
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
        id="name"
        label="Full name"
        type="text"
        placeholder="John Doe"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        leftIcon={<FiUser className="text-neutral-400" />}
      />

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

      <Input
        id="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        leftIcon={<FiLock className="text-neutral-400" />}
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Create account
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-neutral-500">Or continue with</span>
        </div>
      </div>

      <GoogleButton onClick={onGoogleSignUp} text="Sign up" />

      <div className="text-center mt-6">
        <p className="text-neutral-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onLogin}
            className="font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
};

export default SignUpForm;
