import { Badge } from '@/components/ui/badge';

import type { ProxyCheckStatus, RuntimeStatus } from '../contracts';

const runtimeLabels: Record<RuntimeStatus, string> = {
  inactive: '未运行',
  starting: '启动中',
  active: '运行中',
  stopping: '停止中',
  error: '异常',
};

const proxyLabels: Record<ProxyCheckStatus, string> = {
  unchecked: '未检测',
  checking: '检测中',
  ok: '正常',
  blocked: '受阻',
  error: '异常',
};

export function RuntimeStatusBadge({ status }: { status: RuntimeStatus }) {
  return (
    <Badge
      variant={
        status === 'active'
          ? 'default'
          : status === 'error'
            ? 'destructive'
            : 'secondary'
      }
    >
      {runtimeLabels[status]}
    </Badge>
  );
}

export function ProxyStatusBadge({ status }: { status: ProxyCheckStatus }) {
  return (
    <Badge
      variant={
        status === 'ok'
          ? 'success'
          : status === 'error'
            ? 'destructive'
            : 'outline'
      }
    >
      {proxyLabels[status]}
    </Badge>
  );
}
