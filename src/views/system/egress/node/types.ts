export type EgressNodeStatus =
  | 'pending'
  | 'installing'
  | 'expired'
  | 'init'
  | 'healthy'
  | 'degraded'
  | 'draining'
  | 'unhealthy'
  | 'disabled';

export type EgressNodeResource = {
  egress_id: string;
  domain: string;
  public_endpoint: string;
  display_name: string;
  lifecycle: 'pending' | 'active';
  status: EgressNodeStatus;
  online: boolean;
  environment: 'development' | 'production';
  tls_enabled: boolean;
  enabled: boolean;
  draining: boolean;
  active_connections: number;
  active_streams: number;
  max_connections: number;
  max_streams: number;
  runtime_version: string;
  self_upgrade: boolean;
  upgrade: EgressUpgradeResource | null;
  load_percent: number | null;
  heartbeat_at: string | null;
  enrollment_expires_at: string | null;
  claimed_at: string | null;
  connected_at: string | null;
};

export type EgressUpgradeResource = {
  upgrade_id: string;
  target_version: string;
  status: 'pending' | 'accepted' | 'running' | 'succeeded' | 'failed';
  message: string;
};

export type EgressReleaseStatus = {
  latest_version: string;
  available_versions: string[];
};

export type EgressBatchUpgradeResult = {
  queued: number;
  skipped: number;
  targets: Array<{
    egress_id: string;
    status: 'queued' | 'skipped';
    message: string;
  }>;
};

export type EgressNodePage = {
  list: EgressNodeResource[];
  total: number;
};

export type CreateEgressEnrollmentPayload = {
  domain: string;
  display_name: string;
  max_connections?: number;
  max_streams?: number;
  replace?: boolean;
  replace_egress_id?: string;
};

export type CreateEgressEnrollmentResult = {
  egress_id: string;
  expires_at: string;
  install_command: string;
  native_install_command: string;
  docker_install_command: string;
  uninstall_command: string;
  environment: 'development' | 'production';
  tls_enabled: boolean;
};
