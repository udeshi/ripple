import * as SecureStore from 'expo-secure-store';
import type { TokenStore } from '@ripple/api-client';

const ACCESS_TOKEN_KEY = 'ripple.accessToken';
const REFRESH_TOKEN_KEY = 'ripple.refreshToken';

export const secureTokenStore: TokenStore = {
  getAccessToken() {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  },
  getRefreshToken() {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },
  async setTokens(accessToken, refreshToken) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  },
  async clearTokens() {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
