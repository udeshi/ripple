"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { rippleClient } from "@/lib/apiClient";

export function FollowButton({
  username,
  initialFollowing,
}: {
  username: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      following
        ? rippleClient.follows.unfollow(username)
        : rippleClient.follows.follow(username),
    onSuccess: (result) => {
      setFollowing(result.following);
      void queryClient.invalidateQueries({
        queryKey: ["profile", username],
      });
    },
  });

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className={
        following
          ? "rounded-md border border-zinc-300 px-4 py-1.5 text-sm dark:border-zinc-700"
          : "rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-black"
      }
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
