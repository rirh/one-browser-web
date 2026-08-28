import type { BrowserTableRowReorderEvent } from '../../components/data-table';
import type {
  RemotePermissionOrderUpdate,
  RemotePermissionResource,
} from './types';

type PermissionOrderRow = {
  record: RemotePermissionResource;
};

export function buildPermissionOrderUpdates(
  event: BrowserTableRowReorderEvent<PermissionOrderRow>,
): RemotePermissionOrderUpdate[] | null {
  const rows = event.orderedRecords.map((row) => row.record);
  const recordById = new Map(
    rows.map((record) => [record.permission_id, record]),
  );
  const target = findSiblingTarget(
    event.active.record,
    event.over.record,
    recordById,
  );
  if (!target) {
    return null;
  }

  const siblings = rows
    .filter((record) => record.parent_id === event.active.record.parent_id)
    .sort(comparePermissions);
  const activeIndex = siblings.findIndex(
    (record) => record.permission_id === event.active.record.permission_id,
  );
  const targetIndex = siblings.findIndex(
    (record) => record.permission_id === target.permission_id,
  );
  if (activeIndex < 0 || targetIndex < 0) {
    return null;
  }
  const [active] = siblings.splice(activeIndex, 1);
  siblings.splice(targetIndex, 0, active);
  const nextOrderNums = siblings
    .map((record) => record.order_num)
    .sort((left, right) => left - right);

  return siblings
    .map((record, index) => ({
      record,
      order_num: nextOrderNums[index] ?? index + 1,
    }))
    .filter(({ record, order_num }) => record.order_num !== order_num);
}

function findSiblingTarget(
  active: RemotePermissionResource,
  over: RemotePermissionResource,
  recordById: Map<number, RemotePermissionResource>,
) {
  let target: RemotePermissionResource | undefined = over;
  while (target && target.parent_id !== active.parent_id) {
    target = target.parent_id ? recordById.get(target.parent_id) : undefined;
  }
  return target;
}

function comparePermissions(
  left: RemotePermissionResource,
  right: RemotePermissionResource,
) {
  return (
    left.order_num - right.order_num || left.permission_id - right.permission_id
  );
}
