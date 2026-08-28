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
      // Auth is optional server-side (OptionalJwtAuthGuard), but send the
      // token when we have one so isFollowedByMe reflects the current user.
      return client.request<PublicProfile>(`/users/${username}`);
    },

    updateProfile(input: UpdateProfileInput): Promise<Profile> {
      return client.request<Profile>('/users/me', {
        method: 'PATCH',
        body: input,
      });
    },

    uploadAvatar(file: Blob | UploadableFile): Promise<Profile> {
      const formData = new FormData();
      formData.append('file', file as unknown as Blob);
      return client.request<Profile>('/users/me/avatar', {
        method: 'POST',
        formData,
      });
    },
  };
}
