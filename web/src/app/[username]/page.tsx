"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { dedupeById } from "@ripple/api-client";
import Link from "next/link";
import { use } from "react";
import { Avatar } from "@/components/Avatar";
import { AvatarUploader } from "@/components/AvatarUploader";
import { FollowButton } from "@/components/FollowButton";
import { MessageButton } from "@/components/MessageButton";
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
  const posts = dedupeById(
    postsQuery.data?.pages.flatMap((page) => page.items) ?? [],
  );
  const isOwnProfile = currentUser?.username === username;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-10 pt-5">
      <div className="relative overflow-hidden rounded-[28px] bg-[var(--surface)] p-5">
        <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(120deg,#12374b,#172033_55%,#241d4b)]" />
        <div className="relative flex items-end gap-4 pt-10">
        {isOwnProfile ? (
          <AvatarUploader src={profile.avatarUrl} alt={profile.username} size={64} />
        ) : (
          <Avatar src={profile.avatarUrl} alt={profile.username} size={64} />
        )}
        <div className="flex-1 pb-1">
          <h1 className="text-xl font-semibold">
            {profile.displayName ?? profile.username}
          </h1>
          <p className="text-sm text-zinc-500">@{profile.username}</p>
        </div>
        {!isOwnProfile && currentUser && (
          <div className="flex items-center gap-3">
            <FollowButton username={username} initialFollowing={profile.isFollowedByMe} />
            <MessageButton otherId={profile.id} />
            <ReportButton targetType="USER" targetId={profile.id} />
          </div>
        )}
        </div>
      {profile.bio && <p className="relative mt-4 text-sm leading-6 text-[var(--muted)]">{profile.bio}</p>}
      <div className="relative mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-[var(--surface-raised)] p-3 text-center text-sm">
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
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Ripple archive</h2>
      <div className="grid grid-cols-3 gap-2">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URLs */}
            <img src={post.imageUrl} alt="" className="aspect-square w-full rounded-xl object-cover" />
          </Link>
        ))}
      </div>
      {postsQuery.hasNextPage && (
        <button
          type="button"
          onClick={() => void postsQuery.fetchNextPage()}
          className="mt-5 w-full rounded-full border border-[var(--line)] py-3 text-sm text-[var(--muted)]"
        >
          Load more
        </button>
      )}
    </main>
  );
}
