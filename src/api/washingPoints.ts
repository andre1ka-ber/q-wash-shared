import { apiRequest } from './client';
import type { WashingPoint, WashingPointCreate, WashingPointUpdate } from './types';

// Admin-only (POST /washing-points) — creating a point directly bypasses
// the connection-request onboarding flow, see openapi.yaml. Not under
// /admin/* since it's the same endpoint the public GET /washing-points
// list lives on, just gated by role server-side.
export function createWashingPoint(body: WashingPointCreate): Promise<WashingPoint> {
  return apiRequest<WashingPoint>('/washing-points', { method: 'POST', body: JSON.stringify(body) });
}

export function getWashingPoint(id: string): Promise<WashingPoint> {
  return apiRequest<WashingPoint>(`/washing-points/${id}`);
}

// staff/admin; staff may only act on their own point (see openapi.yaml).
export function updateWashingPoint(id: string, body: WashingPointUpdate): Promise<WashingPoint> {
  return apiRequest<WashingPoint>(`/washing-points/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}
