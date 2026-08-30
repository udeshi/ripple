"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { dedupeById } from "@ripple/api-client";
import { rippleClient } from "@/lib/apiClient";
import { PostCard } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";

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

  const posts = dedupeById(query.data?.pages.flatMap((page) => page.items) ?? []);
  const storyAuthors = dedupeById(posts.map((post) => post.author)).slice(0, 6);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-10 pt-5">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">Your network</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">For You</h1>
        </div>
        <span className="rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--muted)]">● 12ms</span>
      </div>
      <div className="mb-6 flex gap-4 overflow-x-auto pb-1">
        <Link href="/posts/new" className="min-w-[64px] text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full border border-dashed border-[var(--accent)] text-2xl text-[var(--accent)]">+</div>
          <span className="mt-2 block text-xs text-[var(--muted)]">Your Ripple</span>
        </Link>
        {storyAuthors.map((author) => (
          <Link key={author.id} href={`/${author.username}`} className="min-w-[64px] text-center">
            <div className="mx-auto w-fit rounded-full border-2 border-[var(--accent)] p-0.5"><Avatar src={author.avatarUrl} alt={author.username} size={50} /></div>
            <span className="mt-2 block truncate text-xs text-[var(--muted)]">{author.username}</span>
          </Link>
        ))}
      </div>
      {query.isLoading && <p className="text-[var(--muted)]">Loading your feed…</p>}
      {!query.isLoading && posts.length === 0 && (
        <p className="rounded-3xl bg-[var(--surface)] p-6 text-[var(--muted)]">
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
          className="mt-5 w-full rounded-full border border-[var(--line)] py-3 text-sm text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          {query.isFetchingNextPage ? "Loading…" : "Load more"}
        </button>
      )}
    </main>
  );
}
