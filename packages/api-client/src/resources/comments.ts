import { ApiClient } from '../client';
import { Comment, PaginatedResult, PaginationParams } from '../types';

export function createCommentsResource(client: ApiClient) {
  return {
    list(
      postId: string,
      params: PaginationParams = {},
    ): Promise<PaginatedResult<Comment>> {
      return client.request<PaginatedResult<Comment>>(
        `/posts/${postId}/comments`,
        { query: params, auth: false },
      );
    },

    create(postId: string, content: string): Promise<Comment> {
      return client.request<Comment>(`/posts/${postId}/comments`, {
        method: 'POST',
        body: { content },
      });
    },

    remove(commentId: string): Promise<void> {
      return client.request(`/comments/${commentId}`, { method: 'DELETE' });
    },
  };
}
