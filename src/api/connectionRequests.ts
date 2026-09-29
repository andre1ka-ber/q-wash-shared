import { apiRequest } from './client';
import type {
  ConnectionRequest,
  ConnectionRequestCreate,
  ConnectionRequestList,
  ConnectionRequestReview,
  ConnectionRequestReviewed,
  ConnectionRequestStatus,
} from './types';

export function listConnectionRequests(status?: ConnectionRequestStatus): Promise<ConnectionRequestList> {
  const query = status ? `?status=${status}` : '';
  return apiRequest<ConnectionRequestList>(`/connection-requests${query}`);
}

export function createConnectionRequest(body: ConnectionRequestCreate): Promise<ConnectionRequest> {
  return apiRequest<ConnectionRequest>('/connection-requests', { method: 'POST', body: JSON.stringify(body) });
}

// Approving (not rejecting) also auto-provisions the new point's
// staff+worker logins — see ConnectionRequestReviewed.credentials.
export function reviewConnectionRequest(
  id: string,
  review: ConnectionRequestReview,
): Promise<ConnectionRequestReviewed> {
  return apiRequest<ConnectionRequestReviewed>(`/connection-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(review),
  });
}
