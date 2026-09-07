let inFlight = false;

self.addEventListener('message', (event) => {
  const message = event.data;
  if (
    !message ||
    message.type !== 'check' ||
    typeof message.url !== 'string' ||
    typeof message.buildId !== 'string' ||
    !message.buildId ||
    inFlight
  ) {
    return;
  }

  void checkForUpdate(message);
});

async function checkForUpdate(message) {
  inFlight = true;
  try {
    const url = new URL(message.url);
    url.searchParams.set('t', Date.now().toString());
    const response = await fetch(url.toString(), {
      cache: 'no-store',
      credentials: 'same-origin',
    });
    if (!response.ok) {
      throw new Error(`Update check failed with HTTP ${response.status}`);
    }
    const current = await response.json();
    if (!current || typeof current.buildId !== 'string' || !current.buildId) {
      throw new Error('Update manifest has no build identifier');
    }
    self.postMessage({
      type: isNewerVersion(current.version, message.version)
        ? 'changed'
        : 'unchanged',
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    inFlight = false;
  }
}

function isNewerVersion(latest, installed) {
  const parse = (value) => {
    if (typeof value !== 'string') return null;
    const normalized = value.trim().replace(/^v/i, '');
    if (!/^\d+\.\d+\.\d+$/.test(normalized)) return null;
    const parts = normalized.split('.').map(Number);
    return parts.every(Number.isSafeInteger) ? parts : null;
  };
  const left = parse(latest);
  const right = parse(installed);
  if (!left || !right) throw new Error('Invalid release version');
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return left[index] > right[index];
  }
  return false;
}
