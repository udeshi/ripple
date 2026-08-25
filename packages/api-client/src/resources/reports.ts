import { ApiClient } from '../client';
import { ReportReason, ReportTargetType } from '../types';

export interface CreateReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
}

export function createReportsResource(client: ApiClient) {
  return {
    create(input: CreateReportInput) {
      return client.request('/reports', { method: 'POST', body: input });
    },
  };
}
