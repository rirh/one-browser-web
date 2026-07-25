import type { EgressNodeStatus } from "@/types/admin"

const STATUS_LABELS: Record<EgressNodeStatus, string> = {
  pending: "待接入",
  installing: "安装中",
  expired: "已过期",
  init: "初始化",
  healthy: "健康",
  degraded: "降级",
  draining: "排空中",
  unhealthy: "异常",
  disabled: "已禁用",
}

export function getEgressNodeStatusLabel(status: EgressNodeStatus) {
  return STATUS_LABELS[status]
}

export function getEgressNodeStatusVariant(status: EgressNodeStatus) {
  if (status === "unhealthy" || status === "expired") {
    return "destructive" as const
  }
  if (status === "healthy") {
    return "default" as const
  }
  if (status === "disabled" || status === "init") {
    return "outline" as const
  }
  return "secondary" as const
}
