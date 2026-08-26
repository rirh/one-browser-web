import type { BrowserStatusFilter } from '@/features/browser/components/table-toolbar';

import type { RemotePermissionResource } from './types';

export type PermissionTreeNode = {
  record: RemotePermissionResource;
  children: PermissionTreeNode[];
};

export type PermissionTableRow = {
  record: RemotePermissionResource;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
};

export function buildPermissionTree(
  permissions: RemotePermissionResource[],
): PermissionTreeNode[] {
  const nodeById = new Map<number, PermissionTreeNode>();
  const roots: PermissionTreeNode[] = [];
  permissions.forEach((record) => {
    nodeById.set(record.permission_id, { record, children: [] });
  });
  permissions.forEach((record) => {
    const node = nodeById.get(record.permission_id);
    if (!node) {
      return;
    }
    const parent = record.parent_id
      ? nodeById.get(record.parent_id)
      : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });
  sortPermissionTree(roots);
  return roots;
}

function sortPermissionTree(nodes: PermissionTreeNode[]) {
  nodes.sort((left, right) => comparePermissions(left.record, right.record));
  nodes.forEach((node) => sortPermissionTree(node.children));
}

export function filterPermissionTree(
  tree: PermissionTreeNode[],
  statusFilter: BrowserStatusFilter,
  search: string,
) {
  const statusFiltered =
    statusFilter === 'all'
      ? tree
      : filterTreeStrict(tree, (record) => record.status === statusFilter);
  const keyword = search.trim().toLowerCase();
  if (!keyword) {
    return statusFiltered;
  }
  return filterTreeWithMatchedSubtree(statusFiltered, (record) =>
    [
      record.permission_name,
      record.permission_code ?? '',
      record.path,
      record.remark,
    ].some((value) => value.toLowerCase().includes(keyword)),
  );
}

function filterTreeStrict(
  tree: PermissionTreeNode[],
  matches: (record: RemotePermissionResource) => boolean,
): PermissionTreeNode[] {
  return tree.flatMap((node) => {
    const children = filterTreeStrict(node.children, matches);
    return matches(node.record) || children.length
      ? [{ ...node, children }]
      : [];
  });
}

function filterTreeWithMatchedSubtree(
  tree: PermissionTreeNode[],
  matches: (record: RemotePermissionResource) => boolean,
): PermissionTreeNode[] {
  return tree.flatMap((node) => {
    if (matches(node.record)) {
      return [node];
    }
    const children = filterTreeWithMatchedSubtree(node.children, matches);
    return children.length ? [{ ...node, children }] : [];
  });
}

export function flattenPermissionTree(
  tree: PermissionTreeNode[],
  expandedIds: Set<number>,
  depth = 0,
): PermissionTableRow[] {
  return tree.flatMap((node) => {
    const expanded = expandedIds.has(node.record.permission_id);
    return [
      {
        record: node.record,
        depth,
        hasChildren: node.children.length > 0,
        expanded,
      },
      ...(expanded
        ? flattenPermissionTree(node.children, expandedIds, depth + 1)
        : []),
    ];
  });
}

export function forEachPermissionNode(
  tree: PermissionTreeNode[],
  visit: (node: PermissionTreeNode) => void,
) {
  tree.forEach((node) => {
    visit(node);
    forEachPermissionNode(node.children, visit);
  });
}

export function collapseDescendantTargets(
  targets: RemotePermissionResource[],
  permissions: RemotePermissionResource[],
) {
  const selectedIds = new Set(targets.map((target) => target.permission_id));
  const permissionById = new Map(
    permissions.map((permission) => [permission.permission_id, permission]),
  );
  return targets.filter((target) => {
    const visited = new Set([target.permission_id]);
    let parentId = target.parent_id;
    while (parentId && !visited.has(parentId)) {
      if (selectedIds.has(parentId)) {
        return false;
      }
      visited.add(parentId);
      parentId = permissionById.get(parentId)?.parent_id ?? null;
    }
    return true;
  });
}

function comparePermissions(
  left: RemotePermissionResource,
  right: RemotePermissionResource,
) {
  return (
    left.order_num - right.order_num || left.permission_id - right.permission_id
  );
}
