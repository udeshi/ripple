"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { ReportStatus } from "@ripple/api-client";
import { ApiError } from "@ripple/api-client";
import { ReportCard } from "@/components/admin/ReportCard";
import { rippleClient } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth-context";

const STATUSES: ReportStatus[] = ["PENDING", "RESOLVED", "DISMISSED"];

export default function AdminPage() {
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ReportStatus>("PENDING");
  const [banUsername, setBanUsername] = useState("");
  const [banError, setBanError] = useState<string | null>(null);

  const reportsQuery = useQuery({
    queryKey: ["admin", "reports", status],
    queryFn: () => rippleClient.admin.listReports({ status, limit: 50 }),
    enabled: user?.role === "ADMIN",
  });

  const banMutation = useMutation({
    mutationFn: (username: string) => rippleClient.admin.banUser(username),
    onSuccess: () => {
      setBanUsername("");
      void queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
    },
    onError: (err) => {
      setBanError(err instanceof ApiError ? err.message : "Something went wrong");
    },
  });

  if (loading) return null;
  if (!user || user.role !== "ADMIN") {
    return <p className="p-6 text-zinc-500">Not authorized.</p>;
  }

  const reports = reportsQuery.data?.items ?? [];

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold">Admin</h1>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-zinc-500">Ban a user</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setBanError(null);
            if (banUsername.trim()) banMutation.mutate(banUsername.trim());
          }}
          className="flex gap-2"
        >
          <input
            value={banUsername}
            onChange={(e) => setBanUsername(e.target.value)}
            placeholder="username"
            className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={banMutation.isPending}
            className="rounded-md bg-rose-600 px-3 py-2 text-sm text-white"
          >
            Ban
          </button>
        </form>
        {banError && <p className="mt-1 text-sm text-rose-600">{banError}</p>}
      </section>

      <section>
        <div className="mb-3 flex gap-2 text-sm">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={s === status ? "font-semibold" : "text-zinc-500"}
            >
              {s}
            </button>
          ))}
        </div>
        {!reportsQuery.isLoading && reports.length === 0 && (
          <p className="text-zinc-500">No {status.toLowerCase()} reports.</p>
        )}
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </section>
    </main>
  );
}
