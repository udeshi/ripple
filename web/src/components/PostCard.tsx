import Link from "next/link";
import type { Post } from "@ripple/api-client";
import { Avatar } from "./Avatar";
import { LikeButton } from "./LikeButton";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="border-b border-zinc-200 py-4 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <Avatar src={post.author.avatarUrl} alt={post.author.username} size={32} />
        <Link href={`/${post.author.username}`} className="text-sm font-medium">
          {post.author.displayName ?? post.author.username}
        </Link>
      </div>
      <Link href={`/posts/${post.id}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URLs */}
        <img
          src={post.imageUrl}
          alt={post.caption ?? ""}
          className="mt-3 w-full rounded-lg object-cover"
        />
      </Link>
      {post.caption && <p className="mt-2 text-sm">{post.caption}</p>}
      <div className="mt-2 flex items-center gap-4 text-sm text-zinc-500">
        <LikeButton postId={post.id} liked={post.isLikedByMe} count={post.likesCount} />
        <Link href={`/posts/${post.id}`}>{post.commentsCount} comments</Link>
      </div>
    </article>
  );
}
