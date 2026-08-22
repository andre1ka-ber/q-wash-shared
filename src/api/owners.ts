import { apiRequest } from './client';
import type { Owner, OwnerCreate, OwnerList, OwnerUpdate } from './types';

export function listOwners(): Promise<OwnerList> {
  return apiRequest<OwnerList>('/owners');
}

export function createOwner(body: OwnerCreate): Promise<Owner> {
  return apiRequest<Owner>('/owners', { method: 'POST', body: JSON.stringify(body) });
}

export function updateOwner(id: string, body: OwnerUpdate): Promise<Owner> {
  return apiRequest<Owner>(`/owners/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}
