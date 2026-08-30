"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { StreamChat } from "stream-chat";
import { rippleClient } from "./apiClient";
import { useAuth } from "./auth-context";

interface ChatContextValue {
  client: StreamChat | null;
  ready: boolean;
  error: string | null;
}

const ChatContext = createContext<ChatContextValue>({
  client: null,
  ready: false,
  error: null,
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [client, setClient] = useState<StreamChat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const connectedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      if (connectedUserId.current) {
        client?.disconnectUser();
        connectedUserId.current = null;
        setClient(null);
      }
      return;
    }

    if (connectedUserId.current === user.id) return;

    let cancelled = false;
    setError(null);

    (async () => {
      try {
        const { apiKey, token, userId } = await rippleClient.chat.getToken();
        if (cancelled) return;

        const instance = StreamChat.getInstance(apiKey);
        await instance.connectUser(
          {
            id: userId,
            name: user.displayName ?? user.username,
            image: user.avatarUrl ?? undefined,
          },
          token,
        );
        if (cancelled) {
          await instance.disconnectUser();
          return;
        }
        connectedUserId.current = userId;
        setClient(instance);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Chat is unavailable",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <ChatContext.Provider value={{ client, ready: !!client, error }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
