import Link from "next/link";
import type { Notification } from "@ripple/api-client";
import { Avatar } from "./Avatar";

const VERB: Record<Notification["type"], string> = {
  LIKE: "liked your post",
  COMMENT: "commented on your post",
  FOLLOW: "followed you",
};

export function NotificationItem({ notification }: { notification: Notification }) {
  const href = notification.postId
    ? `/posts/${notification.postId}`
    : `/${notification.actor.username}`;

  return (
    <Link
      href={href}
      className={
        notification.read
          ? "flex items-center gap-3 py-3"
          : "flex items-center gap-3 rounded-md bg-[var(--surface-raised)] px-2 py-3"
      }
    >
      <Avatar src={notification.actor.avatarUrl} alt={notification.actor.username} size={40} />
      <p className="text-sm">
        <span className="font-medium">
          {notification.actor.displayName ?? notification.actor.username}
        </span>{" "}
        {VERB[notification.type]}
      </p>
    </Link>
  );
}
