import {
  CirclePlayIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TerminalIcon,
  Trash2Icon,
  UnplugIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { translateAdminText, type Locale } from "@/local"
import type { EgressNodeResource, EgressNodeStatusUpdate } from "@/types/admin"

export type EgressNodeAction =
  | { kind: "delete"; node: EgressNodeResource }
  | {
      kind: "status"
      node: EgressNodeResource
      status: EgressNodeStatusUpdate
    }

export function EgressNodeRowActions({
  node,
  locale,
  disabled,
  canEnroll,
  canUpdate,
  canDelete,
  onEnroll,
  onEdit,
  onAction,
}: {
  node: EgressNodeResource
  locale: Locale
  disabled?: boolean
  canEnroll: boolean
  canUpdate: boolean
  canDelete: boolean
  onEnroll: (node: EgressNodeResource) => void
  onEdit: (node: EgressNodeResource) => void
  onAction: (action: EgressNodeAction) => void
}) {
  const tt = (text: string) => translateAdminText(locale, text)
  const pending = node.lifecycle === "pending"
  const disabledNode = node.status === "disabled" || node.enabled === false
  const draining = node.status === "draining" || node.draining === true

  if (!canUpdate && !canDelete && !(canEnroll && pending)) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          aria-label={`${tt("节点操作")}：${node.display_name}`}
        >
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{tt("节点操作")}</DropdownMenuLabel>
          {canEnroll && pending ? (
            <DropdownMenuItem onSelect={() => onEnroll(node)}>
              <TerminalIcon />
              {tt("接入命令")}
            </DropdownMenuItem>
          ) : null}
          {canUpdate ? (
            <DropdownMenuItem onSelect={() => onEdit(node)}>
              <PencilIcon />
              {tt("修改节点")}
            </DropdownMenuItem>
          ) : null}
          {canUpdate && !pending ? (
            disabledNode || draining ? (
              <DropdownMenuItem
                onSelect={() =>
                  onAction({ kind: "status", node, status: "enabled" })
                }
              >
                <CirclePlayIcon />
                {tt(disabledNode ? "启用节点" : "恢复接入")}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onSelect={() =>
                  onAction({ kind: "status", node, status: "draining" })
                }
              >
                <UnplugIcon />
                {tt("排空连接")}
              </DropdownMenuItem>
            )
          ) : null}
          {canDelete ? (
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onAction({ kind: "delete", node })}
            >
              <Trash2Icon />
              {tt("删除节点")}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
