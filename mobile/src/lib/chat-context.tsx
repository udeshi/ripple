import { createContext, ReactNode, useCallback, useContext } from 'react';
import { StreamChat } from 'stream-chat';
import { useCreateChatClient } from 'stream-chat-expo';
import { rippleClient } from '../api/client';
import { STREAM_API_KEY } from '../config';
import { useAuth } from './auth-context';
import type { Me } from '@ripple/api-client';

interface ChatContextValue {
  client: StreamChat | null;
}

const ChatContext = createContext<ChatContextValue>({ client: null });

function ConnectedChatProvider({
  user,
  children,
}: {
  user: Me;
  children: ReactNode;
}) {
  const tokenProvider = useCallback(
    async () => (await rippleClient.chat.getToken()).token,
    [],
  );

  const client = useCreateChatClient({
    apiKey: STREAM_API_KEY,
    userData: {
      id: user.id,
      name: user.displayName ?? user.username,
      image: user.avatarUrl ?? undefined,
    },
    tokenOrProvider: tokenProvider,
  });

  return (
    <ChatContext.Provider value={{ client }}>{children}</ChatContext.Provider>
  );
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user || !STREAM_API_KEY) {
    return (
      <ChatContext.Provider value={{ client: null }}>
        {children}
      </ChatContext.Provider>
    );
  }

  return (
    <ConnectedChatProvider user={user} key={user.id}>
      {children}
    </ConnectedChatProvider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
