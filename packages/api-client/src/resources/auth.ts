import { ApiClient } from '../client';
import { AuthResponse } from '../types';

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export function createAuthResource(
  client: ApiClient,
  onAuthenticated: (result: AuthResponse) => Promise<void>,
) {
  return {
    async register(input: RegisterInput): Promise<AuthResponse> {
      const result = await client.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: input,
        auth: false,
      });
      await onAuthenticated(result);
      return result;
    },

    async login(input: LoginInput): Promise<AuthResponse> {
      const result = await client.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: input,
        auth: false,
      });
      await onAuthenticated(result);
      return result;
    },

    async logout(refreshToken: string): Promise<void> {
      await client.request('/auth/logout', {
        method: 'POST',
        body: { refreshToken },
        auth: false,
      });
    },

    async forgotPassword(email: string): Promise<{ message: string }> {
      return client.request<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: { email },
        auth: false,
      });
    },

    async resetPassword(
      token: string,
      password: string,
    ): Promise<{ success: boolean }> {
      return client.request<{ success: boolean }>('/auth/reset-password', {
        method: 'POST',
        body: { token, password },
        auth: false,
      });
    },
  };
}
