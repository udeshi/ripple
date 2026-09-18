"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { dedupeById } from "@ripple/api-client";
import { NotificationItem } from "@/components/NotificationItem";
import { rippleClient } from "@/lib/apiClient";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const markedRef = useRef(false);

  const query = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      rippleClient.notifications.list({ page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  });

  const markAllRead = useMutation({
    mutationFn: () => rippleClient.notifications.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  useEffect(() => {
    if (!markedRef.current) {
      markedRef.current = true;
      markAllRead.mutate();
    }
  }, [markAllRead]);

  const notifications = dedupeById(
    query.data?.pages.flatMap((page) => page.items) ?? [],
  );

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold">Notifications</h1>
      {!query.isLoading && notifications.length === 0 && (
        <p className="text-[var(--muted)]">No notifications yet.</p>
      )}
      <div className="flex flex-col divide-y divide-[var(--line)]">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
      {query.hasNextPage && (
        <button
          type="button"
          onClick={() => void query.fetchNextPage()}
          className="mt-4 w-full rounded-md border border-[var(--line)] py-2 text-sm"
        >
          Load more
        </button>
      )}
    </main>
  );
}
