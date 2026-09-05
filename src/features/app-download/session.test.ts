import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  consumeDownloadPrompt,
  isDownloadPromptRequested,
  requestDownloadPrompt,
  subscribeDownloadPrompt,
} from './session';

afterEach(() => vi.unstubAllGlobals());

function setupSession() {
  const values = new Map<string, string>();
  const events = new EventTarget();
  vi.stubGlobal('window', {
    sessionStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
  });
}

describe('download prompt session', () => {
  it('keeps snapshots repeatable until the prompt is dismissed', () => {
    setupSession();
    requestDownloadPrompt();
    expect(isDownloadPromptRequested()).toBe(true);
    expect(isDownloadPromptRequested()).toBe(true);
    expect(consumeDownloadPrompt()).toBe(true);
    expect(isDownloadPromptRequested()).toBe(false);
    expect(consumeDownloadPrompt()).toBe(false);
  });

  it('notifies mounted subscribers on request and dismissal and cleans up', () => {
    setupSession();
    const changed = vi.fn();
    const unsubscribe = subscribeDownloadPrompt(changed);
    requestDownloadPrompt();
    consumeDownloadPrompt();
    expect(changed).toHaveBeenCalledTimes(2);
    unsubscribe();
    requestDownloadPrompt();
    expect(changed).toHaveBeenCalledTimes(2);
  });

  it('tolerates unavailable session storage', () => {
    vi.stubGlobal('window', {
      get sessionStorage() {
        throw new Error('storage unavailable');
      },
    });
    expect(() => requestDownloadPrompt()).not.toThrow();
    expect(isDownloadPromptRequested()).toBe(false);
    expect(consumeDownloadPrompt()).toBe(false);
  });
});
