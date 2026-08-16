import Link from "next/link";
import type { UserSummary } from "@ripple/api-client";
import { Avatar } from "./Avatar";

export function UserListItem({ user }: { user: UserSummary }) {
  return (
    <Link href={`/${user.username}`} className="flex items-center gap-3 py-2">
      <Avatar src={user.avatarUrl} alt={user.username} size={40} />
      <div>
        <p className="text-sm font-medium">{user.displayName ?? user.username}</p>
        <p className="text-sm text-zinc-500">@{user.username}</p>
      </div>
    </Link>
  );
}
