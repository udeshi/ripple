"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { rippleClient } from "@/lib/apiClient";
import { useChat } from "@/lib/chat-context";

export function MessageButton({
  otherId,
}: {
  otherId: string;
}) {
  const router = useRouter();
  const { client, ready } = useChat();
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (!client) return;
    setPending(true);
    try {
      const { channelId } = await rippleClient.chat.createDirectChannel(otherId);
      router.push(`/chat?channelId=${channelId}`);
    } finally {
      setPending(false);
    }
  }

  if (!ready) return null;

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={pending}
      className="rounded-full bg-[var(--surface-raised)] px-3 py-1.5 text-sm"
    >
      Message
    </button>
  );
}
