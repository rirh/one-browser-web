import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CopyIcon, TriangleAlertIcon } from "lucide-react"
import { toast } from "sonner"

import {
  EGRESS_NODE_EVENTS_PATH,
  cancelEgressEnrollment,
  deleteEgressNode,
  getEgressUninstallCommand,
  listEgressNodes,
  updateEgressNodeStatus,
} from "@/api/system/egress-nodes"
import { useTranslation } from "@/components/providers/language-context"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  AlertDialogActionButton,
  AlertDialogCancelButton,
} from "@/components/ui/dialog-action-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuthPermissions } from "@/hooks/use-auth"
import { hasPermission } from "@/lib/auth-permissions"
import { systemQueryKeys } from "@/lib/query-keys"
import { useSse, type SseStatus } from "@/lib/sse"
import { cn } from "@/lib/utils"
import { translateAdminText } from "@/local"
import type {
  EgressNodeEvent,
  EgressNodeListParams,
  EgressNodePageResponse,
  EgressNodeResource,
  EgressNodeStatus,
} from "@/types/admin"
import { useDebouncedValue } from "@/views/system/_components/resource/manager-utils"
import { ResourceTable } from "@/views/system/_components/resource/table"
import { showResourceError } from "@/views/system/_components/resource/toast"
import { ResourceToolbarActions } from "@/views/system/_components/resource/toolbar-actions"

import { createEgressNodeColumns } from "./columns"
import { CreateEgressNodeDialog } from "./create-dialog"
import { EgressNodeRowActions, type EgressNodeAction } from "./row-actions"
import { getEgressNodeStatusLabel, getEgressNodeStatusVariant } from "./status"

type StatusFilter = "all" | EgressNodeStatus

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "全部状态" },
  { value: "pending", label: "待接入" },
  { value: "installing", label: "安装中" },
  { value: "expired", label: "已过期" },
  { value: "init", label: "初始化" },
  { value: "healthy", label: "健康" },
  { value: "degraded", label: "降级" },
  { value: "draining", label: "排空中" },
  { value: "unhealthy", label: "异常" },
  { value: "disabled", label: "已禁用" },
]

export default function EgressNodePage() {
  const { locale } = useTranslation()
  const tt = (text: string) => translateAdminText(locale, text)
  const queryClient = useQueryClient()
  const authPermissions = useAuthPermissions()
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebouncedValue(search, 300)
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editingNode, setEditingNode] =
    React.useState<EgressNodeResource | null>(null)
  const [nodeDialogMode, setNodeDialogMode] = React.useState<"edit" | "enroll">(
    "edit"
  )
  const [pendingAction, setPendingAction] =
    React.useState<EgressNodeAction | null>(null)
  const canList = hasPermission(authPermissions.data, "system:egress:list")
  const canCreate = hasPermission(authPermissions.data, "system:egress:create")
  const canUpdate = hasPermission(authPermissions.data, "system:egress:update")
  const canDelete = hasPermission(authPermissions.data, "system:egress:delete")
  const params = React.useMemo<EgressNodeListParams>(
    () => ({
      page: pageIndex + 1,
      page_size: pageSize,
      keyword: debouncedSearch || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
    }),
    [debouncedSearch, pageIndex, pageSize, statusFilter]
  )
  const listQueryKey = React.useMemo(
    () => [...systemQueryKeys.egressNodes, params] as const,
    [params]
  )
  const query = useQuery({
    queryKey: listQueryKey,
    queryFn: () => listEgressNodes(params),
    enabled: authPermissions.isSuccess && canList,
    placeholderData: (previousData) => previousData,
  })
  const invalidateTimerRef = React.useRef<ReturnType<
    typeof window.setTimeout
  > | null>(null)
  const scheduleNodesInvalidate = React.useCallback(() => {
    if (invalidateTimerRef.current !== null) {
      return
    }

    invalidateTimerRef.current = window.setTimeout(() => {
      invalidateTimerRef.current = null
      void queryClient.invalidateQueries({
        queryKey: systemQueryKeys.egressNodes,
        refetchType: "active",
      })
    }, 300)
  }, [queryClient])
  React.useEffect(
    () => () => {
      if (invalidateTimerRef.current !== null) {
        window.clearTimeout(invalidateTimerRef.current)
      }
    },
    []
  )
  const handleNodeEvent = React.useCallback(
    (event: EgressNodeEvent) => {
      queryClient.setQueriesData<EgressNodePageResponse>(
        { queryKey: systemQueryKeys.egressNodes },
        (current) => updateNodePage(current, event)
      )
      setPendingAction((current) => {
        if (!current || current.node.egress_id !== event.egress_id) {
          return current
        }
        return event.kind === "remove"
          ? null
          : {
              ...current,
              node: event.node,
            }
      })
      scheduleNodesInvalidate()
    },
    [queryClient, scheduleNodesInvalidate]
  )
  const nodeStream = useSse<EgressNodeEvent>({
    path: EGRESS_NODE_EVENTS_PATH,
    eventName: "egress-node",
    enabled: authPermissions.isSuccess && canList,
    onMessage: handleNodeEvent,
  })
  const records = React.useMemo(
    () => query.data?.list ?? [],
    [query.data?.list]
  )
  const columns = React.useMemo(() => createEgressNodeColumns(locale), [locale])
  const actionMutation = useMutation({
    mutationFn: async (action: EgressNodeAction) => {
      if (action.kind === "delete") {
        if (action.node.lifecycle === "pending") {
          await cancelEgressEnrollment(action.node.egress_id)
        } else {
          await deleteEgressNode(action.node.egress_id)
        }
        return
      }

      await updateEgressNodeStatus(action.node.egress_id, action.status)
    },
    onSuccess: async (_, action) => {
      await queryClient.invalidateQueries({
        queryKey: systemQueryKeys.egressNodes,
      })
      toast.success(
        tt(action.kind === "delete" ? "节点已删除" : "节点状态已更新"),
        {
          description: `${action.node.display_name} · ${action.node.egress_id}`,
        }
      )
      setPendingAction(null)
    },
    onError: (error) => showResourceError(error, locale),
  })
  const hasActiveFilters = search.trim().length > 0 || statusFilter !== "all"
  const permissionError =
    authPermissions.isSuccess && !canList
      ? new Error(tt("当前账号没有节点列表权限。"))
      : authPermissions.error
  const canOpenCreate = canCreate && query.isSuccess

  async function handleRefresh() {
    const result = await query.refetch()
    if (result.isError) {
      showResourceError(result.error, locale)
      return
    }
    toast.success(tt("节点列表已刷新"), {
      description: tt("已获取服务器最新的节点状态。"),
    })
  }

  return (
    <>
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <ResourceTable
          data={records}
          columns={columns}
          columnVisibilityResetKey="egress-nodes"
          totalRows={query.data?.total ?? 0}
          pageIndex={pageIndex}
          pageSize={pageSize}
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPageIndex(0)
          }}
          onPageIndexChange={setPageIndex}
          onPageSizeChange={(value) => {
            setPageSize(value)
            setPageIndex(0)
          }}
          isLoading={authPermissions.isLoading || (canList && query.isLoading)}
          isFetching={query.isFetching}
          error={permissionError ?? query.error}
          searchPlaceholder={tt("搜索节点名称、ID、地址...")}
          emptyTitle={tt("暂无节点")}
          emptyDescription={tt("当前还没有已接入或待接入的出口节点。")}
          emptyActionLabel={canOpenCreate ? tt("新增节点") : undefined}
          onEmptyAction={canOpenCreate ? () => setCreateOpen(true) : undefined}
          isFiltered={hasActiveFilters}
          getRowId={(row, index) => row.egress_id || String(index)}
          selectionResetKey={`${statusFilter}:${debouncedSearch}`}
          density="compact"
          toolbarLeading={
            canList ? (
              <div className="flex items-center gap-2">
                <NodeStatusFilter
                  locale={locale}
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value)
                    setPageIndex(0)
                  }}
                />
                <NodeStreamStatus
                  locale={locale}
                  status={nodeStream.status}
                  error={nodeStream.error}
                />
              </div>
            ) : undefined
          }
          toolbarActions={
            canList ? (
              <ResourceToolbarActions
                isRefreshing={query.isFetching}
                onRefresh={handleRefresh}
                onCreate={canOpenCreate ? () => setCreateOpen(true) : undefined}
              />
            ) : undefined
          }
          renderRowActions={
            canCreate || canUpdate || canDelete
              ? (node) => (
                  <EgressNodeRowActions
                    node={node}
                    locale={locale}
                    disabled={actionMutation.isPending}
                    canEnroll={canCreate}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onEnroll={(selectedNode) => {
                      setEditingNode(selectedNode)
                      setNodeDialogMode("enroll")
                      setCreateOpen(true)
                    }}
                    onEdit={(selectedNode) => {
                      setEditingNode(selectedNode)
                      setNodeDialogMode("edit")
                      setCreateOpen(true)
                    }}
                    onAction={setPendingAction}
                  />
                )
              : undefined
          }
        />
      </div>

      <CreateEgressNodeDialog
        open={createOpen}
        editingNode={editingNode}
        mode={nodeDialogMode}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) {
            setEditingNode(null)
            setNodeDialogMode("edit")
          }
        }}
      />

      <NodeActionDialog
        action={pendingAction}
        pending={actionMutation.isPending}
        locale={locale}
        onOpenChange={(open) => {
          if (!open && !actionMutation.isPending) {
            setPendingAction(null)
          }
        }}
        onConfirm={() => {
          if (pendingAction) {
            actionMutation.mutate(pendingAction)
          }
        }}
      />
    </>
  )
}

function updateNodePage(
  current: EgressNodePageResponse | undefined,
  event: EgressNodeEvent
) {
  if (!current || !Array.isArray(current.list)) {
    return current
  }

  const nodeIndex = current.list.findIndex(
    (node) => node.egress_id === event.egress_id
  )
  if (nodeIndex < 0) {
    return current
  }

  if (event.kind === "remove") {
    return {
      ...current,
      list: current.list.filter((node) => node.egress_id !== event.egress_id),
      total: Math.max(0, current.total - 1),
    }
  }

  const list = [...current.list]
  list[nodeIndex] = event.node
  return { ...current, list }
}

function NodeStreamStatus({
  locale,
  status,
  error,
}: {
  locale: Parameters<typeof translateAdminText>[0]
  status: SseStatus
  error: string | null
}) {
  const labels: Record<SseStatus, string> = {
    connecting: "正在连接实时状态",
    open: "节点状态实时更新",
    error: "实时状态已断开，正在重连",
    closed: "实时状态已关闭",
  }
  const label = translateAdminText(locale, labels[status])

  return (
    <span
      className="inline-flex h-8 items-center gap-1.5 rounded-md border px-2 text-xs text-muted-foreground"
      title={error ?? label}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "open" && "bg-emerald-500",
          status === "connecting" && "animate-pulse bg-amber-500",
          (status === "error" || status === "closed") && "bg-destructive"
        )}
      />
      {label}
    </span>
  )
}

function NodeStatusFilter({
  locale,
  value,
  onValueChange,
}: {
  locale: Parameters<typeof translateAdminText>[0]
  value: StatusFilter
  onValueChange: (value: StatusFilter) => void
}) {
  const label = translateAdminText(locale, "节点状态筛选")

  return (
    <Select
      value={value}
      onValueChange={(next) => onValueChange(next as StatusFilter)}
    >
      <SelectTrigger size="sm" className="w-full sm:w-36" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup>
          {STATUS_FILTERS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {translateAdminText(locale, option.label)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function NodeActionDialog({
  action,
  pending,
  locale,
  onOpenChange,
  onConfirm,
}: {
  action: EgressNodeAction | null
  pending: boolean
  locale: Parameters<typeof translateAdminText>[0]
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  const tt = (text: string) => translateAdminText(locale, text)
  const label = action ? getActionLabel(action) : "确认"
  const destructive = action?.kind === "delete"
  const uninstallCommandQuery = useQuery({
    queryKey: systemQueryKeys.egressUninstallCommand,
    queryFn: getEgressUninstallCommand,
    enabled: destructive,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  })
  const uninstallCommand = uninstallCommandQuery.data?.uninstall_command

  async function copyUninstallCommand() {
    if (!uninstallCommand) {
      return
    }
    try {
      await navigator.clipboard.writeText(uninstallCommand)
      toast.success(tt("卸载脚本已复制"))
    } catch {
      toast.error(tt("复制失败，请手动选择命令复制。"))
    }
  }

  return (
    <AlertDialog open={Boolean(action)} onOpenChange={onOpenChange}>
      <AlertDialogContent
        className={
          destructive
            ? "w-[calc(100%_-_2rem)] grid-cols-[minmax(0,1fr)] gap-3 overflow-hidden data-[size=default]:max-w-[34rem] sm:data-[size=default]:max-w-xl"
            : undefined
        }
      >
        <AlertDialogHeader
          className={
            destructive
              ? "min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] grid-rows-[auto_auto] items-start gap-x-3 gap-y-0.5 text-left sm:grid-cols-[2.25rem_minmax(0,1fr)] sm:grid-rows-[auto_auto]"
              : undefined
          }
        >
          <AlertDialogMedia
            className={
              destructive
                ? "col-start-1 row-span-2 row-start-1 mb-0 size-9 bg-destructive/10 text-destructive *:[svg:not([class*='size-'])]:size-5"
                : undefined
            }
          >
            <TriangleAlertIcon />
          </AlertDialogMedia>
          <AlertDialogTitle
            className={
              destructive ? "col-start-2 row-start-1 min-w-0" : undefined
            }
          >
            {tt(label)}
          </AlertDialogTitle>
          <AlertDialogDescription
            className={
              destructive
                ? "col-start-2 row-start-2 min-w-0 leading-5"
                : undefined
            }
          >
            {action ? tt(getActionDescription(action)) : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {destructive && action ? (
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2">
              <div className="min-w-0">
                <div
                  className="truncate text-sm font-medium"
                  title={action.node.display_name}
                >
                  {action.node.display_name}
                </div>
                <code
                  className="block truncate text-xs text-muted-foreground"
                  title={action.node.egress_id}
                >
                  {action.node.egress_id}
                </code>
              </div>
              <div
                className="flex shrink-0 items-center gap-2"
                aria-live="polite"
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      action.node.online
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/50"
                    )}
                  />
                  {tt(action.node.online ? "在线" : "离线")}
                </span>
                <Badge variant={getEgressNodeStatusVariant(action.node.status)}>
                  {tt(getEgressNodeStatusLabel(action.node.status))}
                </Badge>
              </div>
            </div>

            <section className="min-w-0 overflow-hidden rounded-lg border">
              <div className="flex items-center justify-between gap-3 bg-muted/20 px-3 py-2.5">
                <div className="min-w-0">
                  <div className="text-sm font-medium">
                    {tt("一键卸载脚本")}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {tt("先在节点服务器执行卸载，再删除平台中的节点记录。")}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 bg-background"
                  disabled={!uninstallCommand}
                  onClick={copyUninstallCommand}
                >
                  <CopyIcon data-icon="inline-start" />
                  {tt("复制脚本")}
                </Button>
              </div>
              <pre className="max-h-24 min-h-16 max-w-full min-w-0 overflow-auto border-t bg-muted/10 px-3 py-2 font-mono text-[11px] leading-5 break-words whitespace-pre-wrap select-all">
                <code>
                  {uninstallCommandQuery.isLoading
                    ? tt("正在获取卸载脚本...")
                    : uninstallCommandQuery.isError
                      ? tt("卸载脚本获取失败，仍可继续删除节点记录。")
                      : uninstallCommand}
                </code>
              </pre>
            </section>
          </div>
        ) : null}
        <AlertDialogFooter className={destructive ? "mt-1" : undefined}>
          <AlertDialogCancelButton disabled={pending}>
            {tt("取消")}
          </AlertDialogCancelButton>
          <AlertDialogActionButton
            variant={destructive ? "destructive" : undefined}
            disabled={pending}
            loading={pending}
            loadingText={tt(label)}
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
          >
            {tt(label)}
          </AlertDialogActionButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function getActionLabel(action: EgressNodeAction) {
  if (action.kind === "delete") {
    return "删除节点"
  }
  if (action.status === "draining") {
    return "排空连接"
  }
  return action.node.status === "disabled" ? "启用节点" : "恢复接入"
}

function getActionDescription(action: EgressNodeAction) {
  if (action.kind === "delete") {
    return action.node.lifecycle === "pending"
      ? "如目标机器已有残留安装，请先执行卸载脚本；删除后当前一次性安装命令立即失效。"
      : "请先执行卸载脚本清理节点服务；仅未被环境分配、活动运行时或连接占用的节点可以删除。"
  }
  if (action.status === "draining") {
    return "排空后节点不再接收新的环境分配；已分配环境和现有连接会继续使用。"
  }
  return action.node.status === "disabled"
    ? "启用后节点可以重新接收连接，并退出排空状态。"
    : "恢复后节点可以重新接收连接。"
}
