import { desktopInvoke } from '@/platform/desktop';
import { http } from '@/platform/http';

import type {
  EgressLinesPayload,
  EgressProbeResult,
  EgressProbeTarget,
  RemoteEgressLine,
} from './types';

export async function listEgressLines() {
  const response = await http.get<EgressLinesPayload | RemoteEgressLine[]>(
    '/browser/egress/lines',
  );
  return Array.isArray(response.data) ? response.data : response.data.lines;
}

export function probeEgressLines(targets: EgressProbeTarget[]) {
  return desktopInvoke<EgressProbeResult[]>('probe_egress_lines', {
    request: { targets },
  });
}
