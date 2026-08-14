import { ApiClient } from '../client';
import { PaginatedResult, PaginationParams, User } from '../types';

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
    ): Promise<PaginatedResult<User>> {
      return client.request<PaginatedResult<User>>(
        `/users/${username}/followers`,
        { query: params, auth: false },
      );
    },

    following(
      username: string,
      params: PaginationParams = {},
    ): Promise<PaginatedResult<User>> {
      return client.request<PaginatedResult<User>>(
        `/users/${username}/following`,
        { query: params, auth: false },
      );
    },
  };
}
