import { desktopInvoke, isTauriRuntime } from '@/platform/desktop';

export async function copyTextToClipboard(text: string) {
  if (isTauriRuntime()) {
    await desktopInvoke('write_clipboard_text', { request: { text } });
    return;
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      fallbackCopyText(text);
      return;
    }
  }

  fallbackCopyText(text);
}

function fallbackCopyText(text: string) {
  if (typeof document === 'undefined') {
    throw new Error('copy failed');
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error('copy failed');
  }
}
