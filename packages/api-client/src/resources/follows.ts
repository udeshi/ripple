import { ApiClient } from '../client';
import { PaginatedResult, PaginationParams, UserSummary } from '../types';

export function createFollowsResource(client: ApiClient) {
  return {
    follow(username: string): Promise<{ following: boolean }> {
      return client.request<{ following: boolean }>(
        `/users/${username}/follow`,
        { method: 'POST' },
      );
    },

    unfollow(username: string): Promise<{ following: boolean }> {
      return client.request<{ following: boolean }>(
        `/users/${username}/follow`,
        { method: 'DELETE' },
      );
    },

    followers(
      username: string,
      params: PaginationParams = {},
    ): Promise<PaginatedResult<UserSummary>> {
      return client.request<PaginatedResult<UserSummary>>(
        `/users/${username}/followers`,
        { query: params, auth: false },
      );
    },

    following(
      username: string,
      params: PaginationParams = {},
    ): Promise<PaginatedResult<UserSummary>> {
      return client.request<PaginatedResult<UserSummary>>(
        `/users/${username}/following`,
        { query: params, auth: false },
      );
    },
  };
}
