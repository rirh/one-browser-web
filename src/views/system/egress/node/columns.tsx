/* eslint-disable react-refresh/only-export-components */
import type { Column, ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatAbsoluteDateTime } from "@/lib/datetime"
import { translateAdminText, type Locale } from "@/local"
import type { EgressNodeResource, EgressNodeStatus } from "@/types/admin"
import { ResourceTableColumnHeader } from "@/views/system/_components/resource/table"

import { getEgressNodeStatusLabel, getEgressNodeStatusVariant } from "./status"

export function createEgressNodeColumns(
  locale: Locale
): ColumnDef<EgressNodeResource>[] {
  const tt = (text: string) => translateAdminText(locale, text)

  return [
    {
      accessorKey: "status",
      header: ({ column }) => tableHeader(column, tt("状态")),
      cell: ({ row }) => <StatusCell node={row.original} locale={locale} />,
      meta: {
        label: tt("状态"),
        headerClassName: "w-36 min-w-36",
        cellClassName: "w-36 min-w-36",
      },
    },
    {
      accessorKey: "display_name",
      header: ({ column }) => tableHeader(column, tt("节点")),
      cell: ({ row }) => <NodeIdentityCell node={row.original} />,
      meta: { label: tt("节点"), cellClassName: "min-w-44 max-w-56" },
    },
    {
      accessorKey: "domain",
      header: ({ column }) => tableHeader(column, tt("域名与接入点")),
      cell: ({ row }) => <EndpointCell node={row.original} />,
      meta: {
        label: tt("域名与接入点"),
        cellClassName: "min-w-52 max-w-72",
      },
    },
    {
      id: "load",
      accessorFn: (node) => node.load_percent ?? -1,
      header: ({ column }) => tableHeader(column, tt("连接与流负载")),
      cell: ({ row }) => <LoadCell node={row.original} locale={locale} />,
      meta: {
        label: tt("连接与流负载"),
        cellClassName: "min-w-48 max-w-56",
      },
    },
    {
      id: "activity",
      accessorFn: (node) =>
        node.lifecycle === "pending"
          ? node.enrollment_expires_at
          : node.heartbeat_at,
      header: ({ column }) => tableHeader(column, tt("心跳与有效期")),
      cell: ({ row }) => <ActivityCell node={row.original} locale={locale} />,
      meta: { label: tt("心跳与有效期"), cellClassName: "min-w-44" },
    },
  ]
}

function tableHeader<TData, TValue>(
  column: Column<TData, TValue>,
  title: string
) {
  return <ResourceTableColumnHeader column={column} title={title} />
}

function StatusCell({
  node,
  locale,
}: {
  node: EgressNodeResource
  locale: Locale
}) {
  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
          <span
            className={`size-1.5 rounded-full ${
              node.online ? "bg-emerald-500" : "bg-muted-foreground/50"
            }`}
          />
          {translateAdminText(locale, node.online ? "在线" : "离线")}
        </span>
        <StatusBadge status={node.status} locale={locale} />
      </div>
      <Badge variant="outline">
        {translateAdminText(
          locale,
          node.environment === "development" ? "测试环境" : "正式环境"
        )}
      </Badge>
    </div>
  )
}

function StatusBadge({
  status,
  locale,
}: {
  status: EgressNodeStatus
  locale: Locale
}) {
  return (
    <Badge variant={getEgressNodeStatusVariant(status)}>
      {translateAdminText(locale, getEgressNodeStatusLabel(status))}
    </Badge>
  )
}

function NodeIdentityCell({ node }: { node: EgressNodeResource }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate font-medium" title={node.display_name}>
        {node.display_name}
      </span>
      <code
        className="truncate text-xs text-muted-foreground"
        title={node.egress_id}
      >
        {node.egress_id}
      </code>
    </div>
  )
}

function EndpointCell({ node }: { node: EgressNodeResource }) {
  const endpoint = node.public_endpoint || node.domain

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate font-medium" title={node.domain}>
        {node.domain}
      </span>
      <span className="truncate text-xs text-muted-foreground" title={endpoint}>
        {endpoint}
      </span>
    </div>
  )
}

function LoadCell({
  node,
  locale,
}: {
  node: EgressNodeResource
  locale: Locale
}) {
  const tt = (text: string) => translateAdminText(locale, text)
  const connections = node.active_connections
  const streams = node.active_streams
  const load = node.load_percent

  return (
    <div className="flex min-w-0 flex-col gap-1 text-xs">
      <div className="grid grid-cols-2 gap-2 text-muted-foreground">
        <span>
          {tt("连接")} {formatUsage(connections, node.max_connections)}
        </span>
        <span>
          {tt("流")} {formatUsage(streams, node.max_streams)}
        </span>
      </div>
      {load == null ? (
        <span className="text-muted-foreground">{tt("负载未上报")}</span>
      ) : (
        <div className="flex items-center gap-2">
          <Progress value={clampPercent(load)} className="h-1.5 flex-1" />
          <span className="text-muted-foreground tabular-nums">
            {Math.round(load)}%
          </span>
        </div>
      )}
    </div>
  )
}

function ActivityCell({
  node,
  locale,
}: {
  node: EgressNodeResource
  locale: Locale
}) {
  const pending = node.lifecycle === "pending"
  const value = pending ? node.enrollment_expires_at : node.heartbeat_at
  const label = translateAdminText(
    locale,
    pending ? "登记有效期至" : "最近心跳"
  )

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate tabular-nums" title={value ?? undefined}>
        {formatAbsoluteDateTime(value, translateAdminText(locale, "暂无"))}
      </span>
    </div>
  )
}

function formatUsage(value: number | null, maximum: number) {
  return `${value == null ? "—" : value.toLocaleString()} / ${maximum.toLocaleString()}`
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(value, 100))
}
