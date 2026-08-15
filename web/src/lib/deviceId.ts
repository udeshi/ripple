const DEVICE_ID_KEY = "ripple.deviceId";

// Stable per-browser id used to bucket feature-flag rollouts for
// signed-out visitors, mirroring mobile/src/api/deviceId.ts.
export function getDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}
