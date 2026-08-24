"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { rippleClient } from "@/lib/apiClient";

export function NotificationsLink() {
  const query = useQuery({
    queryKey: ["unreadCount"],
    queryFn: () => rippleClient.notifications.unreadCount(),
    refetchInterval: 30_000,
  });

  const count = query.data ?? 0;

  return (
    <Link href="/notifications" className="relative">
      Notifications
      {count > 0 && (
        <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-medium text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
