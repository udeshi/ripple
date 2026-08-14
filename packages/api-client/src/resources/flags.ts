import { ApiClient } from '../client';
import { FeatureFlag } from '../types';

export function createFlagsResource(client: ApiClient) {
  return {
    list(deviceId?: string): Promise<FeatureFlag[]> {
      return client.request<FeatureFlag[]>('/flags', {
        query: { deviceId },
        auth: false,
      });
    },
  };
}
