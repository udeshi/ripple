"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useState } from "react";
import type { Channel, FormatMessageResponse } from "stream-chat";
import type { SearchUserResult } from "@ripple/api-client";
import { Avatar } from "@/components/Avatar";
import { rippleClient } from "@/lib/apiClient";
import { useAuth } from "@/lib/auth-context";
import { useChat } from "@/lib/chat-context";

function NewMessagePanel({
  onClose,
  onStart,
}: {
  onClose: () => void;
  onStart: (userId: string) => Promise<void>;
}) {
  const [q, setQ] = useState("");
  const [startingId, setStartingId] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ["search", "users", q],
    queryFn: () => rippleClient.search.users(q, { limit: 10 }),
    enabled: q.trim().length > 0,
  });

  async function pick(user: SearchUserResult) {
    if (startingId) return;
    setStartingId(user.id);
    try {
      await onStart(user.id);
    } finally {
      setStartingId(null);
    }
  }

  return (
    <div className="absolute inset-0 z-10 flex flex-col rounded-2xl bg-[var(--surface)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">New message</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Cancel
        </button>
      </div>
      <input
        type="search"
        autoFocus
        placeholder="Search people…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded-full bg-[var(--surface-raised)] px-4 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
      />
      <div className="mt-2 flex-1 overflow-y-auto">
        {q.trim().length > 0 && usersQuery.data?.items.length === 0 && (
          <p className="p-3 text-sm text-[var(--muted)]">No one found.</p>
        )}
        {usersQuery.data?.items.map((user) => (
          <button
            key={user.id}
            type="button"
            disabled={startingId !== null}
            onClick={() => void pick(user)}
            className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-[var(--surface-raised)] disabled:opacity-50"
          >
            <Avatar src={user.avatarUrl} alt={user.username} size={36} />
            <span className="truncate text-sm">
              {user.displayName ?? user.username}
            </span>
            {startingId === user.id && (
              <span className="ml-auto text-xs text-[var(--muted)]">Starting…</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function otherMember(channel: Channel, myId: string) {
  const members = Object.values(channel.state.members);
  return members.find((m) => m.user?.id !== myId)?.user;
}

function ChatInner() {
  const { client, ready, error } = useChat();
  const { user } = useAuth();
  const preselectId = useSearchParams().get("channelId");

  const [channels, setChannels] = useState<Channel[]>([]);
  const [active, setActive] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<FormatMessageResponse[]>([]);
  const [text, setText] = useState("");
  const [composing, setComposing] = useState(false);

  const selectChannel = useCallback(async (channel: Channel) => {
    await channel.watch();
    setActive(channel);
    setMessages(channel.state.messages);
  }, []);

  async function startNewChat(otherId: string) {
    if (!client) return;
    const { channelId } = await rippleClient.chat.createDirectChannel(otherId);
    const channel = client.channel("messaging", channelId);
    await selectChannel(channel);
    setChannels((prev) =>
      prev.some((c) => c.id === channel.id) ? prev : [channel, ...prev],
    );
    setComposing(false);
  }

  useEffect(() => {
    if (!client || !user) return;
    let cancelled = false;

    const refresh = async () => {
      const list = await client.queryChannels(
        { type: "messaging", members: { $in: [user.id] } },
        { last_message_at: -1 },
      );
      if (cancelled) return;
      setChannels(list);
      return list;
    };

    refresh().then((list) => {
      if (cancelled || !list) return;
      const preselect =
        (preselectId && list.find((c) => c.id === preselectId)) || list[0];
      if (preselect) void selectChannel(preselect);
    });

    client.on("message.new", refresh);
    client.on("notification.added_to_channel", refresh);
    return () => {
      cancelled = true;
      client.off("message.new", refresh);
      client.off("notification.added_to_channel", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, user?.id, preselectId, selectChannel]);

  useEffect(() => {
    if (!active) return;
    const onNew = () => setMessages(active.state.messages);
    active.on("message.new", onNew);
    return () => {
      active.off("message.new", onNew);
    };
  }, [active]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!active || !text.trim()) return;
    await active.sendMessage({ text: text.trim() });
    setText("");
  }

  if (error) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-4 py-12">
        <p className="text-[var(--muted)]">Chat is unavailable right now.</p>
      </main>
    );
  }

  if (!ready || !user) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-4 py-12">
        <p className="text-[var(--muted)]">Connecting…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 gap-4 px-4 py-5">
      <aside className="relative w-64 shrink-0 overflow-y-auto rounded-2xl bg-[var(--surface)] p-2">
        {composing && (
          <NewMessagePanel
            onClose={() => setComposing(false)}
            onStart={startNewChat}
          />
        )}
        <div className="flex items-center justify-between px-2 pb-2 pt-1">
          <h2 className="text-sm font-semibold">Messages</h2>
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="text-sm font-medium text-[var(--accent)]"
          >
            + New
          </button>
        </div>
        {channels.length === 0 && (
          <p className="p-3 text-sm text-[var(--muted)]">
            No conversations yet. Start one with the + New button above.
          </p>
        )}
        {channels.map((channel) => {
          const other = otherMember(channel, user.id);
          const isActive = active?.id === channel.id;
          return (
            <button
              key={channel.id}
              type="button"
              onClick={() => void selectChannel(channel)}
              className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${
                isActive ? "bg-[var(--surface-raised)]" : "hover:bg-[var(--surface-raised)]"
              }`}
            >
              <Avatar
                src={other?.image ?? null}
                alt={other?.name ?? "User"}
                size={36}
              />
              <span className="truncate text-sm">{other?.name ?? "User"}</span>
            </button>
          );
        })}
      </aside>

      <section className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-[var(--surface)]">
        {!active ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--muted)]">
            Select a conversation
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((message) => {
                const mine = message.user?.id === user.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <span
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        mine
                          ? "bg-[var(--accent)] text-[#071018]"
                          : "bg-[var(--surface-raised)]"
                      }`}
                    >
                      {message.text}
                    </span>
                  </div>
                );
              })}
            </div>
            <form
              onSubmit={onSubmit}
              className="flex gap-2 border-t border-[var(--line)] p-3"
            >
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Message…"
                className="flex-1 rounded-full bg-[var(--surface-raised)] px-4 py-2 text-sm outline-none ring-[var(--accent)] focus:ring-2"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[#071018] disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatInner />
    </Suspense>
  );
}
