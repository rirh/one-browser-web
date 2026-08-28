const DOWNLOAD_PROMPT_KEY = 'one-browser:show-download-after-login';

export function requestDownloadPrompt() {
  try {
    window.sessionStorage.setItem(DOWNLOAD_PROMPT_KEY, '1');
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

export function consumeDownloadPrompt() {
  try {
    const requested = window.sessionStorage.getItem(DOWNLOAD_PROMPT_KEY) === '1';
    if (requested) {
      window.sessionStorage.removeItem(DOWNLOAD_PROMPT_KEY);
    }
    return requested;
  } catch {
    return false;
  }
}
