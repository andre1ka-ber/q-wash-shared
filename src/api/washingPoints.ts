import { apiRequest } from './client';
import type {
  WashingPoint,
  WashingPointCreate,
  WashingPointCreated,
  WashingPointCredentialUsernames,
  WashingPointUpdate,
  Credential,
} from './types';

// Admin-only (POST /washing-points) — creating a point directly bypasses
// the connection-request onboarding flow, see openapi.yaml. Not under
// /admin/* since it's the same endpoint the public GET /washing-points
// list lives on, just gated by role server-side. Response includes the
// new point's one-time staff/worker credentials — see WashingPointCreated.
export function createWashingPoint(body: WashingPointCreate): Promise<WashingPointCreated> {
  return apiRequest<WashingPointCreated>('/washing-points', { method: 'POST', body: JSON.stringify(body) });
}

export function getWashingPoint(id: string): Promise<WashingPoint> {
  return apiRequest<WashingPoint>(`/washing-points/${id}`);
}

// staff/admin; staff may only act on their own point (see openapi.yaml).
export function updateWashingPoint(id: string, body: WashingPointUpdate): Promise<WashingPoint> {
  return apiRequest<WashingPoint>(`/washing-points/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

// Admin-only. Usernames only — passwords are never retrievable after the
// one-time reveal at creation/reset.
export function getWashingPointCredentials(id: string): Promise<WashingPointCredentialUsernames> {
  return apiRequest<WashingPointCredentialUsernames>(`/admin/washing-points/${id}/credentials`);
}

// Admin-only. Regenerates role's ("staff" | "worker") password and revokes
// its existing sessions; returns the new plaintext password once.
export function resetWashingPointCredentials(id: string, role: 'staff' | 'worker'): Promise<Credential> {
  return apiRequest<Credential>(`/admin/washing-points/${id}/credentials/${role}/reset`, { method: 'POST' });
}
