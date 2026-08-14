export interface User {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface PostAuthor {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface Post {
  id: string;
  authorId: string;
  author: PostAuthor;
  caption: string | null;
  imageUrl: string;
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: PostAuthor;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  [key: string]: string | number | undefined;
  page?: number;
  limit?: number;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
}

export interface UploadableFile {
  uri: string;
  name: string;
  type: string;
}
