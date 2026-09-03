import { LoadingState } from '@/components/loading-state';
import { TablePagination } from '@/components/table-pagination';
import { Badge } from '@/components/ui/badge';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  BrowserTableFilterTabs,
  BrowserTableRefreshButton,
  BrowserTableSearchField,
  BrowserTableToolbar,
} from '@/features/browser/components/table-toolbar';
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

  return (
    <section className="bg-card flex min-h-0 flex-1 flex-col overflow-hidden">
      <BrowserTableToolbar
        filters={
          <>
            <BrowserTableFilterTabs
              label="通知状态筛选"
              value={status}
              options={STATUS_OPTIONS}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            />
            <BrowserTableSearchField
              className="w-full sm:w-72"
              value={search}
              placeholder="搜索通知"
              ariaLabel="搜索通知"
              onValueChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
          </>
        }
        actions={
          <BrowserTableRefreshButton
            isRefreshing={query.isFetching}
            onRefresh={query.refetch}
            successMessage="通知列表已刷新"
          />
        }
      />

      <div className="min-h-0 flex-1 overflow-auto">
        {query.isLoading ? (
          <LoadingState label="通知加载中..." />
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

      <TablePagination
        currentPage={page}
        pageSize={PAGE_SIZE}
        total={total}
        isUpdating={query.isFetching && !query.isLoading}
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
