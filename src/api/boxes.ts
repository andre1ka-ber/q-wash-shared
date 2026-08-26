import { apiRequest } from './client';
import type { Box, BoxCreate, BoxList, BoxUpdate } from './types';

export function listBoxes(washingPointId: string): Promise<BoxList> {
  return apiRequest<BoxList>(`/washing-points/${washingPointId}/boxes`);
}

export function createBox(washingPointId: string, body: BoxCreate): Promise<Box> {
  return apiRequest<Box>(`/washing-points/${washingPointId}/boxes`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateBox(washingPointId: string, boxId: string, body: BoxUpdate): Promise<Box> {
  return apiRequest<Box>(`/washing-points/${washingPointId}/boxes/${boxId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteBox(washingPointId: string, boxId: string): Promise<void> {
  return apiRequest<void>(`/washing-points/${washingPointId}/boxes/${boxId}`, { method: 'DELETE' });
}
