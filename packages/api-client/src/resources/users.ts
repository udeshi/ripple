import { ApiClient } from '../client';
import { UploadableFile, User } from '../types';

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
}

export function createUsersResource(client: ApiClient) {
  return {
    getProfile(username: string): Promise<User> {
      return client.request<User>(`/users/${username}`, { auth: false });
    },

    updateProfile(input: UpdateProfileInput): Promise<User> {
      return client.request<User>('/users/me', {
        method: 'PATCH',
        body: input,
      });
    },

    uploadAvatar(file: Blob | UploadableFile): Promise<User> {
      const formData = new FormData();
      // React Native's FormData accepts {uri, name, type} where the DOM
      // lib expects Blob; both runtimes' actual implementations handle it,
      // this cast just bridges the two type definitions.
      formData.append('file', file as unknown as Blob);
      return client.request<User>('/users/me/avatar', {
        method: 'POST',
        formData,
      });
    },
  };
}
