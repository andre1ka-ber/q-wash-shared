import { apiRequest } from './client';
import type {
  AvailabilityList,
  BoardItemList,
  Booking,
  BookingStatusUpdate,
  DisplayBoard,
  LiveBoxList,
  ManualBookingCreate,
  QueueDayItem,
  QueueDayList,
  Reports,
  ReportsPeriod,
} from './types';

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

// GET /washing-points/{id}/reports?period= — staff/admin only, q-wash-cabinet's
// "Отчёты" tab. period defaults to 'today' server-side when omitted.
export function getReports(washingPointId: string, period: ReportsPeriod): Promise<Reports> {
  return apiRequest<Reports>(`/washing-points/${washingPointId}/reports?period=${period}`);
}

// Reachable by the booking's own customer or by staff/worker/admin at its
// washing point (broadened RBAC, docs/PLAN_WEB_APPS.md phase 7) — only
// valid while status is queue/waiting (409 cannot_cancel once washing has
// started, see queue.Manager.CancelBooking). q-wash-worker's "Снять"
// no-show action.
export function cancelBooking(id: string): Promise<Booking> {
  return apiRequest<Booking>(`/queue/${id}/cancel`, { method: 'PATCH' });
}

// GET /washing-points/{id}/queue/day?date=YYYY-MM-DD — staff/worker/admin at
// this point. Every booking scheduled that calendar day (Asia/Dushanbe), any
// status. q-wash-cabinet's "Очередь" tab.
export function listQueueDay(washingPointId: string, date: string): Promise<QueueDayList> {
  return apiRequest<QueueDayList>(`/washing-points/${washingPointId}/queue/day?date=${date}`);
}

// POST /washing-points/{id}/queue/manual — a staff-created walk-in booking.
// The client is found-or-created by phone (required, E.164) server-side.
export function createManualBooking(washingPointId: string, body: ManualBookingCreate): Promise<QueueDayItem> {
  return apiRequest<QueueDayItem>(`/washing-points/${washingPointId}/queue/manual`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// GET /washing-points/{id}/availability — public. 15-minute candidate
// windows for one service on one day with which boxes are free for each.
export function getAvailability(washingPointId: string, serviceId: string, date: string): Promise<AvailabilityList> {
  return apiRequest<AvailabilityList>(
    `/washing-points/${washingPointId}/availability?service_id=${serviceId}&date=${date}`,
  );
}
