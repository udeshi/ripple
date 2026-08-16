"use client";

import { ApiError } from "@ripple/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { rippleClient } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth-context";

export default function NewPostPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const mutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("Choose an image first");
      return rippleClient.posts.create({
        caption: caption || undefined,
        image: file,
      });
    },
    onSuccess: (post) => {
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      router.push(`/posts/${post.id}`);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    },
  });

  if (!user) return null;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">New post</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          mutation.mutate();
        }}
        className="flex flex-col gap-4"
      >
        <input
          type="file"
          accept="image/*"
          required
          onChange={(e) => {
            const selected = e.target.files?.[0] ?? null;
            setFile(selected);
            setPreview(selected ? URL.createObjectURL(selected) : null);
          }}
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
          <img src={preview} alt="Preview" className="rounded-lg" />
        )}
        <textarea
          placeholder="Write a caption…"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-zinc-900 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-black"
        >
          {mutation.isPending ? "Posting…" : "Post"}
        </button>
      </form>
    </main>
  );
}
