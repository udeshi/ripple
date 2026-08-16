"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { UserListItem } from "@/components/UserListItem";
import { rippleClient } from "@/lib/apiClient";

export default function SearchPage() {
  const [q, setQ] = useState("");

  const usersQuery = useQuery({
    queryKey: ["search", "users", q],
    queryFn: () => rippleClient.search.users(q, { limit: 10 }),
    enabled: q.trim().length > 0,
  });
  const postsQuery = useQuery({
    queryKey: ["search", "posts", q],
    queryFn: () => rippleClient.search.posts(q, { limit: 12 }),
    enabled: q.trim().length > 0,
  });

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <input
        type="search"
        placeholder="Search users or posts…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />

      {q.trim().length > 0 && (
        <>
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-medium text-zinc-500">People</h2>
            {usersQuery.data?.items.length === 0 && (
              <p className="text-sm text-zinc-500">No users found.</p>
            )}
            {usersQuery.data?.items.map((user) => (
              <UserListItem key={user.id} user={user} />
            ))}
          </section>

          <section className="mt-6">
            <h2 className="mb-2 text-sm font-medium text-zinc-500">Posts</h2>
            {postsQuery.data?.items.length === 0 && (
              <p className="text-sm text-zinc-500">No posts found.</p>
            )}
            <div className="grid grid-cols-3 gap-1">
              {postsQuery.data?.items.map((post) => (
                <Link key={post.id} href={`/posts/${post.id}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URLs */}
                  <img
                    src={post.imageUrl}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
