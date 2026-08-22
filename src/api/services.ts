import { apiRequest } from './client';
import type { PriceOption, PriceOptionInput, Service, ServiceCreate, ServiceList, ServiceUpdate } from './types';

export function listServices(washingPointId: string): Promise<ServiceList> {
  return apiRequest<ServiceList>(`/washing-points/${washingPointId}/services`);
}

export function createService(washingPointId: string, body: ServiceCreate): Promise<Service> {
  return apiRequest<Service>(`/washing-points/${washingPointId}/services`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateService(id: string, body: ServiceUpdate): Promise<Service> {
  return apiRequest<Service>(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

// Soft-delete (sets is_active=false) — there is no hard-delete endpoint.
export function deactivateService(id: string): Promise<void> {
  return apiRequest<void>(`/services/${id}`, { method: 'DELETE' });
}

export function createPriceOption(serviceId: string, body: PriceOptionInput): Promise<PriceOption> {
  return apiRequest<PriceOption>(`/services/${serviceId}/price-options`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updatePriceOption(id: string, body: Partial<PriceOptionInput>): Promise<PriceOption> {
  return apiRequest<PriceOption>(`/price-options/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
}

// 409 last_price_option / price_option_in_use — surfaced to the caller as
// an ApiError, not swallowed here.
export function deletePriceOption(id: string): Promise<void> {
  return apiRequest<void>(`/price-options/${id}`, { method: 'DELETE' });
}
