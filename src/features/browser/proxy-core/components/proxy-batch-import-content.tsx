import { ResponsiveDialogBody } from '@/components/responsive-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { FileImportIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import {
  type BatchProxyRow,
  type BatchProxyStatus,
  previewColumns,
  proxyAddress,
  statusMeta,
} from '../model/proxy-batch-import';
import {
  type EditableProxyType,
  type IpCheckerValue,
  ipCheckerOptions,
  proxyTypes,
  smartParseFormats,
} from '../proxy-form-utils';

export function ProxyBatchImportContent({
  defaultType,
  displayRows,
  duplicateCount,
  invalidCount,
  ipChecker,
  rawText,
  rowsLength,
  setDefaultType,
  setIpChecker,
  setRawText,
  uncheckedCount,
  validCount,
}: {
  defaultType: EditableProxyType;
  displayRows: BatchProxyRow[];
  duplicateCount: number;
  invalidCount: number;
  ipChecker: IpCheckerValue;
  rawText: string;
  rowsLength: number;
  setDefaultType: (value: EditableProxyType) => void;
  setIpChecker: (value: IpCheckerValue) => void;
  setRawText: (value: string) => void;
  uncheckedCount: number;
  validCount: number;
}) {
  return (
    <ResponsiveDialogBody className="flex flex-col gap-3 bg-muted/10">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/20 px-3 py-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <HugeiconsIcon
              icon={FileImportIcon}
              strokeWidth={2}
              className="size-4 text-muted-foreground"
            />
            代理
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={defaultType}
              onValueChange={(value) =>
                setDefaultType(value as EditableProxyType)
              }
            >
              <SelectTrigger className="h-8 w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {proxyTypes.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              value={ipChecker}
              onValueChange={(value) => setIpChecker(value as IpCheckerValue)}
            >
              <SelectTrigger className="h-8 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ipCheckerOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid md:grid-cols-[1.5fr_1fr]">
          <Textarea
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            placeholder={smartParseFormats
              .slice(0, 4)
              .map((item) => `${item}{备注}`)
              .join('\n')}
            className="h-full min-h-36 resize-none rounded-none border-0 bg-background p-3 font-mono text-xs/relaxed shadow-none focus-visible:ring-0"
          />
          <div className="border-t border-border/60 bg-muted/10 p-3 text-xs/relaxed text-muted-foreground md:border-l md:border-t-0">
            <div className="mb-2 font-medium text-foreground">提示</div>
            <div className="flex flex-col gap-1">
              <p>未写协议时会使用右上角选择的类型。</p>
              <p>支持 HTTP、HTTPS、Socks5，每次最多导入 500 条。</p>
              <p>IPv6 主机请使用方括号，例如 [2a06:c006::1]:8000。</p>
              <p>行尾可追加 {'{备注}'}，换 IP URL 使用 [url]。</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 bg-muted/10 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatPill label="待检" value={uncheckedCount} status="unchecked" />
            <StatPill label="有效" value={validCount} status="valid" />
            <StatPill label="重复" value={duplicateCount} status="duplicate" />
            <StatPill label="无效" value={invalidCount} status="invalid" />
          </div>
          {rawText ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRawText('')}
            >
              清空
            </Button>
          ) : null}
        </div>
      </div>

      <div className="min-h-44 overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader className="bg-muted/25">
            <TableRow className="hover:bg-muted/25">
              {previewColumns.map((column) => (
                <TableHead key={column} className="h-9">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.map((row) => {
              const meta = statusMeta[row.status];
              return (
                <TableRow key={`${row.lineNo}:${row.raw}`} className="h-12">
                  <TableCell className="min-w-56 py-2">
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-mono text-foreground">
                        {row.type}://{proxyAddress(row.host, row.port)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        第 {row.lineNo} 行
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">{row.username || '-'}</TableCell>
                  <TableCell className="py-2 font-mono">
                    {row.password ? '••••••' : '-'}
                  </TableCell>
                  <TableCell className="max-w-52 truncate py-2">
                    {row.refreshUrl || '-'}
                  </TableCell>
                  <TableCell className="py-2">
                    {
                      ipCheckerOptions.find(
                        (item) => item.value === row.ipChecker,
                      )?.label
                    }
                  </TableCell>
                  <TableCell className="max-w-40 truncate py-2">
                    {row.remark || '-'}
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={meta.badgeClassName}>
                        {row.status === 'checking' ? (
                          <Spinner data-icon="inline-start" />
                        ) : null}
                        {meta.label}
                      </Badge>
                      <span className={meta.messageClassName}>
                        {row.message}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {!rowsLength ? (
          <Empty className="min-h-36 border-0">
            <EmptyHeader>
              <EmptyTitle>还没有代理</EmptyTitle>
              <EmptyDescription>
                把代理列表粘贴到上方输入框后会自动解析预览。
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}
      </div>
    </ResponsiveDialogBody>
  );
}

function StatPill({
  label,
  value,
  status,
}: {
  label: string;
  value: number;
  status: BatchProxyStatus;
}) {
  const meta = statusMeta[status];
  return (
    <div className="flex items-center gap-2 rounded-md border border-border/70 bg-background px-2 py-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Badge
        variant="outline"
        className={cn('min-w-7 justify-center', meta.countClassName)}
      >
        {value}
      </Badge>
    </div>
  );
}
