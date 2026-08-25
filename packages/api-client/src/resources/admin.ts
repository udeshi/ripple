import { ApiClient } from '../client';
import {
  PaginatedResult,
  PaginationParams,
  Report,
  ReportStatus,
} from '../types';

export function createAdminResource(client: ApiClient) {
  return {
    listReports(
      params: PaginationParams & { status?: ReportStatus } = {},
    ): Promise<PaginatedResult<Report>> {
      return client.request<PaginatedResult<Report>>('/admin/reports', {
        query: params,
      });
    },

    resolveReport(id: string) {
      return client.request(`/admin/reports/${id}/resolve`, {
        method: 'POST',
      });
    },

    dismissReport(id: string) {
      return client.request(`/admin/reports/${id}/dismiss`, {
        method: 'POST',
      });
    },

    banUser(username: string) {
      return client.request(`/admin/users/${username}/ban`, {
        method: 'POST',
      });
    },

    unbanUser(username: string) {
      return client.request(`/admin/users/${username}/unban`, {
        method: 'POST',
      });
    },

    removePost(id: string) {
      return client.request(`/admin/posts/${id}`, { method: 'DELETE' });
    },

    removeComment(id: string) {
      return client.request(`/admin/comments/${id}`, { method: 'DELETE' });
    },
  };
}
