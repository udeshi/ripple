"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type { Report } from "@ripple/api-client";
import { rippleClient } from "@/lib/apiClient";

function TargetPreview({ report }: { report: Report }) {
  if (!report.target) {
    return <p className="text-sm text-zinc-500">Content no longer exists.</p>;
  }
  if (report.targetType === "POST" && "imageUrl" in report.target) {
    return (
      <Link href={`/posts/${report.target.id}`} className="text-sm underline">
        View post by @{report.target.author.username}
      </Link>
    );
  }
  if (report.targetType === "COMMENT" && "content" in report.target) {
    return (
      <p className="text-sm">
        Comment by @{report.target.author.username}: “{report.target.content}”
      </p>
    );
  }
  if ("username" in report.target) {
    return (
      <Link href={`/${report.target.username}`} className="text-sm underline">
        @{report.target.username}
      </Link>
    );
  }
  return null;
}

export function ReportCard({ report }: { report: Report }) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });

  const resolve = useMutation({
    mutationFn: () => rippleClient.admin.resolveReport(report.id),
    onSuccess: invalidate,
  });
  const dismiss = useMutation({
    mutationFn: () => rippleClient.admin.dismissReport(report.id),
    onSuccess: invalidate,
  });
  const banUser = useMutation({
    mutationFn: (username: string) => rippleClient.admin.banUser(username),
    onSuccess: invalidate,
  });
  const removeTarget = useMutation({
    mutationFn: () =>
      report.targetType === "POST"
        ? rippleClient.admin.removePost(report.targetId)
        : rippleClient.admin.removeComment(report.targetId),
    onSuccess: invalidate,
  });

  const targetUsername =
    report.target && "author" in report.target
      ? report.target.author.username
      : report.target && "username" in report.target
        ? report.target.username
        : null;

  return (
    <div className="flex flex-col gap-2 border-b border-zinc-200 py-4 dark:border-zinc-800">
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <span>
          {report.reason} · reported by @{report.reporter.username}
        </span>
        <span>{report.status}</span>
      </div>
      <TargetPreview report={report} />
      {report.details && <p className="text-sm text-zinc-500">{report.details}</p>}
      {report.status === "PENDING" && (
        <div className="mt-1 flex flex-wrap gap-3 text-sm">
          <button type="button" onClick={() => resolve.mutate()} className="underline">
            Resolve
          </button>
          <button type="button" onClick={() => dismiss.mutate()} className="underline">
            Dismiss
          </button>
          {report.targetType !== "USER" && report.target && (
            <button
              type="button"
              onClick={() => removeTarget.mutate()}
              className="text-rose-600 underline"
            >
              Delete content
            </button>
          )}
          {targetUsername && (
            <button
              type="button"
              onClick={() => banUser.mutate(targetUsername)}
              className="text-rose-600 underline"
            >
              Ban @{targetUsername}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
