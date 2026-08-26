import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Route02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as React from 'react';

import { CountryFlag, resolveCountryCode } from '../../components/country-flag';
import { CompactTabs } from '../../profile-editor/editor-controls';
import type {
  ProfileEditorForm,
  ProxyMode,
  UpdateProfileEditorField,
} from '../../profile-editor/types';
import type { RemoteProxyResource } from '../../remote-proxies/types';

const remoteProxyModeOptions: Array<{ value: ProxyMode; label: string }> = [
  { value: 'none', label: '无代理' },
  { value: 'static', label: '固定代理' },
  { value: 'rotating', label: '动态代理' },
];

export function RemoteProxySection({
  form,
  proxies,
  proxiesLoading,
  updateField,
  error,
}: {
  form: ProfileEditorForm;
  proxies: RemoteProxyResource[];
  proxiesLoading?: boolean;
  updateField: UpdateProfileEditorField;
  error?: { message?: string };
}) {
  React.useEffect(() => {
    if (form.proxyMode === 'none' || form.proxyId !== 'none') {
      return;
    }
    const firstProxyId = proxies[0]?.proxy_id;
    if (firstProxyId) {
      updateField('proxyId', String(firstProxyId));
    }
  }, [form.proxyId, form.proxyMode, proxies, updateField]);

  function updateProxyMode(value: ProxyMode) {
    updateField('proxyMode', value);
    if (value === 'none') {
      updateField('proxyId', 'none');
    } else if (form.proxyId === 'none') {
      updateField(
        'proxyId',
        proxies[0]?.proxy_id ? String(proxies[0].proxy_id) : 'none',
      );
    }
    updateField('inlineProxyEnabled', false);
  }

  const selectedProxy =
    proxies.find((proxy) => String(proxy.proxy_id) === form.proxyId) ?? null;
  const invalid = Boolean(error);
  const proxySelectValue =
    form.proxyId !== 'none'
      ? form.proxyId
      : proxies[0]?.proxy_id
        ? String(proxies[0].proxy_id)
        : 'empty';

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <CompactTabs
        className="h-9"
        itemClassName="h-7 min-w-20 text-xs"
        value={form.proxyMode}
        onValueChange={updateProxyMode}
        options={remoteProxyModeOptions}
      />
      {form.proxyMode === 'none' ? (
        <div className="flex min-h-11 items-center gap-2 rounded-md border border-dashed border-border/80 bg-muted/10 px-3 py-2 text-xs sm:text-sm">
          <span className="font-medium text-foreground">本机网络:</span>
          <span className="truncate text-muted-foreground">直接连接</span>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-border/80 bg-muted/10 p-1.5">
          <Field data-invalid={invalid}>
            <FieldLabel className="sr-only" htmlFor="remote-env-proxy">
              已保存代理
            </FieldLabel>
            <Select
              value={proxySelectValue}
              onValueChange={(value) => updateField('proxyId', value)}
            >
              <SelectTrigger
                id="remote-env-proxy"
                aria-invalid={invalid}
                className="h-8 w-full justify-between"
              >
                {selectedProxy ? (
                  <span className="truncate">
                    {proxyAddress(selectedProxy)}
                  </span>
                ) : form.proxyId !== 'none' ? (
                  <span className="truncate">代理 #{form.proxyId}</span>
                ) : (
                  <span className="truncate text-muted-foreground">
                    选择已保存代理
                  </span>
                )}
              </SelectTrigger>
              <SelectContent
                align="start"
                position="popper"
                className="max-h-72 w-[var(--radix-select-trigger-width)] rounded-md border-border/70 bg-popover/95 p-0 shadow-xl backdrop-blur"
              >
                <SelectGroup className="p-1">
                  {proxies.map((proxy) => (
                    <SelectItem
                      key={proxy.proxy_id}
                      value={String(proxy.proxy_id)}
                      className="min-h-12 px-2.5 py-1.5 text-xs focus:bg-accent/70 data-[state=checked]:bg-accent/50"
                      textValue={proxyAddress(proxy)}
                    >
                      <ProxyOption
                        title={proxyAddress(proxy)}
                        description={proxyLocation(proxy)}
                        proxy={proxy}
                      />
                    </SelectItem>
                  ))}
                  {!proxies.length ? (
                    <SelectItem
                      value="empty"
                      disabled
                      className="min-h-10 px-2.5 py-1.5 text-xs"
                    >
                      <ProxyOption
                        title={proxiesLoading ? '代理加载中' : '暂无已保存代理'}
                        description="请先在代理管理里新增代理"
                      />
                    </SelectItem>
                  ) : null}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldError errors={[error]} />
          </Field>
          <ProxyLocationLine proxy={selectedProxy} />
        </div>
      )}
    </div>
  );
}

function ProxyLocationLine({ proxy }: { proxy: RemoteProxyResource | null }) {
  if (!proxy) {
    return <div className="min-h-6 px-1" />;
  }
  return (
    <div className="flex min-h-6 min-w-0 items-center gap-1.5 px-1 py-1 text-xs text-muted-foreground">
      <ProxyMarker proxy={proxy} />
      <span className="truncate">{proxyLocation(proxy)}</span>
      <ProxyLatency proxy={proxy} />
      <ProxyRemark proxy={proxy} />
    </div>
  );
}

function ProxyOption({
  description,
  proxy,
  title,
}: {
  description: string;
  proxy?: RemoteProxyResource;
  title: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 py-0.5 pr-5">
      <div className="truncate font-medium text-foreground">{title}</div>
      <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
        {proxy ? <ProxyMarker proxy={proxy} /> : null}
        <span className="truncate">{description}</span>
        {proxy ? <ProxyLatency proxy={proxy} /> : null}
        {proxy ? <ProxyRemark proxy={proxy} /> : null}
      </div>
    </div>
  );
}

function ProxyRemark({ proxy }: { proxy: RemoteProxyResource }) {
  const remark = proxy.remark.trim();
  if (!remark) {
    return null;
  }
  return (
    <>
      <span aria-hidden="true" className="shrink-0 text-muted-foreground/70">
        ·
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="min-w-0 truncate">{remark}</span>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          sideOffset={6}
          className="max-w-80 whitespace-normal break-words"
        >
          {remark}
        </TooltipContent>
      </Tooltip>
    </>
  );
}

function ProxyLatency({ proxy }: { proxy: RemoteProxyResource }) {
  if (proxy.last_check_latency_ms === null) {
    return null;
  }
  return (
    <>
      <span aria-hidden="true" className="shrink-0 text-muted-foreground/70">
        ·
      </span>
      <span className="shrink-0 tabular-nums">
        {proxy.last_check_latency_ms} ms
      </span>
    </>
  );
}

function ProxyMarker({ proxy }: { proxy: RemoteProxyResource }) {
  const code = resolveCountryCode(
    proxy.last_check_country_code,
    proxy.last_check_country,
  );
  if (code) {
    return <CountryFlag code={code} country={proxy.last_check_country} />;
  }
  return (
    <HugeiconsIcon
      icon={Route02Icon}
      strokeWidth={2}
      className={cn('size-3.5 shrink-0 text-muted-foreground')}
    />
  );
}

function proxyAddress(proxy: RemoteProxyResource) {
  if (proxy.host && proxy.port) {
    return `${proxy.type}://${proxy.host}:${proxy.port}`;
  }
  if (proxy.server) {
    return `${proxy.type}: ${proxy.server}`;
  }
  if (proxy.pac_url) {
    return `PAC ${proxy.pac_url}`;
  }
  return proxy.name || proxy.proxy_key || `代理 #${proxy.proxy_id}`;
}

function proxyLocation(proxy: RemoteProxyResource) {
  const code = resolveCountryCode(
    proxy.last_check_country_code,
    proxy.last_check_country,
  );
  const country = proxy.last_check_country || code || null;
  const ip = proxy.last_check_exit_ip || proxy.host;
  if (country && ip) {
    return `${country} (${ip})`;
  }
  if (country) {
    return country;
  }
  if (ip) {
    return `未检测 (${ip})`;
  }
  return proxy.last_check_message || '未检测';
}
