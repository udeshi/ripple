import { useEffect, useState } from 'react';
import type { FeatureFlag } from '@ripple/api-client';
import { rippleClient } from '../api/client';
import { getDeviceId } from '../api/deviceId';

interface FeatureFlagsState {
  loading: boolean;
  flags: FeatureFlag[];
}

export function useFeatureFlags() {
  const [state, setState] = useState<FeatureFlagsState>({
    loading: true,
    flags: [],
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const deviceId = await getDeviceId();
      const flags = await rippleClient.flags
        .list(deviceId)
        .catch(() => [] as FeatureFlag[]);
      if (!cancelled) setState({ loading: false, flags });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const isEnabled = (key: string) =>
    state.flags.some((flag) => flag.key === key && flag.enabled);

  return { loading: state.loading, isEnabled };
}
