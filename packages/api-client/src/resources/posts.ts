import { ApiClient } from '../client';
import {
  PaginatedResult,
  PaginationParams,
  Post,
  UploadableFile,
} from '../types';

export interface CreatePostInput {
  caption?: string;
  image: Blob | UploadableFile;
}

export function createPostsResource(client: ApiClient) {
  return {
    feed(params: PaginationParams = {}): Promise<PaginatedResult<Post>> {
      return client.request<PaginatedResult<Post>>('/posts', {
        query: params,
        auth: false,
      });
    },

    byAuthor(
      username: string,
      params: PaginationParams = {},
    ): Promise<PaginatedResult<Post>> {
      return client.request<PaginatedResult<Post>>(
        `/posts/user/${username}`,
        { query: params, auth: false },
      );
    },

    get(id: string): Promise<Post> {
      return client.request<Post>(`/posts/${id}`, { auth: false });
    },

    create(input: CreatePostInput): Promise<Post> {
      const formData = new FormData();
      if (input.caption) formData.append('caption', input.caption);
      formData.append('image', input.image as unknown as Blob);
      return client.request<Post>('/posts', { method: 'POST', formData });
    },

    update(id: string, caption: string): Promise<Post> {
      return client.request<Post>(`/posts/${id}`, {
        method: 'PATCH',
        body: { caption },
      });
    },

    remove(id: string): Promise<void> {
      return client.request(`/posts/${id}`, { method: 'DELETE' });
    },

    toggleLike(id: string): Promise<{ liked: boolean }> {
      return client.request<{ liked: boolean }>(`/posts/${id}/like`, {
        method: 'POST',
      });
    },
  };
}
