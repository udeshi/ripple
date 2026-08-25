import { ApiClient, ApiClientConfig } from './client';
import { createAdminResource } from './resources/admin';
import { createAuthResource } from './resources/auth';
import { createCommentsResource } from './resources/comments';
import { createFlagsResource } from './resources/flags';
import { createFollowsResource } from './resources/follows';
import { createNotificationsResource } from './resources/notifications';
import { createPostsResource } from './resources/posts';
import { createReportsResource } from './resources/reports';
import { createSearchResource } from './resources/search';
import { createUsersResource } from './resources/users';
import { AuthResponse } from './types';

export * from './types';
export { ApiClient, ApiError } from './client';
export type { ApiClientConfig, TokenStore } from './client';

export function createRippleClient(config: ApiClientConfig) {
  const client = new ApiClient(config);

  const onAuthenticated = async (result: AuthResponse) => {
    await config.tokenStore.setTokens(result.accessToken, result.refreshToken);
  };

  return {
    auth: createAuthResource(client, onAuthenticated),
    users: createUsersResource(client),
    posts: createPostsResource(client),
    comments: createCommentsResource(client),
    follows: createFollowsResource(client),
    search: createSearchResource(client),
    flags: createFlagsResource(client),
    notifications: createNotificationsResource(client),
    reports: createReportsResource(client),
    admin: createAdminResource(client),
  };
}

export type RippleClient = ReturnType<typeof createRippleClient>;
