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
  if (event.active.record.parent_id !== event.over.record.parent_id) {
    return null;
  }

  const siblings = event.orderedRecords
    .map((row) => row.record)
    .filter((record) => record.parent_id === event.active.record.parent_id);
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
