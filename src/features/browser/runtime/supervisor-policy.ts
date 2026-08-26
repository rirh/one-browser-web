export const runtimeRenewIntervalMs = 45_000;
export const runtimeRenewJitterMs = 5_000;

type RuntimeRenewCandidate = {
  profileId: string;
  status: string;
  tunnelGeneration: number | null;
  tunnelRouteExpiresAt: string | null;
};

export function isRuntimeRenewCandidate(runtime: RuntimeRenewCandidate) {
  return (
    runtime.status === 'active' &&
    /^remote-env-[1-9]\d*$/.test(runtime.profileId) &&
    runtime.tunnelGeneration !== null &&
    runtime.tunnelGeneration > 0 &&
    Boolean(runtime.tunnelRouteExpiresAt)
  );
}

export function nextRuntimeRenewDelay(randomValue = Math.random()) {
  const normalizedRandom = Math.min(1, Math.max(0, randomValue));
  const jitter = Math.round((normalizedRandom * 2 - 1) * runtimeRenewJitterMs);
  return runtimeRenewIntervalMs + jitter;
}
