import React from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  textarea?: boolean;
  rows?: number;
  leftIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  size = 'md',
  textarea = false,
  rows = 3,
  leftIcon,
  className = '', 
  ...props 
}) => {
  const sizeClasses:any = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-4 py-3 text-lg'
  };

  const baseClasses = `w-full rounded-lg border ${error ? 'border-error' : 'border-neutral-300'} focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 ${sizeClasses[size]} ${leftIcon ? 'pl-10' : ''}`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={props.id} className="text-sm font-medium text-neutral-700">
        {label}
      </label>
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        {textarea ? (
          <textarea
            className={`${baseClasses} resize-vertical min-h-[80px] ${className}`}
            rows={rows}
            {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>}
          />
        ) : (
          <input
            className={`${baseClasses} ${className}`}
            {...props}
          />
        )}
      </div>
      
      {error && <span className="text-error text-sm">{error}</span>}
    </div>
  );
};

export default Input;