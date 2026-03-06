import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'outline',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'rounded-lg font-medium transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';

  const variantClasses = {
    primary: 'bg-[#0284c7] !text-white hover:bg-[#0369a1] focus:ring-[#0ea5e9] shadow-md hover:shadow-lg',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus:ring-neutral-500',
    outline: 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500',
    danger: 'bg-[#dc2626] !text-white hover:bg-[#b91c1c] focus:ring-[#ef4444] shadow-md hover:shadow-lg',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;


interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  id = 'toggle',
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className="flex items-center">
      <button
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        id={id}
        onClick={handleToggle}
        className={`
          relative inline-flex items-center h-6 rounded-full w-11
          transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${checked ? 'bg-blue-600' : 'bg-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block w-4 h-4 transform transition-transform bg-white rounded-full
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      {label && (
        <label htmlFor={id} className="ml-3 text-sm text-gray-700 select-none">
          {label}
        </label>
      )}
    </div>
  );
};


