"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { rippleClient } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth-context";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 21s-6.716-4.35-9.428-8.088C.774 10.104 1.5 6 5.25 5.25c2.06-.41 3.87.67 4.75 2.25.88-1.58 2.69-2.66 4.75-2.25C18.5 6 19.226 10.104 21.428 12.912 18.716 16.65 12 21 12 21z" />
    </svg>
  );
}

export function LikeButton({
  postId,
  liked,
  count,
}: {
  postId: string;
  liked: boolean;
  count: number;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => rippleClient.posts.toggleLike(postId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["feed"] });
      void queryClient.invalidateQueries({ queryKey: ["post", postId] });
      void queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
  });

  return (
    <button
      type="button"
      onClick={() => {
        if (!user) {
          router.push("/login");
          return;
        }
        mutation.mutate();
      }}
      disabled={mutation.isPending}
      className={
        liked
          ? "flex items-center gap-1.5 font-medium text-rose-600"
          : "flex items-center gap-1.5"
      }
      aria-pressed={liked}
      aria-label={liked ? "Unlike post" : "Like post"}
    >
      <HeartIcon filled={liked} /> {count}
    </button>
  );
}
