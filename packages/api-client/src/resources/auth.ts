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
  };
}
