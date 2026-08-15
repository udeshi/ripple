"use client";

import { useEffect, useState } from "react";
import type { FeatureFlag } from "@ripple/api-client";
import { rippleClient } from "./apiClient";
import { getDeviceId } from "./deviceId";

export function useFeatureFlags() {
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);

  useEffect(() => {
    let cancelled = false;

    rippleClient.flags
      .list(getDeviceId())
      .catch(() => [] as FeatureFlag[])
      .then((result) => {
        if (!cancelled) {
          setFlags(result);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isEnabled = (key: string) =>
    flags.some((flag) => flag.key === key && flag.enabled);

  return { loading, isEnabled };
}
