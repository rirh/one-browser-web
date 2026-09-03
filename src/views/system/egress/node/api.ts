import { http } from '@/lib/http';

import type {
  CreateEgressEnrollmentPayload,
  CreateEgressEnrollmentResult,
  EgressNodePage,
  EgressNodeStatus,
  EgressBatchUpgradeResult,
  EgressReleaseStatus,
} from './types';

const NODE_PATH = '/system/egress-nodes';

export function listEgressNodes(options: {
  keyword?: string;
  status?: EgressNodeStatus;
  page: number;
  page_size: number;
}) {
  const params: Record<string, string | number> = {
    page: options.page,
    page_size: options.page_size,
  };
  if (options.keyword) params.keyword = options.keyword;
  if (options.status) params.status = options.status;
  return http
    .get<EgressNodePage>(NODE_PATH, params)
    .then((response) => response.data);
}

export function createEgressEnrollment(payload: CreateEgressEnrollmentPayload) {
  return http
    .post<
      CreateEgressEnrollmentResult,
      CreateEgressEnrollmentPayload
    >(`${NODE_PATH}/enrollments`, payload)
    .then((response) => response.data);
}

export function updateEgressNode(egressId: string, displayName: string) {
  return http.patch(`${NODE_PATH}/${encodeURIComponent(egressId)}`, {
    display_name: displayName,
  });
}

export function updateEgressNodeStatus(
  egressId: string,
  status: 'draining' | 'enabled',
) {
  return http.patch(`${NODE_PATH}/${encodeURIComponent(egressId)}/status`, {
    status,
  });
}

export function deleteEgressNode(egressId: string) {
  return http.delete(`${NODE_PATH}/${encodeURIComponent(egressId)}`);
}

export function cancelEgressEnrollment(egressId: string) {
  return http.delete(
    `${NODE_PATH}/enrollments/${encodeURIComponent(egressId)}`,
  );
}

export function getEgressReleaseStatus() {
  return http
    .get<EgressReleaseStatus>(`${NODE_PATH}/releases`)
    .then((response) => response.data);
}

export function batchUpgradeEgressNodes(egressIds: string[], version: string) {
  return http
    .post<EgressBatchUpgradeResult, { egress_ids: string[]; version: string }>(
      `${NODE_PATH}/batch-upgrade`,
      {
        egress_ids: egressIds,
        version,
      },
    )
    .then((response) => response.data);
}
