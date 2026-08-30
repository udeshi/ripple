"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { LikeButton } from "@/components/LikeButton";
import { ReportButton } from "@/components/ReportButton";
import { rippleClient } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth-context";

export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const updateMutation = useMutation({
    mutationFn: (input: { caption: string; image?: File }) =>
      rippleClient.posts.update(id, input),
    onSuccess: () => {
      setEditing(false);
      setImagePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      void queryClient.invalidateQueries({ queryKey: ["post", id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => rippleClient.posts.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      router.push("/");
    },
  });

  function chooseReplacementImage(selected: File | null) {
    setImage(selected ?? undefined);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return selected ? URL.createObjectURL(selected) : null;
    });
  }

  if (postQuery.isLoading) {
    return <p className="p-6 text-[var(--muted)]">Loading…</p>;
  }
  if (postQuery.isError || !postQuery.data) {
    return <p className="p-6 text-[var(--muted)]">Post not found.</p>;
  }

  const post = postQuery.data;
  const isOwner = user?.id === post.authorId;

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <div className="flex items-center gap-2">
        <Avatar src={post.author.avatarUrl} alt={post.author.username} size={32} />
        <Link href={`/${post.author.username}`} className="text-sm font-medium">
          {post.author.displayName ?? post.author.username}
        </Link>
        {isOwner && !editing && (
          <div className="ml-auto flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => {
                setCaption(post.caption ?? "");
                chooseReplacementImage(null);
                setEditing(true);
              }}
              className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm("Delete this post?")) deleteMutation.mutate();
              }}
              className="rounded-full border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)] transition hover:border-rose-500 hover:text-rose-500"
            >
              Delete
            </button>
          </div>
        )}
        {user && !isOwner && (
          <div className="ml-auto">
            <ReportButton targetType="POST" targetId={post.id} />
          </div>
        )}
      </div>
      {editing ? (
        <div className="mt-3 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={updateMutation.isPending}
            className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-dashed border-[var(--line)] bg-[var(--surface)] transition hover:border-[var(--accent)] disabled:pointer-events-none disabled:opacity-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- remote/local preview */}
            <img
              src={imagePreview ?? post.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
              {imagePreview ? "Change photo" : "Replace photo"}
            </span>
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => chooseReplacementImage(e.target.files?.[0] ?? null)}
          />
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            placeholder="Write a caption…"
            className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm outline-none ring-[var(--accent)] placeholder:text-[var(--muted)] focus:ring-2"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateMutation.mutate({ caption, image })}
              disabled={updateMutation.isPending}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#071018] transition disabled:opacity-50"
            >
              {updateMutation.isPending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                chooseReplacementImage(null);
              }}
              className="rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              Cancel
            </button>
          </div>
          {updateMutation.isError && (
            <p className="text-sm text-rose-500">
              {updateMutation.error instanceof Error
                ? updateMutation.error.message
                : "Unable to save changes."}
            </p>
          )}
        </div>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URLs */}
          <img
            src={post.imageUrl}
            alt={post.caption ?? ""}
            className="mt-3 w-full rounded-2xl object-cover"
          />
          {post.caption && <p className="mt-3 text-sm">{post.caption}</p>}
        </>
      )}
      <div className="mt-3 flex items-center gap-4 text-sm text-[var(--muted)]">
        <LikeButton postId={post.id} liked={post.isLikedByMe} count={post.likesCount} />
        <span>{post.commentsCount} comments</span>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-[var(--muted)]">Comments</h2>
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
              className="flex-1 rounded-full bg-[var(--surface)] px-4 py-2 text-sm outline-none ring-[var(--accent)] placeholder:text-[var(--muted)] focus:ring-2"
            />
            <button
              type="submit"
              disabled={commentMutation.isPending || !comment.trim()}
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#071018] disabled:opacity-50"
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
