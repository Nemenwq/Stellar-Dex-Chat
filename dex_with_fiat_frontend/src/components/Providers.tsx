'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { StellarWalletProvider } from '@/contexts/StellarWalletContext';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';
import { ToastProvider } from './ToastProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <UserPreferencesProvider>
        <StellarWalletProvider>
          <ToastProvider>{children}</ToastProvider>
        </StellarWalletProvider>
      </UserPreferencesProvider>
    </ThemeProvider>
  );
}

