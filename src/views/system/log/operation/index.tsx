import { AnimatedSegmentedTabs } from '@/components/ui/animated-segmented-tabs';
import { RefreshButton } from '@/components/refresh-button';
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/responsive-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateTimeTitle, formatDisplayDateTime } from '@/lib/date-time';
import { http } from '@/lib/http';
import { useQuery } from '@tanstack/react-query';
import { FileViewIcon, Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as React from 'react';

type StatusFilter = 'all' | '0' | '1';

type OperationLogRecord = {
  oper_id: number;
  title: string;
  request_method: string;
  oper_name: string;
  oper_ip: string;
  status: '0' | '1';
  operated_at: string;
  cost_time: number;
};

type OperationLogDetail = OperationLogRecord & {
  business_type: number;
  method: string;
  operator_type: number;
  oper_url: string;
  oper_location: string;
  oper_param: string;
  json_result: string;
  error_msg: string;
};

type PageResponse<T> = { list: T[]; total: number };

const PAGE_SIZE = 15;
const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '成功', value: '0' },
  { label: '失败', value: '1' },
] satisfies Array<{ label: string; value: StatusFilter }>;

export default function OperationLogPage() {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<StatusFilter>('all');
  const [page, setPage] = React.useState(1);
  const [detailId, setDetailId] = React.useState<number | null>(null);
  const keyword = React.useDeferredValue(search.trim());
  const query = useQuery({
    queryKey: ['system-operation-logs', { keyword, page, status }],
    queryFn: () => listOperationLogs(page, keyword, status),
    placeholderData: (previousData) => previousData,
  });
  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <section className="bg-card flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="bg-muted/40 flex shrink-0 flex-col gap-3 border-b px-3 py-3 lg:px-4">
          <div>
            <h1 className="font-heading text-base font-semibold">操作日志</h1>
            <p className="text-muted-foreground text-xs">
              查看系统操作、请求结果和执行耗时。
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <AnimatedSegmentedTabs
                label="操作结果筛选"
                value={status}
                options={STATUS_OPTIONS}
                onValueChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
              />
              <InputGroup className="w-full sm:w-72">
                <InputGroupAddon>
                  <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
                </InputGroupAddon>
                <InputGroupInput
                  value={search}
                  placeholder="搜索操作日志"
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                />
              </InputGroup>
            </div>
            <RefreshButton
              size="sm"
              variant="outline"
              isRefreshing={query.isFetching}
              onRefresh={query.refetch}
              successMessage="操作日志已刷新"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {query.isLoading ? (
            <LoadingState />
          ) : query.isError ? (
            <ErrorState error={query.error} />
          ) : query.data?.list.length ? (
            <Table>
              <TableHeader className="bg-muted/70 sticky top-0 z-10 backdrop-blur-xl">
                <TableRow>
                  <TableHead>操作</TableHead>
                  <TableHead>方法</TableHead>
                  <TableHead>操作人</TableHead>
                  <TableHead>操作 IP</TableHead>
                  <TableHead>结果</TableHead>
                  <TableHead>操作时间</TableHead>
                  <TableHead className="text-right">耗时</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.list.map((log) => (
                  <TableRow key={log.oper_id}>
                    <TableCell className="max-w-64 truncate font-medium">
                      {log.title || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {log.request_method || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>{log.oper_name || '—'}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.oper_ip || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={log.status === '0' ? 'success' : 'destructive'}
                      >
                        {log.status === '0' ? '成功' : '失败'}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-muted-foreground"
                      title={formatDateTimeTitle(log.operated_at)}
                    >
                      {formatDisplayDateTime(log.operated_at)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {log.cost_time} ms
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label="查看操作日志详情"
                        title="查看详情"
                        onClick={() => setDetailId(log.oper_id)}
                      >
                        <HugeiconsIcon icon={FileViewIcon} strokeWidth={2} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState />
          )}
        </div>

        <PaginationFooter
          page={page}
          pageCount={pageCount}
          total={total}
          onPageChange={setPage}
        />
      </section>

      {detailId === null ? null : (
        <OperationLogDetailDialog
          operId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </>
  );
}

async function listOperationLogs(
  page: number,
  keyword: string,
  status: StatusFilter,
) {
  const params: Record<string, string | number | boolean> = {
    page,
    page_size: PAGE_SIZE,
  };
  if (keyword) params.keyword = keyword;
  if (status !== 'all') params.status = status;
  const response = await http.get<PageResponse<OperationLogRecord>>(
    '/system/operation-logs',
    params,
  );
  return response.data;
}

async function getOperationLog(operId: number) {
  const response = await http.get<OperationLogDetail>(
    `/system/operation-logs/${operId}`,
  );
  return response.data;
}

function OperationLogDetailDialog({
  operId,
  onClose,
}: {
  operId: number;
  onClose: () => void;
}) {
  const query = useQuery({
    queryKey: ['system-operation-log', operId],
    queryFn: () => getOperationLog(operId),
  });

  return (
    <ResponsiveDialog open onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>操作日志详情</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            查看本次系统操作的请求、响应和执行结果。
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ResponsiveDialogBody>
          {query.isLoading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 8 }, (_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : query.isError ? (
            <ErrorState error={query.error} />
          ) : query.data ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailField label="操作" value={query.data.title} />
              <DetailField
                label="结果"
                value={query.data.status === '0' ? '成功' : '失败'}
              />
              <DetailField label="请求方法" value={query.data.request_method} />
              <DetailField label="处理方法" value={query.data.method} />
              <DetailField label="操作人" value={query.data.oper_name} />
              <DetailField label="操作 IP" value={query.data.oper_ip} mono />
              <DetailField label="操作地点" value={query.data.oper_location} />
              <DetailField
                label="操作时间"
                value={formatDateTimeTitle(query.data.operated_at)}
              />
              <DetailField
                label="执行耗时"
                value={`${query.data.cost_time} ms`}
              />
              <DetailField
                label="业务类型"
                value={String(query.data.business_type)}
              />
              <DetailField
                label="操作人类型"
                value={String(query.data.operator_type)}
              />
              <DetailField
                label="请求地址"
                value={query.data.oper_url}
                mono
                wide
              />
              <DetailCode label="请求参数" value={query.data.oper_param} />
              <DetailCode label="响应结果" value={query.data.json_result} />
              {query.data.error_msg ? (
                <DetailCode label="错误信息" value={query.data.error_msg} />
              ) : null}
            </div>
          ) : null}
        </ResponsiveDialogBody>
        <ResponsiveDialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            关闭
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function DetailField({
  label,
  value,
  mono = false,
  wide = false,
}: {
  label: string;
  value: string | undefined;
  mono?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'min-w-0 sm:col-span-2' : 'min-w-0'}>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p
        className={`mt-1 text-sm break-all ${mono ? 'font-mono text-xs' : ''}`}
      >
        {value || '—'}
      </p>
    </div>
  );
}

function DetailCode({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 sm:col-span-2">
      <p className="text-muted-foreground text-xs">{label}</p>
      <pre className="bg-muted/50 mt-1 max-h-48 overflow-auto rounded-md p-3 text-xs break-all whitespace-pre-wrap">
        {formatStructuredValue(value)}
      </pre>
    </div>
  );
}

function formatStructuredValue(value: string) {
  if (!value) return '—';
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-2 p-3">
      {Array.from({ length: 8 }, (_, row) => (
        <div key={row} className="grid grid-cols-8 gap-2">
          {Array.from({ length: 8 }, (_, column) => (
            <Skeleton key={column} className="h-7 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

function ErrorState({ error }: { error: unknown }) {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyTitle>操作日志加载失败</EmptyTitle>
        <EmptyDescription>
          {error instanceof Error ? error.message : '请稍后重试'}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function EmptyState() {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyTitle>暂无操作日志</EmptyTitle>
        <EmptyDescription>当前筛选条件下没有可显示的记录。</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function PaginationFooter({
  page,
  pageCount,
  total,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (!total) return null;
  return (
    <div className="bg-muted/30 flex h-10 shrink-0 items-center justify-between gap-2 border-t px-3">
      <span className="text-muted-foreground text-xs">共 {total} 条</span>
      {pageCount > 1 ? (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">
            第 {page} / {pageCount} 页
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            上一页
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            下一页
          </Button>
        </div>
      ) : null}
    </div>
  );
}
