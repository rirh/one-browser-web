import { desktopInvoke } from '@/lib/desktop';
import { http } from '@/lib/http';

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
