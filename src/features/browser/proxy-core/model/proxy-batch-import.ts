import type {
  CheckProxyRequest,
  CreateProxyRequest,
  ProxyCheckResult,
  ProxyListItem,
} from '@/features/browser/contracts';

import {
  type EditableProxyType,
  type IpCheckerValue,
  ipCheckerUrl,
  nullableText,
  numberValue,
  parseHostPortInput,
  proxyName,
} from '../proxy-form-utils';

export const maxBatchProxyCount = 500;
export const batchInlineCheckConcurrency = 6;

export type BatchProxyStatus =
  | 'unchecked'
  | 'checking'
  | 'valid'
  | 'duplicate'
  | 'invalid';

export type BatchProxyCheckState = {
  status: Extract<BatchProxyStatus, 'checking' | 'valid' | 'invalid'>;
  message: string;
  result?: ProxyCheckResult;
};

export interface BatchProxyRow {
  lineNo: number;
  raw: string;
  proxyId: string;
  type: EditableProxyType;
  host: string;
  port: number | null;
  username: string | null;
  password: string | null;
  refreshUrl: string | null;
  ipChecker: IpCheckerValue;
  remark: string;
  status: BatchProxyStatus;
  message: string;
  canCheck: boolean;
}

export interface ProxyBatchImportDialogProps {
  open: boolean;
  existingProxies: ProxyListItem[];
  isImporting?: boolean;
  onBeforeCheck?: () => boolean | Promise<boolean>;
  onOpenChange: (open: boolean) => void;
  onImport: (
    requests: CreateProxyRequest[],
    checkResults?: Record<string, ProxyCheckResult>,
  ) => Promise<string[]>;
  onCheckProxy: (request: CheckProxyRequest) => Promise<ProxyCheckResult>;
}

export interface BatchImportSummary {
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  savedCount: number;
}

export const statusMeta = {
  unchecked: {
    label: '待检',
    badgeClassName: 'border-border bg-muted/70 text-muted-foreground',
    countClassName: 'border-border bg-muted/70 text-muted-foreground',
    messageClassName: 'text-muted-foreground',
  },
  checking: {
    label: '检测中',
    badgeClassName: 'border-border bg-muted/70 text-foreground',
    countClassName: 'border-border bg-muted/70 text-foreground',
    messageClassName: 'text-muted-foreground',
  },
  valid: {
    label: '有效',
    badgeClassName:
      'border-success/20 bg-success/10 text-success focus-visible:ring-success/20',
    countClassName: 'border-success/20 bg-success/10 text-success',
    messageClassName: 'text-success',
  },
  duplicate: {
    label: '重复',
    badgeClassName: 'border-border bg-muted/70 text-foreground',
    countClassName: 'border-border bg-muted/70 text-foreground',
    messageClassName: 'text-muted-foreground',
  },
  invalid: {
    label: '无效',
    badgeClassName:
      'border-destructive/20 bg-destructive/10 text-destructive focus-visible:ring-destructive/20',
    countClassName: 'border-destructive/20 bg-destructive/10 text-destructive',
    messageClassName: 'text-destructive',
  },
} as const;

export const previewColumns = [
  '代理',
  '用户名',
  '密码',
  '换 IP URL',
  'IP 检测',
  '备注',
  '状态',
];

export function splitNote(value: string) {
  const match = value.trim().match(/^(.*?)(?:\{([^{}]*)\})\s*$/);

  if (!match) {
    return {
      input: value.trim(),
      remark: '',
    };
  }

  return {
    input: match[1].trim(),
    remark: match[2]?.trim() ?? '',
  };
}

export function proxyFingerprint({
  type,
  host,
  port,
  username,
}: {
  type: string;
  host?: string | null;
  port?: number | string | null;
  username?: string | null;
}) {
  return [
    type,
    (host ?? '').trim().toLowerCase(),
    port == null ? '' : String(port),
    (username ?? '').trim(),
  ].join('|');
}

export function proxyAddress(host: string, port: number | null) {
  const displayHost =
    host.includes(':') && !host.startsWith('[') ? `[${host}]` : host;

  return port ? `${displayHost}:${port}` : displayHost;
}

export function createBatchProxyId({
  type,
  host,
  port,
  lineNo,
  occupiedIds,
}: {
  type: EditableProxyType;
  host: string;
  port: number | null;
  lineNo: number;
  occupiedIds: Set<string>;
}) {
  const slug =
    `${type}-${host}-${port ?? lineNo}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 52) || String(lineNo);
  const candidate = `proxy-${slug}`;
  let proxyId = candidate;
  let index = 2;

  while (occupiedIds.has(proxyId)) {
    proxyId = `${candidate}-${index}`;
    index += 1;
  }

  occupiedIds.add(proxyId);
  return proxyId;
}

export function parseBatchRows({
  text,
  defaultType,
  ipChecker,
  existingProxies,
}: {
  text: string;
  defaultType: EditableProxyType;
  ipChecker: IpCheckerValue;
  existingProxies: ProxyListItem[];
}) {
  const existingFingerprints = new Set(
    existingProxies
      .filter((proxy) => proxy.host && proxy.port)
      .map((proxy) =>
        proxyFingerprint({
          type: proxy.type,
          host: proxy.host,
          port: proxy.port,
          username: proxy.username,
        }),
      ),
  );
  const occupiedIds = new Set(existingProxies.map((proxy) => proxy.proxyId));
  const seenFingerprints = new Set<string>();
  const lines = text
    .split(/\r?\n/)
    .map((line, index) => ({
      raw: line.trim(),
      lineNo: index + 1,
    }))
    .filter((line) => line.raw.length > 0);

  return lines.map<BatchProxyRow>((line, index) => {
    const { input, remark } = splitNote(line.raw);
    const parsed = parseHostPortInput(input);
    const type = parsed?.type ?? defaultType;
    const host = parsed?.host?.trim() ?? '';
    const port = numberValue(parsed?.port ?? '');
    const proxyId = createBatchProxyId({
      type,
      host,
      port,
      lineNo: line.lineNo,
      occupiedIds,
    });

    if (index >= maxBatchProxyCount) {
      return {
        lineNo: line.lineNo,
        raw: line.raw,
        proxyId,
        type,
        host,
        port,
        username: nullableText(parsed?.username ?? ''),
        password: nullableText(parsed?.password ?? ''),
        refreshUrl: nullableText(parsed?.refreshUrl ?? ''),
        ipChecker,
        remark,
        status: 'invalid',
        message: `一次最多导入 ${maxBatchProxyCount} 条`,
        canCheck: false,
      };
    }

    if (!parsed || !host || !port) {
      return {
        lineNo: line.lineNo,
        raw: line.raw,
        proxyId,
        type,
        host,
        port,
        username: nullableText(parsed?.username ?? ''),
        password: nullableText(parsed?.password ?? ''),
        refreshUrl: nullableText(parsed?.refreshUrl ?? ''),
        ipChecker,
        remark,
        status: 'invalid',
        message: '格式或端口无效',
        canCheck: false,
      };
    }

    const username = nullableText(parsed.username ?? '');
    const fingerprint = proxyFingerprint({
      type,
      host,
      port,
      username,
    });
    const isDuplicate =
      seenFingerprints.has(fingerprint) ||
      existingFingerprints.has(fingerprint);

    seenFingerprints.add(fingerprint);

    return {
      lineNo: line.lineNo,
      raw: line.raw,
      proxyId,
      type,
      host,
      port,
      username,
      password: nullableText(parsed.password ?? ''),
      refreshUrl: nullableText(parsed.refreshUrl ?? ''),
      ipChecker,
      remark,
      status: isDuplicate ? 'duplicate' : 'unchecked',
      message: isDuplicate ? '已存在或本次重复' : '待检测',
      canCheck: !isDuplicate,
    };
  });
}

export function toCreateProxyRequest(row: BatchProxyRow) {
  return {
    proxyId: row.proxyId,
    name: proxyName(row.type, row.host, String(row.port ?? ''), row.proxyId),
    type: row.type,
    host: row.host,
    port: row.port,
    username: row.username,
    password: row.password,
    server: null,
    pacUrl: null,
    bypassList: [],
    refreshUrl: row.refreshUrl,
    ipChecker: ipCheckerUrl(row.ipChecker),
    remark: row.remark,
  } satisfies CreateProxyRequest;
}

export function toCheckProxyRequest(row: BatchProxyRow) {
  return {
    proxyConfig: {
      type: row.type,
      host: row.host,
      port: row.port,
      username: row.username,
      password: row.password,
      server: null,
      pacUrl: null,
      bypassList: [],
    },
    ipChecker: ipCheckerUrl(row.ipChecker),
  } satisfies CheckProxyRequest;
}

export function batchCheckKey(row: BatchProxyRow) {
  return [
    row.type,
    row.host.trim().toLowerCase(),
    row.port ?? '',
    row.username ?? '',
    row.password ?? '',
    row.ipChecker,
  ].join('|');
}

export function applyCheckStates(
  rows: BatchProxyRow[],
  checkStates: Record<string, BatchProxyCheckState>,
) {
  return rows.map((row) => {
    if (!row.canCheck) {
      return row;
    }

    const state = checkStates[batchCheckKey(row)];

    if (!state) {
      return row;
    }

    return {
      ...row,
      status: state.status,
      message: state.message,
    };
  });
}

export function batchImportSummaryMessage({
  validCount,
  invalidCount,
  duplicateCount,
  savedCount,
}: BatchImportSummary) {
  const parts = [`有效 ${validCount} 个`, `无效 ${invalidCount} 个`];

  if (duplicateCount > 0) {
    parts.push(`重复 ${duplicateCount} 个`);
  }

  parts.push(`保存 ${savedCount} 个`);

  return `批量保存结果：${parts.join('，')}`;
}

export function hasBatchImportWarning({
  validCount,
  invalidCount,
  duplicateCount,
  savedCount,
}: BatchImportSummary) {
  return invalidCount > 0 || duplicateCount > 0 || savedCount !== validCount;
}
