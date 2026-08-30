"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { UserListItem } from "@/components/UserListItem";
import { rippleClient } from "@/lib/apiClient";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [activeTag, setActiveTag] = useState("Trending");

  const hasQuery = q.trim().length > 0;

  const usersQuery = useQuery({
    queryKey: ["search", "users", q],
    queryFn: () => rippleClient.search.users(q, { limit: 10 }),
    enabled: hasQuery,
  });
  const postsQuery = useQuery({
    queryKey: ["search", "posts", q],
    queryFn: () => rippleClient.search.posts(q, { limit: 12 }),
    enabled: hasQuery,
  });
  // The search API requires a non-empty query, so "Trending" (no query) falls
  // back to the general feed to give the Explore tab something to show.
  const trendingQuery = useQuery({
    queryKey: ["search", "trending"],
    queryFn: () => rippleClient.posts.feed({ limit: 12 }),
    enabled: !hasQuery,
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-10 pt-5">
      <input
        type="search"
        placeholder="Search users or posts…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded-full border border-transparent bg-[var(--surface)] px-5 py-3 text-sm outline-none ring-[var(--accent)] placeholder:text-[var(--muted)] focus:ring-2"
      />
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {['Trending', 'Tech & AI', 'Design Systems', 'Audio'].map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              setActiveTag(tag);
              setQ(tag === "Trending" ? "" : tag);
            }}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition ${activeTag === tag ? 'bg-[var(--accent)] text-[#071018]' : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {hasQuery ? (
        <>
          <section className="mt-6">
            <h2 className="mb-3 mt-7 text-lg font-semibold">People</h2>
            {usersQuery.data?.items.length === 0 && (
              <p className="text-sm text-zinc-500">No users found.</p>
            )}
            {usersQuery.data?.items.map((user) => (
              <UserListItem key={user.id} user={user} />
            ))}
          </section>

          <section className="mt-6">
            <h2 className="mb-3 mt-7 text-lg font-semibold">Visual Explore</h2>
            {postsQuery.data?.items.length === 0 && (
              <p className="text-sm text-zinc-500">No posts found.</p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {postsQuery.data?.items.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URLs */}
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="aspect-[4/5] w-full rounded-2xl object-cover"
                  />
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="mt-6">
          <h2 className="mb-3 mt-7 text-lg font-semibold">Trending</h2>
          {trendingQuery.isLoading && (
            <p className="text-sm text-[var(--muted)]">Loading…</p>
          )}
          {!trendingQuery.isLoading && trendingQuery.data?.items.length === 0 && (
            <p className="text-sm text-zinc-500">No posts yet.</p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {trendingQuery.data?.items.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URLs */}
                <img
                  src={post.imageUrl}
                  alt=""
                  className="aspect-[4/5] w-full rounded-2xl object-cover"
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
