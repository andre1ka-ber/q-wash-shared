import { apiRequest } from './client';
import type {
  ConnectionRequest,
  ConnectionRequestCreate,
  ConnectionRequestList,
  ConnectionRequestReview,
  ConnectionRequestStatus,
} from './types';

export function listConnectionRequests(status?: ConnectionRequestStatus): Promise<ConnectionRequestList> {
  const query = status ? `?status=${status}` : '';
  return apiRequest<ConnectionRequestList>(`/connection-requests${query}`);
}

export function createConnectionRequest(body: ConnectionRequestCreate): Promise<ConnectionRequest> {
  return apiRequest<ConnectionRequest>('/connection-requests', { method: 'POST', body: JSON.stringify(body) });
}

export function reviewConnectionRequest(
  id: string,
  review: ConnectionRequestReview,
): Promise<ConnectionRequest> {
  return apiRequest<ConnectionRequest>(`/connection-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(review),
  });
}
