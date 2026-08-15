import type { TokenStore } from "@ripple/api-client";

const ACCESS_TOKEN_KEY = "ripple.accessToken";
const REFRESH_TOKEN_KEY = "ripple.refreshToken";

// localStorage-backed TokenStore. Only usable client-side — every caller
// of the client from a Server Component must instead read cookies/headers
// and pass a per-request token explicitly.
export const browserTokenStore: TokenStore = {
  async getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  async getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  async setTokens(accessToken, refreshToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  async clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
