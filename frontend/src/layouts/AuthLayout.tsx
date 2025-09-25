import type { ReactNode } from 'react';

type AuthLayoutProps = {
  children: ReactNode;
};
export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <main>
      <div>{children}</div>
    </main>
  );
};
