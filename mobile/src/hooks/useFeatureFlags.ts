import { useQuery } from '@tanstack/react-query';
import type { FeatureFlag } from '@ripple/api-client';
import { rippleClient } from '../api/client';
import { getDeviceId } from '../api/deviceId';

export function useFeatureFlags() {
  const query = useQuery({
    queryKey: ['flags'],
    queryFn: async () => rippleClient.flags.list(await getDeviceId()),
    staleTime: 5 * 60 * 1000,
  });

  const flags: FeatureFlag[] = query.data ?? [];
  const isEnabled = (key: string) =>
    flags.some((flag) => flag.key === key && flag.enabled);

  return { loading: query.isLoading, isEnabled };
}
