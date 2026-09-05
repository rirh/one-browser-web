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
      type: current.buildId === message.buildId ? 'unchanged' : 'changed',
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
