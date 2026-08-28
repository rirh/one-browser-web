import { AnimatedSegmentedTabs } from '@/components/ui/animated-segmented-tabs';
import { RefreshButton } from '@/components/refresh-button';
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
import { Search01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as React from 'react';

type StatusFilter = 'all' | '0' | '1';

type NoticeRecord = {
  notice_id: number;
  notice_title: string;
  notice_type: '1' | '2';
  status: '0' | '1';
  created_by: string;
  created_at: string;
};

type PageResponse<T> = { list: T[]; total: number };

const PAGE_SIZE = 15;
const STATUS_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '正常', value: '0' },
  { label: '关闭', value: '1' },
] satisfies Array<{ label: string; value: StatusFilter }>;

export default function NoticePage() {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<StatusFilter>('all');
  const [page, setPage] = React.useState(1);
  const keyword = React.useDeferredValue(search.trim());
  const query = useQuery({
    queryKey: ['system-notices', { keyword, page, status }],
    queryFn: () => listNotices(page, keyword, status),
    placeholderData: (previousData) => previousData,
  });
  const total = query.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="bg-card flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="bg-muted/40 flex shrink-0 flex-col gap-3 border-b px-3 py-3 lg:px-4">
        <div>
          <h1 className="font-heading text-base font-semibold">通知管理</h1>
          <p className="text-muted-foreground text-xs">
            查看系统通知、公告类型和发布状态。
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <AnimatedSegmentedTabs
              label="通知状态筛选"
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
                placeholder="搜索通知"
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
            successMessage="通知列表已刷新"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {query.isLoading ? (
          <LoadingState columns={6} />
        ) : query.isError ? (
          <ErrorState error={query.error} />
        ) : query.data?.list.length ? (
          <Table>
            <TableHeader className="bg-muted/70 sticky top-0 z-10 backdrop-blur-xl">
              <TableRow>
                <TableHead>通知 ID</TableHead>
                <TableHead>标题</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建人</TableHead>
                <TableHead>创建时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.list.map((notice) => (
                <TableRow key={notice.notice_id}>
                  <TableCell className="text-muted-foreground">
                    {notice.notice_id}
                  </TableCell>
                  <TableCell className="max-w-80 truncate font-medium">
                    {notice.notice_title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {notice.notice_type === '1' ? '通知' : '公告'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={notice.status === '0' ? 'success' : 'secondary'}
                    >
                      {notice.status === '0' ? '正常' : '关闭'}
                    </Badge>
                  </TableCell>
                  <TableCell>{notice.created_by || '—'}</TableCell>
                  <TableCell
                    className="text-muted-foreground"
                    title={formatDateTimeTitle(notice.created_at)}
                  >
                    {formatDisplayDateTime(notice.created_at)}
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
  );
}

async function listNotices(
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
  const response = await http.get<PageResponse<NoticeRecord>>(
    '/system/notices',
    params,
  );
  return response.data;
}

function LoadingState({ columns }: { columns: number }) {
  return (
    <div className="flex flex-col gap-2 p-3">
      {Array.from({ length: 8 }, (_, row) => (
        <div
          key={row}
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(7rem, 1fr))`,
          }}
        >
          {Array.from({ length: columns }, (_, column) => (
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
        <EmptyTitle>通知加载失败</EmptyTitle>
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
        <EmptyTitle>暂无通知</EmptyTitle>
        <EmptyDescription>当前筛选条件下没有可显示的通知。</EmptyDescription>
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
