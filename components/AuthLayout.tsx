import React from 'react';
import { ICONS } from '../constants';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <div className="bg-[var(--bg-primary)] font-display text-[var(--text-primary)]">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-[var(--bg-secondary)] rounded-xl shadow-lg m-4 border border-[var(--border-primary)]">
          <div className="text-center">
            <div className="flex justify-center mx-auto mb-4 text-primary w-12 h-12">
              {ICONS.logoModern}
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">{title}</h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
