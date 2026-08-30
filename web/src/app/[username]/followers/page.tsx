"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { dedupeById } from "@ripple/api-client";
import { use } from "react";
import { UserListItem } from "@/components/UserListItem";
import { rippleClient } from "@/lib/apiClient";

export default function FollowersPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);

  const query = useInfiniteQuery({
    queryKey: ["followers", username],
    queryFn: ({ pageParam }) =>
      rippleClient.follows.followers(username, { page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  });

  const users = dedupeById(query.data?.pages.flatMap((page) => page.items) ?? []);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold">Followers</h1>
      {!query.isLoading && users.length === 0 && (
        <p className="text-zinc-500">No followers yet.</p>
      )}
      {users.map((user) => (
        <UserListItem key={user.id} user={user} />
      ))}
      {query.hasNextPage && (
        <button
          type="button"
          onClick={() => void query.fetchNextPage()}
          className="mt-4 w-full rounded-md border border-zinc-300 py-2 text-sm dark:border-zinc-700"
        >
          Load more
        </button>
      )}
    </main>
  );
}
