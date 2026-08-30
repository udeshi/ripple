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

const REASON_LABELS: Record<ReportReason, string> = {
  SPAM: "Spam",
  HARASSMENT: "Harassment",
  NUDITY: "Nudity",
  HATE_SPEECH: "Hate speech",
  OTHER: "Other",
};

export function ReportButton({
  targetType,
  targetId,
  variant = "pill",
}: {
  targetType: ReportTargetType;
  targetId: string;
  /** "menu" renders as a full-width row for use inside a dropdown menu. */
  variant?: "pill" | "menu";
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("SPAM");

  const mutation = useMutation({
    mutationFn: () =>
      rippleClient.reports.create({ targetType, targetId, reason }),
    onSuccess: () => setOpen(false),
  });

  if (mutation.isSuccess) {
    return (
      <p className="px-3 py-2 text-xs text-[var(--muted)]">
        Reported. Thanks for letting us know.
      </p>
    );
  }

  const form = (
    <div className={variant === "menu" ? "flex flex-col gap-2 p-2" : "flex w-56 flex-col gap-2 p-2"}>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value as ReportReason)}
        className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface-raised)] px-2 py-1.5 text-xs text-[var(--foreground)] outline-none ring-[var(--accent)] focus:ring-2"
      >
        {REASONS.map((r) => (
          <option key={r} value={r}>
            {REASON_LABELS[r]}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="flex-1 rounded-full bg-rose-600 px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-50"
        >
          {mutation.isPending ? "Reporting…" : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          Cancel
        </button>
      </div>
      {mutation.isError && (
        <p className="text-xs text-rose-500">Something went wrong. Try again.</p>
      )}
    </div>
  );

  if (variant === "menu") {
    return open ? form : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--muted)] transition hover:bg-[var(--surface-raised)] hover:text-rose-500"
      >
        {targetType === "USER" ? "Report user" : "Report post"}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)] transition hover:border-rose-500 hover:text-rose-500"
      >
        {targetType === "USER" ? "Report user" : "Report post"}
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close report form"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_14px_36px_rgba(0,0,0,0.16)]">
            {form}
          </div>
        </>
      )}
    </div>
  );
}
