"use client";

import { useState } from "react";
import { ReportButton } from "./ReportButton";

export function PostMenu({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xl leading-none text-[var(--muted)]"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More options"
      >
        ···
      </button>
      {open && (
        <>
          {/* Full-screen backdrop closes the menu on outside click. */}
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 top-full z-20 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1 shadow-[0_14px_36px_rgba(0,0,0,0.16)]"
          >
            <ReportButton targetType="POST" targetId={postId} variant="menu" />
          </div>
        </>
      )}
    </div>
  );
}
