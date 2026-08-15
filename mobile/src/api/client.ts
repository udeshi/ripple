import { createRippleClient } from '@ripple/api-client';
import { API_BASE_URL } from '../config';
import { secureTokenStore } from './tokenStore';

export const rippleClient = createRippleClient({
  baseUrl: API_BASE_URL,
  tokenStore: secureTokenStore,
});
