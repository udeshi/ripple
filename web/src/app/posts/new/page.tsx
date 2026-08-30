"use client";

import { ApiError } from "@ripple/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { rippleClient } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth-context";

export default function NewPostPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
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

  function chooseFile(selected: File | null) {
    setFile(selected);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return selected ? URL.createObjectURL(selected) : null;
    });
  }

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
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={mutation.isPending}
          className="group relative flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl border-2 border-dashed border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:pointer-events-none disabled:opacity-50"
        >
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
              <img
                src={preview}
                alt="Preview"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
                Change photo
              </span>
            </>
          ) : (
            <>
              <span className="grid size-12 place-items-center rounded-full border border-dashed border-current text-2xl">
                +
              </span>
              <span className="text-sm">Choose a photo</span>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          required
          className="hidden"
          onChange={(e) => chooseFile(e.target.files?.[0] ?? null)}
        />
        <textarea
          placeholder="Write a caption…"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-sm outline-none ring-[var(--accent)] placeholder:text-[var(--muted)] focus:ring-2"
        />
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <button
          type="submit"
          disabled={mutation.isPending || !file}
          className="rounded-full bg-[var(--accent)] py-3 text-sm font-medium text-[#071018] transition disabled:opacity-50"
        >
          {mutation.isPending ? "Posting…" : "Share post"}
        </button>
      </form>
    </main>
  );
}
