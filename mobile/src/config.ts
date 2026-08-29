import Constants from 'expo-constants';

const devHost = Constants.expoConfig?.hostUri?.split(':')[0];

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (devHost ? `http://${devHost}:3001/api` : 'http://localhost:3001/api');

export const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY ?? '';
