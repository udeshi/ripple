export interface UserSummary {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface SearchUserResult extends UserSummary {
  bio: string | null;
  followersCount: number;
}

export interface Profile extends UserSummary {
  bio: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  createdAt: string;
}

export interface PublicProfile extends Profile {
  isFollowedByMe: boolean;
}

export type UserRole = 'USER' | 'ADMIN';

export interface Me extends Profile {
  email: string;
  role: UserRole;
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

export interface Post {
  id: string;
  authorId: string;
  author: UserSummary;
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
  author: UserSummary;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW';

export interface Notification {
  id: string;
  type: NotificationType;
  actor: UserSummary;
  postId: string | null;
  read: boolean;
  createdAt: string;
}

export type ReportTargetType = 'POST' | 'COMMENT' | 'USER';
export type ReportReason =
  | 'SPAM'
  | 'HARASSMENT'
  | 'NUDITY'
  | 'HATE_SPEECH'
  | 'OTHER';
export type ReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

export interface PostReportTarget {
  id: string;
  imageUrl: string;
  caption: string | null;
  author: { username: string };
}

export interface CommentReportTarget {
  id: string;
  content: string;
  postId: string;
  author: { username: string };
}

export interface Report {
  id: string;
  reporter: UserSummary;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
  resolvedAt: string | null;
  target: PostReportTarget | CommentReportTarget | UserSummary | null;
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
