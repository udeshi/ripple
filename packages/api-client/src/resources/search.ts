import { ApiClient } from '../client';
import { PaginatedResult, PaginationParams, Post, User } from '../types';

export function createSearchResource(client: ApiClient) {
  return {
    users(
      q: string,
      params: PaginationParams = {},
    ): Promise<PaginatedResult<User>> {
      return client.request<PaginatedResult<User>>('/search/users', {
        query: { q, ...params },
        auth: false,
      });
    },

    posts(
      q: string,
      params: PaginationParams = {},
    ): Promise<PaginatedResult<Post>> {
      return client.request<PaginatedResult<Post>>('/search/posts', {
        query: { q, ...params },
        auth: false,
      });
    },
  };
}
