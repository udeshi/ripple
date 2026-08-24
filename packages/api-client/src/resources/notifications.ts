import { ApiClient } from '../client';
import {
  Notification,
  PaginatedResult,
  PaginationParams,
} from '../types';

export function createNotificationsResource(client: ApiClient) {
  return {
    list(
      params: PaginationParams = {},
    ): Promise<PaginatedResult<Notification>> {
      return client.request<PaginatedResult<Notification>>('/notifications', {
        query: params,
      });
    },

    unreadCount(): Promise<number> {
      return client.request<number>('/notifications/unread-count');
    },

    markAllRead(): Promise<{ success: boolean }> {
      return client.request<{ success: boolean }>('/notifications/read-all', {
        method: 'POST',
      });
    },

    markRead(id: string): Promise<{ success: boolean }> {
      return client.request<{ success: boolean }>(`/notifications/${id}/read`, {
        method: 'POST',
      });
    },
  };
}
