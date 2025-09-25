import React from 'react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children }) => {
  return (
    <div className="bg-white rounded-2xl shadow-large p-8 w-full max-w-md animate-slide-up">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 font-display mb-2">{title}</h1>
        <p className="text-neutral-600">{subtitle}</p>
      </div>
      {children}
    </div>
  );
};

export default AuthCard;