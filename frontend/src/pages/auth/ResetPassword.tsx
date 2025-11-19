import React, { useState, useEffect } from 'react';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import Button from '../../components/atoms/Button/Button';
import { useSearchParams, useNavigate } from 'react-router';
import { AuthService } from '../../services/authService';

interface ValidationRule {
  isValid: boolean;
  message: string;
}

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = new AuthService();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);

  // Password validation rules
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([
    { isValid: false, message: 'At least 8 characters' },
    { isValid: false, message: 'One uppercase letter' },
    { isValid: false, message: 'One lowercase letter' },
    { isValid: false, message: 'One number' },
    { isValid: false, message: 'One special character' },
  ]);

  // Check if token is present
  useEffect(() => {
    if (!token) {
      setErrors({ general: 'Invalid or expired reset token. Please request a new password reset.' });
    }
  }, [token]);

  // Validate password against rules
  const validatePassword = (password: string) => {
    const rules = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    ];

    return validationRules.map((rule, index) => ({
      ...rule,
      isValid: rules[index],
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Update password validation rules
    if (name === 'password') {
      setValidationRules(validatePassword(value));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Check if all password rules are met
    const allRulesValid = validationRules.every((rule) => rule.isValid);
    if (!allRulesValid) {
      newErrors.password = 'Password does not meet all requirements';
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Check if confirm password is filled
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (!token) {
        setErrors({
          general: 'error with the link, pls try again',
        });
      }

      await resetPassword(token!, formData.password);
      setSuccess(true);
      navigate('/app');
    } catch (error: any) {
      setErrors({
        general: error.message || 'Failed to reset password. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheck className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold text-neutral-900">Password Reset Successful</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Your password has been reset successfully. You will be redirected to the login page shortly.
            </p>
            <div className="mt-8">
              <Button onClick={() => navigate('/app/login')}>Go to Login</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <FiLock className="text-primary-600 text-xl" />
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-neutral-900">Reset your password</h2>
          <p className="mt-2 text-sm text-neutral-600">Enter your new password below</p>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <FiX className="text-red-600 mr-2" />
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white py-8 px-4 shadow-medium sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* New Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-lg placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                  )}
                </button>
              </div>

              {/* Password Validation Rules */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  {validationRules.map((rule, index) => (
                    <div key={index} className="flex items-center text-sm">
                      {rule.isValid ? (
                        <FiCheck className="text-green-500 mr-2" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-neutral-300 mr-2" />
                      )}
                      <span className={rule.isValid ? 'text-green-600' : 'text-neutral-500'}>{rule.message}</span>
                    </div>
                  ))}
                </div>
              )}

              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-lg placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 pr-10"
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-neutral-400 hover:text-neutral-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                className="w-full flex justify-center"
                disabled={isLoading || !token}
                isLoading={isLoading}
              >
                Reset Password
              </Button>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/app/login')}
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                Back to login
              </button>
            </div>
          </form>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Password Security Tips</h4>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li className="flex items-start">
              <FiCheck className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Use a unique password that you don't use elsewhere</span>
            </li>
            <li className="flex items-start">
              <FiCheck className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Consider using a password manager</span>
            </li>
            <li className="flex items-start">
              <FiCheck className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <span>Avoid using personal information in your password</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
