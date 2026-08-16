import { ApiClient } from '../client';
import { Me, Profile, PublicProfile, UploadableFile } from '../types';

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
}

export function createUsersResource(client: ApiClient) {
  return {
    getMe(): Promise<Me> {
      return client.request<Me>('/users/me');
    },

    getProfile(username: string): Promise<PublicProfile> {
      return client.request<PublicProfile>(`/users/${username}`, {
        auth: false,
      });
    },

    updateProfile(input: UpdateProfileInput): Promise<Profile> {
      return client.request<Profile>('/users/me', {
        method: 'PATCH',
        body: input,
      });
    },

    uploadAvatar(file: Blob | UploadableFile): Promise<Profile> {
      const formData = new FormData();
      // React Native's FormData accepts {uri, name, type} where the DOM
      // lib expects Blob; both runtimes' actual implementations handle it,
      // this cast just bridges the two type definitions.
      formData.append('file', file as unknown as Blob);
      return client.request<Profile>('/users/me/avatar', {
        method: 'POST',
        formData,
      });
    },
  };
}
