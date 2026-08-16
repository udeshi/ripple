import { ApiClient } from '../client';
import {
  PaginatedResult,
  PaginationParams,
  Post,
  SearchUserResult,
} from '../types';

export function createSearchResource(client: ApiClient) {
  return {
    users(
      q: string,
      params: PaginationParams = {},
    ): Promise<PaginatedResult<SearchUserResult>> {
      return client.request<PaginatedResult<SearchUserResult>>(
        '/search/users',
        { query: { q, ...params }, auth: false },
      );
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
