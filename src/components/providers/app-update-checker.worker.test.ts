/// <reference types="node" />

import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const source = readFileSync('public/app-update-checker.worker.js', 'utf8');
function startWorker(fetch: ReturnType<typeof vi.fn>) {
  let receive: (event: { data: unknown }) => void = () => {};
  const postMessage = vi.fn();
  runInNewContext(source, {
    URL,
    Date,
    fetch,
    self: {
      addEventListener: (_type: string, handler: typeof receive) => {
        receive = handler;
      },
      postMessage,
    },
  });
  return {
    postMessage,
    check: () =>
      receive({
        data: {
          type: 'check',
          url: 'https://browser.example.test/app-version.json',
          buildId: 'loaded-build',
        },
      }),
  };
}
const manifest = (buildId: string) => ({
  ok: true,
  json: async () => ({ buildId }),
});

describe('page update worker', () => {
  it('detects a changed build on the first check without response validators', async () => {
    const fetch = vi.fn().mockResolvedValue(manifest('new-build'));
    const worker = startWorker(fetch);
    worker.check();
    await vi.waitFor(() =>
      expect(worker.postMessage).toHaveBeenCalledWith({ type: 'changed' }),
    );
    const [url, options] = fetch.mock.calls[0];
    expect(new URL(url).pathname).toBe('/app-version.json');
    expect(new URL(url).searchParams.has('t')).toBe(true);
    expect(options.cache).toBe('no-store');
  });
  it('compares subsequent checks against the loaded build', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(manifest('loaded-build'))
      .mockResolvedValueOnce(manifest('new-build'));
    const worker = startWorker(fetch);
    worker.check();
    await vi.waitFor(() =>
      expect(worker.postMessage).toHaveBeenLastCalledWith({
        type: 'unchanged',
      }),
    );
    worker.check();
    await vi.waitFor(() =>
      expect(worker.postMessage).toHaveBeenLastCalledWith({ type: 'changed' }),
    );
  });
  it('reports failed or invalid manifests without a false update and allows retry', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ version: '1.0.0' }),
      })
      .mockResolvedValueOnce(manifest('new-build'));
    const worker = startWorker(fetch);
    for (const count of [1, 2]) {
      worker.check();
      await vi.waitFor(() =>
        expect(worker.postMessage).toHaveBeenCalledTimes(count),
      );
      expect(worker.postMessage).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: 'error' }),
      );
    }
    worker.check();
    await vi.waitFor(() =>
      expect(worker.postMessage).toHaveBeenLastCalledWith({ type: 'changed' }),
    );
  });
});
