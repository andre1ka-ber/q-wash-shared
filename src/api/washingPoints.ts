import { apiRequest } from './client';
import type { WashingPoint, WashingPointCreate } from './types';

// Admin-only (POST /washing-points) — creating a point directly bypasses
// the connection-request onboarding flow, see openapi.yaml. Not under
// /admin/* since it's the same endpoint the public GET /washing-points
// list lives on, just gated by role server-side.
export function createWashingPoint(body: WashingPointCreate): Promise<WashingPoint> {
  return apiRequest<WashingPoint>('/washing-points', { method: 'POST', body: JSON.stringify(body) });
}
