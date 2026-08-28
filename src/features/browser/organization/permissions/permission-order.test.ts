import { describe, expect, it } from 'vitest';

import type { RemotePermissionResource } from './types';
import { buildPermissionOrderUpdates } from './permission-order';

describe('buildPermissionOrderUpdates', () => {
  it('sorts siblings when the drop target is a sibling descendant', () => {
    const first = permission(1, null, 1);
    const firstChild = permission(2, 1, 1);
    const second = permission(3, null, 2);
    const secondChild = permission(4, 3, 1);

    expect(
      buildPermissionOrderUpdates({
        active: row(first),
        over: row(secondChild),
        orderedRecords: [
          row(firstChild),
          row(second),
          row(secondChild),
          row(first),
        ],
      }),
    ).toEqual([
      { record: second, order_num: 1 },
      { record: first, order_num: 2 },
    ]);
  });

  it('moves a lower sibling before the ancestor of its drop target', () => {
    const first = permission(1, null, 1);
    const firstChild = permission(2, 1, 1);
    const second = permission(3, null, 2);

    expect(
      buildPermissionOrderUpdates({
        active: row(second),
        over: row(firstChild),
        orderedRecords: [row(first), row(second), row(firstChild)],
      }),
    ).toEqual([
      { record: second, order_num: 1 },
      { record: first, order_num: 2 },
    ]);
  });

  it('rejects a drop outside the active permission level', () => {
    const parent = permission(1, null, 1);
    const child = permission(2, 1, 1);
    const otherParent = permission(3, null, 2);

    expect(
      buildPermissionOrderUpdates({
        active: row(child),
        over: row(otherParent),
        orderedRecords: [row(parent), row(child), row(otherParent)],
      }),
    ).toBeNull();
  });
});

function row(record: RemotePermissionResource) {
  return { record };
}

function permission(
  permission_id: number,
  parent_id: number | null,
  order_num: number,
): RemotePermissionResource {
  return {
    permission_id,
    permission_name: `Permission ${permission_id}`,
    parent_id,
    order_num,
    path: '',
    permission_type: 'M',
    permission_scope: 'G',
    visible: '0',
    status: '0',
    permission_code: null,
    icon: '#',
    created_at: '',
    updated_at: null,
    remark: '',
    locked: false,
  };
}
