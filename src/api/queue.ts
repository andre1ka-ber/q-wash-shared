import { apiRequest } from './client';
import type { BoardItemList, Booking, BookingStatusUpdate, DisplayBoard, LiveBoxList } from './types';

// Admin-only when washingPointId is omitted — returns every point's live
// board at once. staff/worker callers are always forced server-side to
// their own point regardless of this param (see openapi.yaml).
export function listQueueNetworkWide(washingPointId?: string): Promise<BoardItemList> {
  const query = washingPointId ? `?washing_point_id=${washingPointId}` : '';
  return apiRequest<BoardItemList>(`/queue${query}`);
}

// GET /washing-points/{id}/queue?date= — staff/worker/admin only
// (requireQueueOps), scoped to one point's own bookings for one calendar
// day (today when date is omitted). q-wash-worker's "Очередь на сегодня"
// table.
export function listQueueByWashingPoint(washingPointId: string, date?: string): Promise<BoardItemList> {
  const query = date ? `?date=${date}` : '';
  return apiRequest<BoardItemList>(`/washing-points/${washingPointId}/queue${query}`);
}

// GET /washing-points/{id}/boxes/live — q-wash-worker's box-cards screen.
export function getBoxesLive(washingPointId: string): Promise<LiveBoxList> {
  return apiRequest<LiveBoxList>(`/washing-points/${washingPointId}/boxes/live`);
}

export function updateBookingStatus(id: string, status: BookingStatusUpdate['status']): Promise<Booking> {
  return apiRequest<Booking>(`/queue/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

// requireQueueOps (staff/worker/admin) — only valid while the booking is
// StatusWashing (409 cannot_pause/cannot_resume otherwise, see
// queue.Manager.Pause/Resume).
export function pauseBooking(id: string): Promise<Booking> {
  return apiRequest<Booking>(`/queue/${id}/pause`, { method: 'PATCH' });
}

export function resumeBooking(id: string): Promise<Booking> {
  return apiRequest<Booking>(`/queue/${id}/resume`, { method: 'PATCH' });
}

// GET /washing-points/{id}/board — staff/admin only (not worker, unlike
// boxes/live above — the display kiosk logs in as staff/admin, no new
// role). q-wash-display's one summary screen.
export function getDisplayBoard(washingPointId: string): Promise<DisplayBoard> {
  return apiRequest<DisplayBoard>(`/washing-points/${washingPointId}/board`);
}

// Reachable by the booking's own customer or by staff/worker/admin at its
// washing point (broadened RBAC, docs/PLAN_WEB_APPS.md phase 7) — only
// valid while status is queue/waiting (409 cannot_cancel once washing has
// started, see queue.Manager.CancelBooking). q-wash-worker's "Снять"
// no-show action.
export function cancelBooking(id: string): Promise<Booking> {
  return apiRequest<Booking>(`/queue/${id}/cancel`, { method: 'PATCH' });
}
