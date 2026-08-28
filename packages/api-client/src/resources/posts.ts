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

export interface UpdatePostInput {
  caption: string;
  image?: Blob | UploadableFile;
}

export function createPostsResource(client: ApiClient) {
  return {
    feed(params: PaginationParams = {}): Promise<PaginatedResult<Post>> {
      // Auth is optional server-side (OptionalJwtAuthGuard), but we still
      // want to send the token when we have one so isLikedByMe reflects
      // the current user instead of always coming back false.
      return client.request<PaginatedResult<Post>>('/posts', {
        query: params,
      });
    },

    byAuthor(
      username: string,
      params: PaginationParams = {},
    ): Promise<PaginatedResult<Post>> {
      return client.request<PaginatedResult<Post>>(
        `/posts/user/${username}`,
        { query: params },
      );
    },

    get(id: string): Promise<Post> {
      return client.request<Post>(`/posts/${id}`);
    },

    create(input: CreatePostInput): Promise<Post> {
      const formData = new FormData();
      if (input.caption) formData.append('caption', input.caption);
      formData.append('image', input.image as unknown as Blob);
      return client.request<Post>('/posts', { method: 'POST', formData });
    },

    update(id: string, input: UpdatePostInput): Promise<Post> {
      if (input.image) {
        const formData = new FormData();
        formData.append('caption', input.caption);
        formData.append('image', input.image as unknown as Blob);
        return client.request<Post>(`/posts/${id}`, {
          method: 'PATCH',
          formData,
        });
      }
      return client.request<Post>(`/posts/${id}`, {
        method: 'PATCH',
        body: { caption: input.caption },
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
