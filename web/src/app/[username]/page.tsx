"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { use } from "react";
import { Avatar } from "@/components/Avatar";
import { AvatarUploader } from "@/components/AvatarUploader";
import { FollowButton } from "@/components/FollowButton";
import { ReportButton } from "@/components/ReportButton";
import { rippleClient } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { user: currentUser } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["profile", username],
    queryFn: () => rippleClient.users.getProfile(username),
  });
  const postsQuery = useInfiniteQuery({
    queryKey: ["userPosts", username],
    queryFn: ({ pageParam }) =>
      rippleClient.posts.byAuthor(username, { page: pageParam, limit: 12 }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  });

  if (profileQuery.isLoading) {
    return <p className="p-6 text-zinc-500">Loading…</p>;
  }
  if (!profileQuery.data) {
    return <p className="p-6 text-zinc-500">User not found.</p>;
  }

  const profile = profileQuery.data;
  const posts = postsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const isOwnProfile = currentUser?.username === username;

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6">
      <div className="flex items-center gap-4">
        {isOwnProfile ? (
          <AvatarUploader src={profile.avatarUrl} alt={profile.username} size={64} />
        ) : (
          <Avatar src={profile.avatarUrl} alt={profile.username} size={64} />
        )}
        <div className="flex-1">
          <h1 className="text-lg font-semibold">
            {profile.displayName ?? profile.username}
          </h1>
          <p className="text-sm text-zinc-500">@{profile.username}</p>
        </div>
        {!isOwnProfile && currentUser && (
          <div className="flex items-center gap-3">
            <FollowButton username={username} initialFollowing={profile.isFollowedByMe} />
            <ReportButton targetType="USER" targetId={profile.id} />
          </div>
        )}
      </div>
      {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}
      <div className="mt-4 flex gap-6 text-sm">
        <span>
          <strong>{profile.postsCount}</strong> posts
        </span>
        <Link href={`/${username}/followers`}>
          <strong>{profile.followersCount}</strong> followers
        </Link>
        <Link href={`/${username}/following`}>
          <strong>{profile.followingCount}</strong> following
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-1">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URLs */}
            <img src={post.imageUrl} alt="" className="aspect-square w-full object-cover" />
          </Link>
        ))}
      </div>
      {postsQuery.hasNextPage && (
        <button
          type="button"
          onClick={() => void postsQuery.fetchNextPage()}
          className="mt-4 w-full rounded-md border border-zinc-300 py-2 text-sm dark:border-zinc-700"
        >
          Load more
        </button>
      )}
    </main>
  );
}
