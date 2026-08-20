import { apiRequest } from './client';
import type { AdminStats, AdminWashingPointList } from './types';

export function listAdminWashingPoints(): Promise<AdminWashingPointList> {
  return apiRequest<AdminWashingPointList>('/admin/washing-points');
}

export function getAdminStats(): Promise<AdminStats> {
  return apiRequest<AdminStats>('/admin/stats');
}
