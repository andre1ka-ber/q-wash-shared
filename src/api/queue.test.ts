import { afterEach, describe, expect, it, vi } from 'vitest';
import { createManualBooking, getAvailability, listQueueDay, updateBookingStatus } from './queue';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('queue day API', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('listQueueDay requests the per-day endpoint with the date', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { items: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await listQueueDay('wp-1', '2026-09-26');
    expect(String(fetchMock.mock.calls[0][0])).toContain('/washing-points/wp-1/queue/day?date=2026-09-26');
  });

  it('createManualBooking POSTs the body to /queue/manual', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, { id: 'b1' }));
    vi.stubGlobal('fetch', fetchMock);
    const body = {
      service_id: 's',
      price_option_id: 'p',
      box_number: 1,
      scheduled_start_at: '2026-09-26T15:00:00+05:00',
      car_name: 'Camry',
      client_phone: '+992900000000',
    };
    await createManualBooking('wp-1', body);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/washing-points/wp-1/queue/manual');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual(body);
  });

  it('getAvailability passes service_id and date', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { items: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getAvailability('wp-1', 'svc-1', '2026-09-27');
    expect(String(fetchMock.mock.calls[0][0])).toContain('/washing-points/wp-1/availability?service_id=svc-1&date=2026-09-27');
  });

  it('updateBookingStatus can restore to queue and mark no_show', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { id: 'b1' }));
    vi.stubGlobal('fetch', fetchMock);
    await updateBookingStatus('b1', 'no_show');
    await updateBookingStatus('b1', 'queue');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ status: 'no_show' });
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ status: 'queue' });
  });
});
