import { ApiClient, ApiClientConfig } from './client';
import { createAuthResource } from './resources/auth';
import { createCommentsResource } from './resources/comments';
import { createFlagsResource } from './resources/flags';
import { createFollowsResource } from './resources/follows';
import { createPostsResource } from './resources/posts';
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
  };
}

export type RippleClient = ReturnType<typeof createRippleClient>;
