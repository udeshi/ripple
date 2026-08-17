import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, ReactNode, useContext } from 'react';
import type { Me } from '@ripple/api-client';
import { rippleClient } from '../api/client';
import { secureTokenStore } from '../api/tokenStore';

interface AuthContextValue {
  user: Me | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const ME_QUERY_KEY = ['me'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: () => rippleClient.users.getMe(),
    retry: false,
  });

  const login = async (email: string, password: string) => {
    await rippleClient.auth.login({ email, password });
    await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
  };

  const register = async (
    email: string,
    username: string,
    password: string,
  ) => {
    await rippleClient.auth.register({ email, username, password });
    await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
  };

  const logout = async () => {
    const refreshToken = await secureTokenStore.getRefreshToken();
    if (refreshToken) {
      await rippleClient.auth.logout(refreshToken).catch(() => undefined);
    }
    await secureTokenStore.clearTokens();
    queryClient.setQueryData(ME_QUERY_KEY, null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: meQuery.data ?? null,
        loading: meQuery.isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
