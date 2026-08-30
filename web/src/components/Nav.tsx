"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useFeatureFlags } from "@/lib/useFeatureFlags";
import { NotificationsLink } from "./NotificationsLink";

export function Nav() {
  const { user, loading, logout } = useAuth();
  const { isEnabled } = useFeatureFlags();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isExplore = pathname?.startsWith("/search") ?? false;

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[#090c14]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-full border-2 border-[var(--accent)] text-sm text-[var(--accent)]">◉</span>
          <span>Ripple</span>
          <span className="rounded-full bg-[var(--surface-raised)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">Live</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm text-[var(--muted)]">
          <Link href="/search" aria-label="Explore" className="grid size-9 place-items-center rounded-full bg-[var(--surface)] text-lg transition hover:text-[var(--accent)]">⌕</Link>
          {isEnabled("chat") && <Link href="/chat" className="hidden sm:block">Chat</Link>}
          {!loading &&
            (user ? (
              <>
                <NotificationsLink />
                <Link href="/posts/new" className="grid size-9 place-items-center rounded-full bg-[var(--accent)] text-xl text-[#071018]">+</Link>
                {user.role === "ADMIN" && <Link href="/admin" className="hidden sm:block">Admin</Link>}
                <Link href={`/${user.username}`} className="hidden sm:block">{user.username}</Link>
                <button onClick={() => void logout()} className="hidden sm:block">Log out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-full border border-[var(--line)] px-3 py-1.5">Log in</Link>
                <Link href="/register" className="rounded-full bg-[var(--accent)] px-3 py-1.5 font-medium text-[#071018]">Sign up</Link>
              </>
            ))}
        </nav>
      </div>
      {(isHome || isExplore) && (
        <div className="mx-auto flex max-w-3xl gap-6 px-4 pb-2 text-sm font-medium text-[var(--muted)] sm:hidden">
          <Link
            href="/"
            className={`pb-2 ${isHome ? "border-b-2 border-[var(--accent)] text-[var(--foreground)]" : ""}`}
          >
            For You
          </Link>
          <Link
            href="/search"
            className={`pb-2 ${isExplore ? "border-b-2 border-[var(--accent)] text-[var(--foreground)]" : ""}`}
          >
            Explore
          </Link>
        </div>
      )}
    </header>
  );
}
