import { afterEach, describe, expect, it, vi } from 'vitest';
import { assignQrCode, generateQrCodes, getMyQrCode, listQrCodes } from './qrCodes';
import { ApiError } from './errors';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('qrCodes', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('generateQrCodes posts count/batch_label and unwraps items', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(201, { items: [{ id: '1', code: 'QW-0001' }] }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await generateQrCodes(10, 'Партия #3');

    expect(result).toEqual([{ id: '1', code: 'QW-0001' }]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/qr-codes/generate');
    expect(JSON.parse(init.body)).toEqual({ count: 10, batch_label: 'Партия #3' });
  });

  it('listQrCodes builds a query string only from the params actually set', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(200, { items: [], stats: { total: 0, free: 0, assigned: 0, disabled: 0 } }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await listQrCodes({ status: 'free', search: 'QW-01' });
    expect(String(fetchMock.mock.calls[0][0])).toContain('/qr-codes?status=free&search=QW-01');

    await listQrCodes();
    expect(String(fetchMock.mock.calls[1][0])).toMatch(/\/qr-codes$/);
  });

  it('assignQrCode posts washing_point_id to the right path', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { id: 'c1', status: 'assigned' }));
    vi.stubGlobal('fetch', fetchMock);

    await assignQrCode('c1', 'wp-1');

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/qr-codes/c1/assign');
    expect(JSON.parse(init.body)).toEqual({ washing_point_id: 'wp-1' });
  });

  it('getMyQrCode propagates a 404 as an ApiError instead of swallowing it', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          jsonResponse(404, { error: { code: 'qr_code_not_found', message: 'no qr code assigned' } }),
        ),
      ),
    );

    await expect(getMyQrCode()).rejects.toBeInstanceOf(ApiError);
    await expect(getMyQrCode()).rejects.toMatchObject({ code: 'qr_code_not_found' });
  });
});
