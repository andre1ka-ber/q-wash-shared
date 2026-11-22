import { apiRequest } from './client';
import type { PlatformSettings, PlatformSettingsUpdate, AdminAnalytics, AdminAnalyticsPeriod, AdminPlatformAnalytics, AdminStats, AdminWashingPointList } from './types';

export function listAdminWashingPoints(): Promise<AdminWashingPointList> {
  return apiRequest<AdminWashingPointList>('/admin/washing-points');
}

export function getAdminAnalytics(period: AdminAnalyticsPeriod): Promise<AdminAnalytics> {
  return apiRequest<AdminAnalytics>(`/admin/analytics?period=${period}`);
}

export function getAdminPlatformAnalytics(period: AdminAnalyticsPeriod): Promise<AdminPlatformAnalytics> {
  return apiRequest<AdminPlatformAnalytics>(`/admin/analytics/platform?period=${period}`);
}

export function getAdminStats(): Promise<AdminStats> {
  return apiRequest<AdminStats>('/admin/stats');
}

export function getAdminSettings(): Promise<PlatformSettings> {
  return apiRequest<PlatformSettings>('/admin/settings');
}

export function updateAdminSettings(update: PlatformSettingsUpdate): Promise<PlatformSettings> {
  return apiRequest<PlatformSettings>('/admin/settings', { method: 'PATCH', body: JSON.stringify(update) });
}
