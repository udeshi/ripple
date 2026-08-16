"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { rippleClient } from "@/lib/apiClient";
import { PostCard } from "@/components/PostCard";

export default function Home() {
  const query = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) =>
      rippleClient.posts.feed({ page: pageParam, limit: 10 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
  });

  const posts = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      {query.isLoading && <p className="text-zinc-500">Loading…</p>}
      {!query.isLoading && posts.length === 0 && (
        <p className="text-zinc-500">
          No posts yet. Be the first to share something.
        </p>
      )}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {query.hasNextPage && (
        <button
          type="button"
          onClick={() => void query.fetchNextPage()}
          disabled={query.isFetchingNextPage}
          className="mt-4 w-full rounded-md border border-zinc-300 py-2 text-sm dark:border-zinc-700"
        >
          {query.isFetchingNextPage ? "Loading…" : "Load more"}
        </button>
      )}
    </main>
  );
}
