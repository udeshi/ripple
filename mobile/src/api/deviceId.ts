import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'ripple.deviceId';

async function readPlatformId(): Promise<string | null> {
  if (Platform.OS === 'android') {
    return Application.getAndroidId();
  }
  if (Platform.OS === 'ios') {
    return Application.getIosIdForVendorAsync();
  }
  return null;
}

// Stable per-install id used to bucket feature-flag rollouts for signed-out
// users. Prefers the OS-provided install id; falls back to a generated,
// persisted UUID if that's unavailable (e.g. on web/simulators).
export async function getDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) return existing;

  const id = (await readPlatformId()) ?? Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  return id;
}
