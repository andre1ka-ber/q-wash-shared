import { tokenStorage } from '../auth/tokenStorage';
import { API_BASE_URL } from '../api/client';
import type { DisplayBoard } from '../api/types';

const MAX_BACKOFF_MS = 30_000;

// Native EventSource can't attach the Authorization header q-wash-api
// requires on every route, so this hand-rolls the SSE protocol over
// fetch()'s ReadableStream instead of using EventSource. Reconnects
// indefinitely with capped exponential backoff — unlike authStore.
// restore()'s bounded 5-attempt retry (which gives up and logs out on a
// real rejection), there's no equivalent "give up" state for a board
// stream: the caller's own polling fallback keeps the screen usable
// regardless, so backing off and retrying forever is the right shape.
export function subscribeToBoardEvents(
  washingPointId: string,
  onMessage: (board: DisplayBoard) => void,
  onError?: (err: unknown) => void,
): () => void {
  let stopped = false;
  let attempt = 0;
  let controller: AbortController | null = null;

  async function connectOnce(): Promise<void> {
    controller = new AbortController();
    const accessToken = tokenStorage.getAccessToken();
    const res = await fetch(`${API_BASE_URL}/washing-points/${washingPointId}/board/events`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      signal: controller.signal,
    });
    if (!res.ok || !res.body) {
      throw new Error(`board events stream: unexpected response (status ${res.status})`);
    }
    attempt = 0; // backoff only applies to reconnects after a connection actually succeeded once

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';
      for (const frame of frames) {
        const dataLine = frame.split('\n').find((line) => line.startsWith('data: '));
        if (!dataLine) continue; // skips ": ping" heartbeat comment frames
        try {
          onMessage(JSON.parse(dataLine.slice('data: '.length)) as DisplayBoard);
        } catch (err) {
          onError?.(err);
        }
      }
    }
  }

  async function loop(): Promise<void> {
    while (!stopped) {
      try {
        await connectOnce();
      } catch (err) {
        if (!stopped) onError?.(err);
      }
      if (stopped) return;
      const delay = Math.min(1000 * 2 ** attempt, MAX_BACKOFF_MS);
      attempt++;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  void loop();

  return () => {
    stopped = true;
    controller?.abort();
  };
}
