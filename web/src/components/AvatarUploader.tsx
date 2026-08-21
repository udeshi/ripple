"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { rippleClient } from "@/lib/apiClient";
import { Avatar } from "./Avatar";

export function AvatarUploader({
  src,
  alt,
  size = 64,
}: {
  src: string | null;
  alt: string;
  size?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: File) => rippleClient.users.uploadAvatar(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      void queryClient.invalidateQueries({ queryKey: ["profile", alt] });
    },
  });

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="relative"
      disabled={mutation.isPending}
    >
      <Avatar src={src} alt={alt} size={size} />
      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-xs text-white opacity-0 hover:opacity-100">
        {mutation.isPending ? "…" : "Edit"}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) mutation.mutate(file);
        }}
      />
    </button>
  );
}
