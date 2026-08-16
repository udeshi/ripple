"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { use, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { LikeButton } from "@/components/LikeButton";
import { rippleClient } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth-context";

export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const postQuery = useQuery({
    queryKey: ["post", id],
    queryFn: () => rippleClient.posts.get(id),
  });
  const commentsQuery = useQuery({
    queryKey: ["comments", id],
    queryFn: () => rippleClient.comments.list(id, { limit: 50 }),
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => rippleClient.comments.create(id, content),
    onSuccess: () => {
      setComment("");
      void queryClient.invalidateQueries({ queryKey: ["comments", id] });
      void queryClient.invalidateQueries({ queryKey: ["post", id] });
    },
  });

  if (postQuery.isLoading) {
    return <p className="p-6 text-zinc-500">Loading…</p>;
  }
  if (postQuery.isError || !postQuery.data) {
    return <p className="p-6 text-zinc-500">Post not found.</p>;
  }

  const post = postQuery.data;

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <div className="flex items-center gap-2">
        <Avatar src={post.author.avatarUrl} alt={post.author.username} size={32} />
        <Link href={`/${post.author.username}`} className="text-sm font-medium">
          {post.author.displayName ?? post.author.username}
        </Link>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URLs */}
      <img
        src={post.imageUrl}
        alt={post.caption ?? ""}
        className="mt-3 w-full rounded-lg object-cover"
      />
      {post.caption && <p className="mt-2 text-sm">{post.caption}</p>}
      <div className="mt-2 flex items-center gap-4 text-sm text-zinc-500">
        <LikeButton postId={post.id} liked={post.isLikedByMe} count={post.likesCount} />
        <span>{post.commentsCount} comments</span>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-zinc-500">Comments</h2>
        {user && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (comment.trim()) commentMutation.mutate(comment.trim());
            }}
            className="mb-4 flex gap-2"
          >
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              disabled={commentMutation.isPending}
              className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-50 dark:text-black"
            >
              Post
            </button>
          </form>
        )}
        <ul className="flex flex-col gap-3">
          {commentsQuery.data?.items.map((c) => (
            <li key={c.id} className="flex items-start gap-2 text-sm">
              <Avatar src={c.author.avatarUrl} alt={c.author.username} size={24} />
              <p>
                <Link href={`/${c.author.username}`} className="font-medium">
                  {c.author.username}
                </Link>{" "}
                {c.content}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
