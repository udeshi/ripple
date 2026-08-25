"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import type { ReportReason, ReportTargetType } from "@ripple/api-client";
import { rippleClient } from "@/lib/apiClient";

const REASONS: ReportReason[] = [
  "SPAM",
  "HARASSMENT",
  "NUDITY",
  "HATE_SPEECH",
  "OTHER",
];

export function ReportButton({
  targetType,
  targetId,
}: {
  targetType: ReportTargetType;
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("SPAM");

  const mutation = useMutation({
    mutationFn: () =>
      rippleClient.reports.create({ targetType, targetId, reason }),
    onSuccess: () => setOpen(false),
  });

  if (mutation.isSuccess) {
    return <span className="text-sm text-zinc-500">Reported</span>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-zinc-500"
      >
        Report
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value as ReportReason)}
        className="rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
      >
        {REASONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="rounded-md bg-zinc-900 px-2 py-1 text-white dark:bg-zinc-50 dark:text-black"
      >
        Submit
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-zinc-500">
        Cancel
      </button>
    </div>
  );
}
