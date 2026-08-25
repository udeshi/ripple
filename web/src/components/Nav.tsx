"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useFeatureFlags } from "@/lib/useFeatureFlags";
import { NotificationsLink } from "./NotificationsLink";

export function Nav() {
  const { user, loading, logout } = useAuth();
  const { isEnabled } = useFeatureFlags();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
      <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Ripple
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/search">Search</Link>
          {isEnabled("chat") && <Link href="/chat">Chat</Link>}
          {!loading &&
            (user ? (
              <>
                <NotificationsLink />
                <Link href="/posts/new">New post</Link>
                {user.role === "ADMIN" && <Link href="/admin">Admin</Link>}
                <Link href={`/${user.username}`}>{user.username}</Link>
                <button onClick={() => void logout()}>Log out</button>
              </>
            ) : (
              <>
                <Link href="/login">Log in</Link>
                <Link href="/register">Sign up</Link>
              </>
            ))}
        </nav>
      </div>
    </header>
  );
}
