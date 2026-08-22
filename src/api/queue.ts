import { apiRequest } from './client';
import type { BoardItemList, Booking, BookingStatusUpdate } from './types';

// Admin-only when washingPointId is omitted — returns every point's live
// board at once. staff/worker callers are always forced server-side to
// their own point regardless of this param (see openapi.yaml).
export function listQueueNetworkWide(washingPointId?: string): Promise<BoardItemList> {
  const query = washingPointId ? `?washing_point_id=${washingPointId}` : '';
  return apiRequest<BoardItemList>(`/queue${query}`);
}

export function updateBookingStatus(id: string, status: BookingStatusUpdate['status']): Promise<Booking> {
  return apiRequest<Booking>(`/queue/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}
