import type * as React from "react"
import { NetworkIcon, UserRoundIcon } from "lucide-react"

import { findMenuIconOption } from "@/views/system/_components/resource/menu-icons"
import type { AppRouteId } from "@/router/routes"

const fallbackRouteIcons: Partial<Record<AppRouteId, React.ReactNode>> = {
  "egress-nodes": <NetworkIcon />,
  account: <UserRoundIcon />,
}

export function getRouteIcon(
  iconValue: string | null | undefined,
  routeId: AppRouteId
) {
  const option = findMenuIconOption(iconValue)
  if (option) {
    return <option.Icon />
  }

  return fallbackRouteIcons[routeId] ?? null
}
