import { apiRequest } from './client';
import type { Photo, PhotoList, PhotoUpdate } from './types';

export function listPhotos(washingPointId: string): Promise<PhotoList> {
  return apiRequest<PhotoList>(`/washing-points/${washingPointId}/photos`);
}

// staff/admin, multipart/form-data — client.ts's apiRequest lets fetch set
// its own Content-Type (with boundary) when the body is a FormData.
export function uploadPhoto(washingPointId: string, file: File, isCover?: boolean): Promise<Photo> {
  const form = new FormData();
  form.set('file', file);
  if (isCover) form.set('is_cover', 'true');
  return apiRequest<Photo>(`/washing-points/${washingPointId}/photos`, { method: 'POST', body: form });
}

export function updatePhoto(washingPointId: string, photoId: string, body: PhotoUpdate): Promise<Photo> {
  return apiRequest<Photo>(`/washing-points/${washingPointId}/photos/${photoId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deletePhoto(washingPointId: string, photoId: string): Promise<void> {
  return apiRequest<void>(`/washing-points/${washingPointId}/photos/${photoId}`, { method: 'DELETE' });
}
