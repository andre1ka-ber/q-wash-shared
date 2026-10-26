import { apiRequest } from './client';
import type { BookingPhoto, BookingPhotoList } from './types';

export function listBookingPhotos(bookingId: string): Promise<BookingPhotoList> {
  return apiRequest<BookingPhotoList>(`/queue/${bookingId}/photos`);
}

// staff/worker/admin, multipart/form-data — only accepted while the booking is washing.
export function uploadBookingPhoto(bookingId: string, file: File): Promise<BookingPhoto> {
  const form = new FormData();
  form.set('file', file);
  return apiRequest<BookingPhoto>(`/queue/${bookingId}/photos`, { method: 'POST', body: form });
}

export function deleteBookingPhoto(bookingId: string, photoId: string): Promise<void> {
  return apiRequest<void>(`/queue/${bookingId}/photos/${photoId}`, { method: 'DELETE' });
}
