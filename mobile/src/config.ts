import Constants from 'expo-constants';

// Set EXPO_PUBLIC_API_URL in your environment (e.g. .env / eas.json env)
// to point at a deployed API. Falls back to the Metro host's IP on port
// 3001 for local development against `npm run start:dev` in backend/.
const devHost = Constants.expoConfig?.hostUri?.split(':')[0];

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (devHost ? `http://${devHost}:3001/api` : 'http://localhost:3001/api');
