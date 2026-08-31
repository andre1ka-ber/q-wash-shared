import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { subscribeToBoardEvents } from './client';
import type { DisplayBoard } from '../api/types';

function streamFromChunks(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

function sseResponse(chunks: string[]): Response {
  return new Response(streamFromChunks(chunks), { status: 200 });
}

function expectedAttempts(elapsedMs: number): number {
  let count = 1;
  let t = 0;
  let attempt = 0;
  for (;;) {
    const delay = Math.min(1000 * 2 ** attempt, 30_000);
    t += delay;
    if (t > elapsedMs) break;
    count++;
    attempt++;
  }
  return count;
}

describe('subscribeToBoardEvents', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('parses data frames, skips ping heartbeats, and reports malformed frames via onError', async () => {
    const board: DisplayBoard = { boxes_active: 1, boxes_total: 3, boxes: [], waiting: [] };
    const fetchMock = vi.fn().mockResolvedValue(
      sseResponse([': ping\n\n', 'data: not-json\n\n', `data: ${JSON.stringify(board)}\n\n`]),
    );
    vi.stubGlobal('fetch', fetchMock);
    const onMessage = vi.fn();
    const onError = vi.fn();

    const unsubscribe = subscribeToBoardEvents('wp1', onMessage, onError);
    await vi.advanceTimersByTimeAsync(0);
    unsubscribe();

    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage).toHaveBeenCalledWith(board);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(SyntaxError);
  });

  it('backs off exponentially with a 30s cap on repeated connection failures', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('connection refused'));
    vi.stubGlobal('fetch', fetchMock);
    const onError = vi.fn();

    const unsubscribe = subscribeToBoardEvents('wp1', vi.fn(), onError);
    const elapsed = 200_000;
    await vi.advanceTimersByTimeAsync(elapsed);
    unsubscribe();

    expect(fetchMock).toHaveBeenCalledTimes(expectedAttempts(elapsed));
    expect(onError).toHaveBeenCalledTimes(expectedAttempts(elapsed));
  });

  it('unsubscribe() stops the reconnect loop', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('connection refused'));
    vi.stubGlobal('fetch', fetchMock);

    const unsubscribe = subscribeToBoardEvents('wp1', vi.fn(), vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    unsubscribe();
    await vi.advanceTimersByTimeAsync(60_000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
