import type { RemotePermissionResource, RemotePermissionType } from '../types';

export function resolveInitialPermissionType(
  record?: RemotePermissionResource | null,
  parent?: RemotePermissionResource | null,
): RemotePermissionType {
  if (record) {
    return record.permission_type;
  }
  if (parent?.permission_type === 'M') {
    return 'C';
  }
  if (parent?.permission_type === 'C') {
    return 'F';
  }
  return 'M';
}

export function parentTypeFor(
  type: RemotePermissionType,
): RemotePermissionType {
  return type === 'F' ? 'C' : 'M';
}

export function collectDescendantIds(
  permissions: RemotePermissionResource[],
  permissionId: number,
) {
  const childrenByParent = new Map<number, number[]>();
  permissions.forEach((permission) => {
    if (!permission.parent_id) {
      return;
    }
    const siblings = childrenByParent.get(permission.parent_id) ?? [];
    siblings.push(permission.permission_id);
    childrenByParent.set(permission.parent_id, siblings);
  });

  const descendants = new Set<number>();
  const pending = [...(childrenByParent.get(permissionId) ?? [])];
  while (pending.length) {
    const descendantId = pending.pop();
    if (!descendantId || descendants.has(descendantId)) {
      continue;
    }
    descendants.add(descendantId);
    pending.push(...(childrenByParent.get(descendantId) ?? []));
  }
  return descendants;
}

export function permissionBreadcrumb(
  permission: RemotePermissionResource,
  permissions: RemotePermissionResource[],
) {
  const permissionById = new Map(
    permissions.map((item) => [item.permission_id, item] as const),
  );
  const names = [permission.permission_name];
  const visited = new Set([permission.permission_id]);
  let parentId = permission.parent_id;
  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);
    const parent = permissionById.get(parentId);
    if (!parent) {
      break;
    }
    names.unshift(parent.permission_name);
    parentId = parent.parent_id;
  }
  return names.join(' / ');
}

export function comparePermissions(
  left: RemotePermissionResource,
  right: RemotePermissionResource,
) {
  return (
    left.order_num - right.order_num || left.permission_id - right.permission_id
  );
}
