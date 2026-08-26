import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowDown01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as React from 'react';

import type { RemoteMemberPermissionOptionResource } from '../types';

type CheckedState = boolean | 'indeterminate';

export type PermissionTreeNode = {
  option: RemoteMemberPermissionOptionResource;
  children: PermissionTreeNode[];
};

export function TreeControl({
  label,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string;
  checked: CheckedState;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const id = React.useId();

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-1.5 has-disabled:cursor-not-allowed has-disabled:text-muted-foreground"
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <span>{label}</span>
    </label>
  );
}

export function PermissionTreeItem({
  node,
  depth,
  selectedPermissions,
  expandedIds,
  disabled,
  linked,
  selectablePermissionCodes,
  onToggleNode,
  onToggleExpanded,
}: {
  node: PermissionTreeNode;
  depth: number;
  selectedPermissions: Set<string>;
  expandedIds: Set<number>;
  disabled: boolean;
  linked: boolean;
  selectablePermissionCodes: Set<string>;
  onToggleNode: (node: PermissionTreeNode, checked: boolean) => void;
  onToggleExpanded: (menuId: number) => void;
}) {
  const hasChildren = node.children.length > 0;
  const expanded = expandedIds.has(node.option.menu_id);
  const checked = getNodeCheckedState(
    node,
    selectedPermissions,
    selectablePermissionCodes,
    linked,
  );
  const canToggle = linked
    ? collectNodePermissionCodes(node).some((permission) =>
        selectablePermissionCodes.has(permission),
      )
    : Boolean(
        node.option.permission_code &&
        selectablePermissionCodes.has(node.option.permission_code),
      );
  const isInactive = node.option.status === '1';
  const inputId = React.useId();

  return (
    <div>
      <div
        className="flex min-h-7 items-center gap-1.5 rounded-md pr-2 text-xs hover:bg-muted/70"
        style={{ paddingLeft: 4 + depth * 16 }}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={!hasChildren}
          aria-label={expanded ? '收起权限节点' : '展开权限节点'}
          onClick={() => onToggleExpanded(node.option.menu_id)}
        >
          {hasChildren ? (
            <HugeiconsIcon
              icon={expanded ? ArrowDown01Icon : ArrowRight01Icon}
              strokeWidth={2}
            />
          ) : null}
        </Button>
        <Checkbox
          id={inputId}
          checked={checked}
          disabled={disabled || !canToggle}
          onCheckedChange={(value) => onToggleNode(node, value === true)}
        />
        <label
          htmlFor={inputId}
          className={cn(
            'flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 py-1',
            disabled && 'cursor-not-allowed text-muted-foreground',
            isInactive && 'text-muted-foreground',
          )}
        >
          <span className="truncate">{node.option.name}</span>
          <Badge variant="outline" className="h-4 px-1.5">
            {permissionTypeLabel(node.option.menu_type)}
          </Badge>
          {isInactive ? (
            <Badge variant="destructive" className="h-4 px-1.5">
              停用
            </Badge>
          ) : null}
        </label>
      </div>
      {hasChildren && expanded
        ? node.children.map((child) => (
            <PermissionTreeItem
              key={child.option.menu_id}
              node={child}
              depth={depth + 1}
              selectedPermissions={selectedPermissions}
              expandedIds={expandedIds}
              disabled={disabled}
              linked={linked}
              selectablePermissionCodes={selectablePermissionCodes}
              onToggleNode={onToggleNode}
              onToggleExpanded={onToggleExpanded}
            />
          ))
        : null}
    </div>
  );
}

export function PermissionTreeSkeleton() {
  return (
    <div className="space-y-1 py-1">
      {Array.from({ length: 7 }, (_, index) => (
        <div
          key={index}
          className="flex h-7 items-center gap-2 px-2"
          style={{ paddingLeft: 8 + (index % 3) * 16 }}
        >
          <Skeleton className="size-4" />
          <Skeleton className="size-3.5" />
          <Skeleton className="h-3.5 w-28" />
        </div>
      ))}
    </div>
  );
}

export function buildPermissionTree(
  options: RemoteMemberPermissionOptionResource[],
) {
  const nodeMap = new Map<number, PermissionTreeNode>();
  const roots: PermissionTreeNode[] = [];

  options.forEach((option) => {
    nodeMap.set(option.menu_id, { option, children: [] });
  });
  options.forEach((option) => {
    const node = nodeMap.get(option.menu_id);
    if (!node) {
      return;
    }
    if (option.parent_id && nodeMap.has(option.parent_id)) {
      nodeMap.get(option.parent_id)?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  sortPermissionTree(roots);
  return roots;
}

function sortPermissionTree(nodes: PermissionTreeNode[]) {
  nodes.sort((left, right) => {
    if (left.option.order_num !== right.option.order_num) {
      return left.option.order_num - right.option.order_num;
    }
    return left.option.menu_id - right.option.menu_id;
  });
  nodes.forEach((node) => sortPermissionTree(node.children));
}

export function buildNodeMap(tree: PermissionTreeNode[]) {
  const nodeById = new Map<number, PermissionTreeNode>();
  forEachTreeNode(tree, (node) => {
    nodeById.set(node.option.menu_id, node);
  });
  return nodeById;
}

export function buildParentMap(
  options: RemoteMemberPermissionOptionResource[],
) {
  const parentById = new Map<number, number>();
  options.forEach((option) => {
    if (option.parent_id) {
      parentById.set(option.menu_id, option.parent_id);
    }
  });
  return parentById;
}

export function collectNodePermissionCodes(node: PermissionTreeNode): string[] {
  return [
    ...(node.option.permission_code ? [node.option.permission_code] : []),
    ...node.children.flatMap((child) => collectNodePermissionCodes(child)),
  ];
}

function getNodeCheckedState(
  node: PermissionTreeNode,
  selectedPermissions: Set<string>,
  selectablePermissionCodes: Set<string>,
  linked: boolean,
): CheckedState {
  if (!linked) {
    return Boolean(
      node.option.permission_code &&
      selectablePermissionCodes.has(node.option.permission_code) &&
      selectedPermissions.has(node.option.permission_code),
    );
  }

  const permissions = collectNodePermissionCodes(node).filter((permission) =>
    selectablePermissionCodes.has(permission),
  );
  if (!permissions.length) {
    return false;
  }
  const selectedCount = permissions.filter((permission) =>
    selectedPermissions.has(permission),
  ).length;
  if (selectedCount === permissions.length) {
    return true;
  }
  return selectedCount > 0 ? 'indeterminate' : false;
}

export function getAncestorIds(
  menuId: number,
  parentById: Map<number, number>,
) {
  const ancestorIds: number[] = [];
  let parentId = parentById.get(menuId);
  while (parentId) {
    ancestorIds.push(parentId);
    parentId = parentById.get(parentId);
  }
  return ancestorIds;
}

export function normalizeLinkedSelection(
  selectedPermissions: Set<string>,
  tree: PermissionTreeNode[],
  parentById: Map<number, number>,
  nodeById: Map<number, PermissionTreeNode>,
  selectablePermissionCodes: Set<string>,
) {
  const next = new Set(selectedPermissions);
  forEachTreeNode(tree, (node) => {
    const permission = node.option.permission_code;
    if (!permission || !selectedPermissions.has(permission)) {
      return;
    }
    collectNodePermissionCodes(node)
      .filter((code) => selectablePermissionCodes.has(code))
      .forEach((code) => next.add(code));
    getAncestorIds(node.option.menu_id, parentById).forEach((menuId) => {
      const ancestorPermission = nodeById.get(menuId)?.option.permission_code;
      if (
        ancestorPermission &&
        selectablePermissionCodes.has(ancestorPermission)
      ) {
        next.add(ancestorPermission);
      }
    });
  });
  return next;
}

export function removeEmptyAncestorPermissions(
  selectedPermissions: Set<string>,
  menuId: number,
  parentById: Map<number, number>,
  nodeById: Map<number, PermissionTreeNode>,
) {
  getAncestorIds(menuId, parentById).forEach((ancestorId) => {
    const ancestor = nodeById.get(ancestorId);
    const ancestorPermission = ancestor?.option.permission_code;
    if (!ancestor || !ancestorPermission) {
      return;
    }
    const hasSelectedDescendant = ancestor.children.some((child) =>
      collectNodePermissionCodes(child).some((permission) =>
        selectedPermissions.has(permission),
      ),
    );
    if (!hasSelectedDescendant) {
      selectedPermissions.delete(ancestorPermission);
    }
  });
}

function forEachTreeNode(
  tree: PermissionTreeNode[],
  visit: (node: PermissionTreeNode) => void,
) {
  tree.forEach((node) => {
    visit(node);
    forEachTreeNode(node.children, visit);
  });
}

function permissionTypeLabel(type: string) {
  if (type === 'M') {
    return '目录';
  }
  if (type === 'C') {
    return '菜单';
  }
  return '按钮';
}
