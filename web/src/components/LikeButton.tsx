"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { rippleClient } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth-context";

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
      className={liked ? "font-medium text-rose-600" : ""}
    >
      {liked ? "♥" : "♡"} {count}
    </button>
  );
}
