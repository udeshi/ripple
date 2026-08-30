import Link from "next/link";
import type { Post } from "@ripple/api-client";
import { Avatar } from "./Avatar";
import { LikeButton } from "./LikeButton";
import { ShareButton } from "./ShareButton";
import { PostMenu } from "./PostMenu";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="overflow-hidden rounded-[24px] bg-[var(--surface)] shadow-[0_14px_36px_rgba(0,0,0,0.16)]">
      <div className="flex items-center gap-3 px-4 pb-3 pt-4">
        <div className="rounded-full border-2 border-[var(--accent)] p-0.5">
          <Avatar src={post.author.avatarUrl} alt={post.author.username} size={38} />
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/${post.author.username}`} className="block truncate text-sm font-semibold">
            {post.author.displayName ?? post.author.username}
          </Link>
          <p className="text-xs text-[var(--muted)]">@{post.author.username} · Ripple</p>
        </div>
        <PostMenu postId={post.id} />
      </div>
      <Link href={`/posts/${post.id}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URLs */}
        <img
          src={post.imageUrl}
          alt={post.caption ?? ""}
          className="aspect-[4/3] w-full object-cover"
        />
      </Link>
      <div className="px-4 pb-4 pt-3">
        {post.caption && <p className="text-[15px] leading-6">{post.caption}</p>}
        <div className="mt-4 flex items-center gap-5 text-sm text-[var(--muted)]">
          <LikeButton postId={post.id} liked={post.isLikedByMe} count={post.likesCount} />
          <Link href={`/posts/${post.id}`} className="transition hover:text-[var(--accent)]">▢ {post.commentsCount}</Link>
          <ShareButton postId={post.id} />
        </div>
      </div>
    </article>
  );
}
