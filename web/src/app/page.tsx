"use client";

import { useFeatureFlags } from "@/lib/useFeatureFlags";

export default function Home() {
  const { loading, isEnabled } = useFeatureFlags();

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Ripple
        </h1>
        {loading ? (
          <p className="text-zinc-500">Loading…</p>
        ) : (
          <p className="text-zinc-500">
            {isEnabled("chat") ? "Chat is live." : "Chat is coming soon."}
          </p>
        )}
      </main>
    </div>
  );
}
