import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAdminStats, listAdminWashingPoints } from './admin';
import { listBoxes, createBox, updateBox, deleteBox } from './boxes';
import { createConnectionRequest, listConnectionRequests, reviewConnectionRequest } from './connectionRequests';
import { createOwner, listOwners, updateOwner } from './owners';
import { deletePhoto, listPhotos, updatePhoto, uploadPhoto } from './photos';
import { getSchedule, replaceSchedule } from './schedule';
import { createPriceOption, createService, deactivateService, deletePriceOption, listServices, updatePriceOption, updateService } from './services';
import { createWashingPoint, getWashingPoint, updateWashingPoint } from './washingPoints';

// These wrappers are thin, so the value of testing them is pinning the
// contract with q-wash-api (docs/API.md): method, path and body per call. A
// typo in a path or a verb would otherwise only show up against a live API.

function stubFetch(status = 200, body: unknown = {}) {
  const fetchMock = vi.fn().mockImplementation(() =>
    Promise.resolve(
      status === 204
        ? new Response(null, { status })
        : new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
    ),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function lastCall(fetchMock: ReturnType<typeof vi.fn>) {
  const [url, init] = fetchMock.mock.calls.at(-1)!;
  const parsed = new URL(String(url), 'http://x');
  return { path: parsed.pathname.replace(/^\/api\/v1/, ''), search: parsed.search, method: (init?.method ?? 'GET') as string, body: init?.body as string | FormData | undefined };
}

afterEach(() => vi.unstubAllGlobals());

interface Case {
  name: string;
  call: () => Promise<unknown>;
  method: string;
  path: string;
  body?: unknown;
  status?: number;
}

const cases: Case[] = [
  { name: 'listServices', call: () => listServices('wp'), method: 'GET', path: '/washing-points/wp/services' },
  { name: 'createService', call: () => createService('wp', { name: 'S', duration_minutes: 30, price_options: [] }), method: 'POST', path: '/washing-points/wp/services', body: { name: 'S', duration_minutes: 30, price_options: [] } },
  { name: 'updateService', call: () => updateService('s1', { name: 'N' }), method: 'PATCH', path: '/services/s1', body: { name: 'N' } },
  { name: 'deactivateService', call: () => deactivateService('s1'), method: 'DELETE', path: '/services/s1', status: 204 },
  { name: 'createPriceOption', call: () => createPriceOption('s1', { name: 'Sedan', price_cents: 500 }), method: 'POST', path: '/services/s1/price-options', body: { name: 'Sedan', price_cents: 500 } },
  { name: 'updatePriceOption', call: () => updatePriceOption('po1', { price_cents: 700 }), method: 'PATCH', path: '/price-options/po1', body: { price_cents: 700 } },
  { name: 'deletePriceOption', call: () => deletePriceOption('po1'), method: 'DELETE', path: '/price-options/po1', status: 204 },

  { name: 'listBoxes', call: () => listBoxes('wp'), method: 'GET', path: '/washing-points/wp/boxes' },
  { name: 'createBox', call: () => createBox('wp', { label: 'Lift' }), method: 'POST', path: '/washing-points/wp/boxes', body: { label: 'Lift' } },
  { name: 'updateBox', call: () => updateBox('wp', 'b1', { is_open: false }), method: 'PATCH', path: '/washing-points/wp/boxes/b1', body: { is_open: false } },
  { name: 'deleteBox', call: () => deleteBox('wp', 'b1'), method: 'DELETE', path: '/washing-points/wp/boxes/b1', status: 204 },

  { name: 'getSchedule', call: () => getSchedule('wp'), method: 'GET', path: '/washing-points/wp/schedule' },
  { name: 'replaceSchedule wraps the rows in {items}', call: () => replaceSchedule('wp', [{ weekday: 0, is_open: false }]), method: 'PUT', path: '/washing-points/wp/schedule', body: { items: [{ weekday: 0, is_open: false }] } },

  { name: 'listOwners', call: () => listOwners(), method: 'GET', path: '/owners' },
  { name: 'createOwner', call: () => createOwner({ name: 'O' }), method: 'POST', path: '/owners', body: { name: 'O' } },
  { name: 'updateOwner', call: () => updateOwner('o1', { name: 'P' }), method: 'PATCH', path: '/owners/o1', body: { name: 'P' } },

  { name: 'getWashingPoint', call: () => getWashingPoint('wp'), method: 'GET', path: '/washing-points/wp' },
  { name: 'updateWashingPoint', call: () => updateWashingPoint('wp', { status: 'paused' }), method: 'PATCH', path: '/washing-points/wp', body: { status: 'paused' } },
  { name: 'createWashingPoint', call: () => createWashingPoint({ name: 'W', address: 'A', latitude: 1, longitude: 2, boxes_count: 1 }), method: 'POST', path: '/washing-points', body: { name: 'W', address: 'A', latitude: 1, longitude: 2, boxes_count: 1 } },

  { name: 'listAdminWashingPoints', call: () => listAdminWashingPoints(), method: 'GET', path: '/admin/washing-points' },
  { name: 'getAdminStats', call: () => getAdminStats(), method: 'GET', path: '/admin/stats' },

  { name: 'listPhotos', call: () => listPhotos('wp'), method: 'GET', path: '/washing-points/wp/photos' },
  { name: 'updatePhoto', call: () => updatePhoto('wp', 'ph1', { is_cover: true }), method: 'PATCH', path: '/washing-points/wp/photos/ph1', body: { is_cover: true } },
  { name: 'deletePhoto', call: () => deletePhoto('wp', 'ph1'), method: 'DELETE', path: '/washing-points/wp/photos/ph1', status: 204 },

  { name: 'createConnectionRequest', call: () => createConnectionRequest({ business_name: 'B', contact_name: 'C', contact_phone: '+1', address: 'A', boxes_count: 1 }), method: 'POST', path: '/connection-requests', body: { business_name: 'B', contact_name: 'C', contact_phone: '+1', address: 'A', boxes_count: 1 } },
];

describe('q-wash-api endpoint wrappers', () => {
  it.each(cases)('$name', async ({ call, method, path, body, status }) => {
    const fetchMock = stubFetch(status ?? 200);
    await call();
    const req = lastCall(fetchMock);
    expect(req.method).toBe(method);
    expect(req.path).toBe(path);
    if (body === undefined) expect(req.body).toBeUndefined();
    else expect(JSON.parse(req.body as string)).toEqual(body);
  });

  it('listConnectionRequests filters by status only when given', async () => {
    const fetchMock = stubFetch(200, { items: [] });
    await listConnectionRequests();
    expect(lastCall(fetchMock).search).toBe('');
    await listConnectionRequests('new');
    expect(lastCall(fetchMock).search).toBe('?status=new');
  });

  it('reviewConnectionRequest PATCHes the decision to the request', async () => {
    const fetchMock = stubFetch();
    await reviewConnectionRequest('cr1', { status: 'approved' });
    const req = lastCall(fetchMock);
    expect(req.method).toBe('PATCH');
    expect(req.path).toBe('/connection-requests/cr1');
    expect(JSON.parse(req.body as string)).toEqual({ status: 'approved' });
  });

  it('uploadPhoto sends multipart form data with the file and the cover flag', async () => {
    const fetchMock = stubFetch(201, { id: 'ph1' });
    const file = new File(['x'], 'front.jpg', { type: 'image/jpeg' });
    await uploadPhoto('wp', file, true);

    const req = lastCall(fetchMock);
    expect(req.method).toBe('POST');
    expect(req.path).toBe('/washing-points/wp/photos');
    const form = req.body as FormData;
    expect(form).toBeInstanceOf(FormData);
    expect((form.get('file') as File).name).toBe('front.jpg');
    expect(form.get('is_cover')).toBe('true');
    const init = fetchMock.mock.calls.at(-1)![1] as RequestInit;
    // fetch must set the multipart boundary itself
    expect(new Headers(init.headers).has('Content-Type')).toBe(false);
  });
});
