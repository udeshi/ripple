import { ApiClient } from '../client';

export interface ChatCredentials {
  apiKey: string;
  token: string;
  userId: string;
}

export interface DirectChannel {
  channelId: string;
  channelType: string;
}

export function createChatResource(client: ApiClient) {
  return {
    getToken(): Promise<ChatCredentials> {
      return client.request<ChatCredentials>('/chat/token');
    },

    // Gets or creates the 1:1 channel with `memberId`, provisioning both
    // users in Stream server-side. Use this instead of creating the
    // channel directly from the Stream client, which fails with "users
    // ... don't exist" if the other person has never opened chat before.
    createDirectChannel(memberId: string): Promise<DirectChannel> {
      return client.request<DirectChannel>('/chat/channels', {
        method: 'POST',
        body: { memberId },
      });
    },
  };
}
