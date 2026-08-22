import { apiRequest } from './client';
import type { ScheduleList, ScheduleRow } from './types';

export function getSchedule(washingPointId: string): Promise<ScheduleList> {
  return apiRequest<ScheduleList>(`/washing-points/${washingPointId}/schedule`);
}

// staff/admin. Atomically replaces all 7 rows — must send exactly one per
// weekday, not a partial upsert (see openapi.yaml).
export function replaceSchedule(washingPointId: string, items: ScheduleRow[]): Promise<ScheduleList> {
  return apiRequest<ScheduleList>(`/washing-points/${washingPointId}/schedule`, {
    method: 'PUT',
    body: JSON.stringify({ items }),
  });
}
