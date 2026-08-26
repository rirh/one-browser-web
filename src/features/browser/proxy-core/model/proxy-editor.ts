import type { ProxyConfig } from '@/features/browser/contracts';
import { z } from 'zod/v3';

import {
  initialType,
  ipCheckerValue,
  ipCheckerValues,
  numberValue,
  proxyTypeValues,
} from '../proxy-form-utils';

export const proxyEditorSchema = z.object({
  type: z.enum(proxyTypeValues),
  host: z.string().trim().min(1, '请输入主机'),
  port: z
    .string()
    .trim()
    .min(1, '请输入端口')
    .refine((value) => numberValue(value) !== null, '端口必须是 1-65535'),
  username: z.string(),
  password: z.string(),
  refreshUrl: z.string(),
  ipChecker: z.enum(ipCheckerValues),
  remark: z.string().trim().max(500, '备注不能超过 500 个字符'),
});

export type ProxyEditorFormValues = z.infer<typeof proxyEditorSchema>;

export function defaultProxyEditorFormValues(
  proxy?: ProxyConfig | null,
): ProxyEditorFormValues {
  return {
    type: initialType(proxy),
    host: proxy?.host ?? '',
    port: proxy?.port ? String(proxy.port) : '',
    username: proxy?.username ?? '',
    password: proxy?.password ?? '',
    refreshUrl: proxy?.refreshUrl ?? '',
    ipChecker: ipCheckerValue(proxy),
    remark: proxy?.remark ?? '',
  };
}
