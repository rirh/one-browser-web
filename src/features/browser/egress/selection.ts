import type {
  AppSettings,
  UpdateSettingsRequest,
} from '@/features/browser/contracts';
import { getSettings } from '@/features/browser/settings/api';
import { isTauriRuntime } from '@/lib/desktop';

import { listEgressLines, probeEgressLines } from './api';
import type {
  EgressLineSnapshot,
  EgressOpenSelectionRequest,
  EgressProbeResult,
  RemoteEgressLine,
} from './types';

export const EGRESS_PROBE_CACHE_TTL_MS = 2 * 60 * 1000;
export const AUTO_EGRESS_VALUE = 'mode:auto';
export const MANUAL_EGRESS_PREFIX = 'manual:';
const EGRESS_LATENCY_TOLERANCE_MS = 50;
const EGRESS_LOAD_BAND_PERCENT = 10;

let cachedSnapshot:
  | { signature: string; expiresAt: number; snapshot: EgressLineSnapshot }
  | undefined;

export function egressSelectionValue(
  settings:
    | Pick<AppSettings, 'egressSelectionMode' | 'preferredEgressId'>
    | undefined,
) {
  return settings?.egressSelectionMode === 'manual' && settings.preferredEgressId
    ? `${MANUAL_EGRESS_PREFIX}${settings.preferredEgressId}`
    : AUTO_EGRESS_VALUE;
}

export function egressSelectionPatch(
  value: string,
): Pick<
  UpdateSettingsRequest,
  'egressSelectionMode' | 'preferredEgressId'
> | null {
  if (value === AUTO_EGRESS_VALUE) {
    return {
      egressSelectionMode: 'auto',
      preferredEgressId: null,
    };
  }
  if (!value.startsWith(MANUAL_EGRESS_PREFIX)) return null;
  const preferredEgressId = value.slice(MANUAL_EGRESS_PREFIX.length);
  if (!preferredEgressId) return null;
  return {
    egressSelectionMode: 'manual',
    preferredEgressId,
  };
}

export async function loadEgressLineSnapshot(options?: { force?: boolean }) {
  const lines = await listEgressLines();
  const targets = lines.filter(shouldProbeLine).map((line) => ({
    egressId: line.egress_id,
    endpoint: line.public_endpoint,
    tlsEnabled: line.tls_enabled,
  }));
  const signature = targets
    .map(
      (target) =>
        `${target.egressId}\u0000${target.endpoint}\u0000${target.tlsEnabled}`,
    )
    .sort()
    .join('\u0001');
  const now = Date.now();

  if (
    !options?.force &&
    cachedSnapshot?.signature === signature &&
    cachedSnapshot.expiresAt > now
  ) {
    return { ...cachedSnapshot.snapshot, lines };
  }

  let probes: EgressProbeResult[] = [];
  let testedAt: string | null = null;
  if (targets.length > 0 && isTauriRuntime()) {
    probes = await probeEgressLines(targets);
    testedAt = new Date().toISOString();
  }

  const snapshot = { lines, probes, testedAt } satisfies EgressLineSnapshot;
  cachedSnapshot = {
    signature,
    expiresAt: now + EGRESS_PROBE_CACHE_TTL_MS,
    snapshot,
  };
  return snapshot;
}

export async function prepareEgressOpenSelection(): Promise<EgressOpenSelectionRequest> {
  const settings = await getSettings();
  let probes: EgressProbeResult[] = [];

  try {
    probes = (await loadEgressLineSnapshot()).probes;
  } catch (error) {
    console.warn(
      '[egress-selection] line discovery or local probe failed; Server will select from authoritative health',
      error,
    );
  }

  return {
    egress_preference:
      settings.egressSelectionMode === 'manual'
        ? {
            mode: 'manual',
            egress_id: settings.preferredEgressId,
          }
        : { mode: 'auto', egress_id: null },
    egress_probes: probes.map((probe) => ({
      egress_id: probe.egressId,
      success: probe.success,
      latency_ms: probe.latencyMs,
    })),
  };
}

export function chooseRecommendedLine(
  lines: RemoteEgressLine[],
  probes: EgressProbeResult[],
) {
  const probesById = new Map(probes.map((probe) => [probe.egressId, probe]));
  let candidates = lines.filter(
    (line) =>
      isSelectableLine(line) &&
      probesById.get(line.egress_id)?.success !== false,
  );
  const measuredLatencies = candidates
    .map((line) => probesById.get(line.egress_id))
    .filter(
      (probe): probe is EgressProbeResult & { latencyMs: number } =>
        probe?.success === true && probe.latencyMs !== null,
    )
    .map((probe) => probe.latencyMs);

  if (measuredLatencies.length > 0) {
    const bestLatency = Math.min(...measuredLatencies);
    candidates = candidates.filter((line) => {
      const probe = probesById.get(line.egress_id);
      return (
        probe?.success === true &&
        probe.latencyMs !== null &&
        probe.latencyMs <= bestLatency + EGRESS_LATENCY_TOLERANCE_MS
      );
    });
  } else if ([...probesById.values()].some((probe) => probe.success)) {
    candidates = candidates.filter(
      (line) => probesById.get(line.egress_id)?.success === true,
    );
  }

  return candidates.toSorted((left, right) => {
    const leftProbe = probesById.get(left.egress_id);
    const rightProbe = probesById.get(right.egress_id);
    const loadBandDifference = loadBand(left) - loadBand(right);
    if (loadBandDifference !== 0) return loadBandDifference;
    if (left.recommended !== right.recommended) {
      return left.recommended ? -1 : 1;
    }
    const latencyDifference =
      (leftProbe?.latencyMs ?? Number.MAX_SAFE_INTEGER) -
      (rightProbe?.latencyMs ?? Number.MAX_SAFE_INTEGER);
    if (latencyDifference !== 0) return latencyDifference;
    return left.egress_id.localeCompare(right.egress_id);
  })[0];
}

export function isSelectableLine(line: RemoteEgressLine) {
  return (
    (line.status === 'healthy' || line.status === 'degraded') &&
    (line.load_percent === null || line.load_percent < 100)
  );
}

function shouldProbeLine(line: RemoteEgressLine) {
  return isSelectableLine(line) || line.status === 'init';
}

function loadBand(line: RemoteEgressLine) {
  return Math.floor((line.load_percent ?? 100) / EGRESS_LOAD_BAND_PERCENT);
}
