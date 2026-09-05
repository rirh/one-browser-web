const DOWNLOAD_PROMPT_KEY = 'one-browser:show-download-after-login';
const DOWNLOAD_PROMPT_EVENT = 'one-browser:download-prompt-changed';

export function requestDownloadPrompt() {
  try {
    window.sessionStorage.setItem(DOWNLOAD_PROMPT_KEY, '1');
    window.dispatchEvent(new Event(DOWNLOAD_PROMPT_EVENT));
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

export function consumeDownloadPrompt() {
  try {
    const requested = window.sessionStorage.getItem(DOWNLOAD_PROMPT_KEY) === '1';
    if (requested) {
      window.sessionStorage.removeItem(DOWNLOAD_PROMPT_KEY);
      window.dispatchEvent(new Event(DOWNLOAD_PROMPT_EVENT));
    }
    return requested;
  } catch {
    return false;
  }
}

export function isDownloadPromptRequested() {
  try {
    return window.sessionStorage.getItem(DOWNLOAD_PROMPT_KEY) === '1';
  } catch {
    return false;
  }
}

export function subscribeDownloadPrompt(onChange: () => void) {
  window.addEventListener(DOWNLOAD_PROMPT_EVENT, onChange);
  return () => window.removeEventListener(DOWNLOAD_PROMPT_EVENT, onChange);
}
