import React from 'react';
import AuthCard from '../../molecules/AuthCard/AuthCard';

interface AuthTemplateProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AuthTemplate: React.FC<AuthTemplateProps> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <AuthCard title={title} subtitle={subtitle}>
        {children}
      </AuthCard>
    </div>
  );
};

export default AuthTemplate;