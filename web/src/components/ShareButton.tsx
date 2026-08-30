"use client";

import { useState } from "react";

export function ShareButton({ postId }: { postId: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${postId}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ url });
      } catch (err) {
        // AbortError just means the user dismissed the native share sheet.
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Share failed", err);
        }
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy to clipboard failed", err);
    }
  };

  return (
    <div className="relative ml-auto">
      <button
        type="button"
        onClick={handleShare}
        className="text-lg"
        aria-label={copied ? "Link copied" : "Share post"}
      >
        {copied ? "✓" : "↗"}
      </button>
      {copied && (
        <span className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-full bg-[var(--surface-raised)] px-2.5 py-1 text-xs text-[var(--foreground)] shadow-[0_8px_20px_rgba(0,0,0,0.24)]">
          Link copied
        </span>
      )}
    </div>
  );
}
