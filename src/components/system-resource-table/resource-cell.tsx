import { Badge } from '@/components/ui/badge';
import type { SystemRecord } from './types';

export function renderResourceCell(
  field: string,
  value: unknown,
  record: SystemRecord,
) {
  if (field === 'status') return <StatusBadge status={value} />;
  if (field === 'user_name')
    return (
      <IdentityCell
        primary={record.nick_name || value}
        secondary={`@${formatValue(value)}`}
      />
    );
  if (field === 'role_name')
    return <IdentityCell primary={value} secondary={record.role_key} />;
  if (field === 'menu_name') {
    return (
      <div className="flex min-w-44 items-center gap-2">
        <Badge variant="outline">{permissionTypeLabel(record.menu_type)}</Badge>
        <span className="truncate font-medium">{formatValue(value)}</span>
      </div>
    );
  }
  const formatted = formatValue(value);
  return (
    <span
      className="text-muted-foreground block max-w-64 truncate text-xs"
      title={formatted}
    >
      {formatted}
    </span>
  );
}

export function filterByStatus(
  records: SystemRecord[],
  filter: 'all' | 'enabled' | 'disabled',
) {
  if (filter === 'all') return records;
  return records.filter((record) =>
    filter === 'enabled' ? isEnabled(record.status) : !isEnabled(record.status),
  );
}

function IdentityCell({
  primary,
  secondary,
}: {
  primary: unknown;
  secondary: unknown;
}) {
  return (
    <div className="min-w-40">
      <p className="truncate font-medium">{formatValue(primary)}</p>
      <code className="text-muted-foreground text-xs">
        {formatValue(secondary)}
      </code>
    </div>
  );
}

function StatusBadge({ status }: { status: unknown }) {
  const enabled = isEnabled(status);
  const value = String(status ?? '').toLowerCase();
  return (
    <Badge variant={enabled ? 'success' : 'secondary'}>
      {enabled
        ? '启用'
        : value === '1' || value === 'disabled'
          ? '停用'
          : formatValue(status)}
    </Badge>
  );
}

function isEnabled(status: unknown) {
  return ['0', 'active', 'success', 'ok', 'healthy', 'online'].includes(
    String(status ?? '').toLowerCase(),
  );
}

function permissionTypeLabel(value: unknown) {
  return value === 'M'
    ? '目录'
    : value === 'C'
      ? '菜单'
      : value === 'F'
        ? '按钮'
        : '权限';
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
