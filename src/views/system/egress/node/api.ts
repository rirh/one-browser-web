import { http } from '@/lib/http';

import type {
  CreateEgressEnrollmentPayload,
  CreateEgressEnrollmentResult,
  EgressNodePage,
  EgressNodeStatus,
} from './types';

const NODE_PATH = '/system/egress-nodes';

export function listEgressNodes(options: {
  keyword?: string;
  status?: EgressNodeStatus;
}) {
  const params: Record<string, string | number> = { page: 1, page_size: 100 };
  if (options.keyword) params.keyword = options.keyword;
  if (options.status) params.status = options.status;
  return http.get<EgressNodePage>(NODE_PATH, params).then((response) => response.data);
}

export function createEgressEnrollment(payload: CreateEgressEnrollmentPayload) {
  return http
    .post<CreateEgressEnrollmentResult, CreateEgressEnrollmentPayload>(
      `${NODE_PATH}/enrollments`,
      payload,
    )
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
  return http.delete(`${NODE_PATH}/enrollments/${encodeURIComponent(egressId)}`);
}
