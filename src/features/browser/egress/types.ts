export type EgressLineStatus =
  | 'init'
  | 'healthy'
  | 'degraded'
  | 'draining'
  | 'unhealthy'
  | (string & {});

export interface RemoteEgressLine {
  egress_id: string;
  display_name: string;
  public_endpoint: string;
  tls_enabled: boolean;
  region: string | null;
  carrier: string | null;
  status: EgressLineStatus;
  load_percent: number | null;
  recommended: boolean;
}

export interface EgressLinesPayload {
  lines: RemoteEgressLine[];
}

export interface EgressProbeTarget {
  egressId: string;
  endpoint: string;
  tlsEnabled: boolean;
}

export interface EgressProbeResult {
  egressId: string;
  success: boolean;
  latencyMs: number | null;
  successfulSamples: number;
  failedSamples: number;
}

export interface EgressLineSnapshot {
  lines: RemoteEgressLine[];
  probes: EgressProbeResult[];
  testedAt: string | null;
}

export interface EgressOpenSelectionRequest {
  egress_preference:
    | { mode: 'auto'; egress_id?: null }
    | { mode: 'manual'; egress_id: string | null };
  egress_probes: Array<{
    egress_id: string;
    success: boolean;
    latency_ms: number | null;
  }>;
}
