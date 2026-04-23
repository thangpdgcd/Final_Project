import React, { type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider } from '@/store/themes/ThemeContext';
import { AuthProvider } from '@/store/auth/AuthContext';
import { queryClient } from '@/utils/lib/queryClient';
import { ShippingProvider } from '@/components/contexts/shippingcontexts/ShippingContext';
import { store } from '@/redux/store';

type AppProvidersProps = {
  children: ReactNode;
};

const googleClientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '').trim();

const OAuthWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Avoid crashing the whole app in environments where the env var is not set
  // (e.g. production misconfig). The login page can still render and show a config hint.
  if (!googleClientId) return <>{children}</>;
  return <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>;
};

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => (
  <ReduxProvider store={store}>
    <QueryClientProvider client={queryClient}>
      <OAuthWrapper>
        <ThemeProvider>
          <AuthProvider>
            <ShippingProvider>{children}</ShippingProvider>
          </AuthProvider>
        </ThemeProvider>
      </OAuthWrapper>
    </QueryClientProvider>
  </ReduxProvider>
);

export default AppProviders;
