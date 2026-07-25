import { buildQueryPath, http } from "@/lib/request"
import type {
  CreateEgressEnrollmentPayload,
  EgressEnrollmentConfig,
  EgressEnrollmentResult,
  EgressNodeListParams,
  EgressNodePageResponse,
  EgressNodeStatusUpdate,
  EgressUninstallCommand,
  UpdateEgressNodePayload,
} from "@/types/admin"

const EGRESS_NODE_PATH = "/system/egress-nodes"
export const EGRESS_NODE_EVENTS_PATH = `${EGRESS_NODE_PATH}/events`

export function listEgressNodes(params?: EgressNodeListParams) {
  return http.get<EgressNodePageResponse>(
    buildQueryPath(EGRESS_NODE_PATH, params)
  )
}

export function createEgressEnrollment(payload: CreateEgressEnrollmentPayload) {
  return http.post<EgressEnrollmentResult>(
    `${EGRESS_NODE_PATH}/enrollments`,
    payload
  )
}

export function getEgressEnrollmentConfig() {
  return http.get<EgressEnrollmentConfig>(
    `${EGRESS_NODE_PATH}/enrollment-config`
  )
}

export function getEgressUninstallCommand() {
  return http.get<EgressUninstallCommand>(
    `${EGRESS_NODE_PATH}/uninstall-command`
  )
}

export function updateEgressNodeStatus(
  egressId: string,
  status: EgressNodeStatusUpdate
) {
  return http.patch<void>(
    `${EGRESS_NODE_PATH}/${encodeURIComponent(egressId)}/status`,
    { status }
  )
}

export function updateEgressNode(
  egressId: string,
  payload: UpdateEgressNodePayload
) {
  return http.patch<void>(
    `${EGRESS_NODE_PATH}/${encodeURIComponent(egressId)}`,
    payload
  )
}

export function deleteEgressNode(egressId: string) {
  return http.del<void>(`${EGRESS_NODE_PATH}/${encodeURIComponent(egressId)}`)
}

export function cancelEgressEnrollment(egressId: string) {
  return http.del<void>(
    `${EGRESS_NODE_PATH}/enrollments/${encodeURIComponent(egressId)}`
  )
}
