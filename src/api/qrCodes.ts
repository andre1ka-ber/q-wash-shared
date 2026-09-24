import { apiRequest } from './client';
import type { QrCode, QrCodeList, QrCodePoolList, QrCodeStatus } from './types';

export function generateQrCodes(count: number, batchLabel: string): Promise<QrCode[]> {
  return apiRequest<QrCodeList>('/qr-codes/generate', {
    method: 'POST',
    body: JSON.stringify({ count, batch_label: batchLabel }),
  }).then((res) => res.items);
}

export function listQrCodes(params?: { status?: QrCodeStatus; search?: string }): Promise<QrCodePoolList> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  return apiRequest<QrCodePoolList>(`/qr-codes${qs ? `?${qs}` : ''}`);
}

export function getQrCode(id: string): Promise<QrCode> {
  return apiRequest<QrCode>(`/qr-codes/${id}`);
}

export function assignQrCode(id: string, washingPointId: string): Promise<QrCode> {
  return apiRequest<QrCode>(`/qr-codes/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ washing_point_id: washingPointId }),
  });
}

export function unassignQrCode(id: string): Promise<QrCode> {
  return apiRequest<QrCode>(`/qr-codes/${id}/unassign`, { method: 'POST' });
}

export function disableQrCode(id: string): Promise<QrCode> {
  return apiRequest<QrCode>(`/qr-codes/${id}/disable`, { method: 'POST' });
}

// A 404 (qr_code_not_found — this washing point has no code assigned yet)
// propagates as a thrown ApiError; callers show an empty state for it
// rather than having it swallowed here.
export function getMyQrCode(): Promise<QrCode> {
  return apiRequest<QrCode>('/qr-codes/mine');
}

export function requestQrCodeReplacement(): Promise<QrCode> {
  return apiRequest<QrCode>('/qr-codes/mine/request-replacement', { method: 'POST' });
}
