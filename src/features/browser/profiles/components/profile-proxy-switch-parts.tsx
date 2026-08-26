import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import type {
  ProxyCheckResult,
  ProxyListItem,
} from '@/features/browser/contracts';
import { formatProxyCheckLocation } from '@/features/browser/proxy-core';
import { AddCircleIcon, Route02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

import { CountryFlag, resolveCountryCode } from '../../components/country-flag';
import {
  type ProxySwitchMode,
  emptyProxyValue,
  formatSavedProxyUrl,
  noProxyValue,
  proxyLocation,
} from '../model/profile-proxy-switch';

export function LocalNetworkStatus({
  isError,
  isChecking,
  result,
}: {
  isError: boolean;
  isChecking: boolean;
  result?: ProxyCheckResult;
}) {
  return (
    <div className="flex min-h-11 items-center gap-2 rounded-md border border-dashed border-border/80 bg-muted/10 px-3 py-2 text-xs sm:text-sm">
      <span className="font-medium text-foreground">本机网络:</span>
      {isChecking ? (
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Spinner className="size-3.5" />
          检测中
        </span>
      ) : result?.status === 'ok' ? (
        <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
          {resolveCountryCode(result.countryCode, result.country) ? (
            <CountryFlag code={result.countryCode} country={result.country} />
          ) : null}
          <span className="truncate text-xs">
            {formatProxyCheckLocation(result)}
          </span>
        </span>
      ) : (
        <span className="truncate text-muted-foreground">
          {result?.message || (isError ? '检测失败' : '检测中')}
        </span>
      )}
    </div>
  );
}

export function SavedProxyPanel({
  currentProxyUrl,
  isLoading,
  mode,
  onAddProxy,
  proxies,
  selectedProxy,
  selectedProxyId,
  setSelectedProxyId,
}: {
  currentProxyUrl: string;
  isLoading?: boolean;
  mode: ProxySwitchMode;
  onAddProxy: () => void;
  proxies: ProxyListItem[];
  selectedProxy: ProxyListItem | null;
  selectedProxyId: string;
  setSelectedProxyId: (proxyId: string) => void;
}) {
  const triggerLabel = selectedProxy
    ? formatSavedProxyUrl(selectedProxy)
    : selectedProxyId !== emptyProxyValue && selectedProxyId !== noProxyValue
      ? currentProxyUrl
      : '选择已保存代理';

  return (
    <div className="flex flex-col gap-2 rounded-md border border-dashed border-border/80 bg-muted/10 p-1.5">
      <div className="px-1 text-sm font-medium text-foreground">
        选择已保存代理
      </div>
      <Field>
        <FieldLabel className="sr-only" htmlFor="profile-proxy-switch-select">
          已保存代理
        </FieldLabel>
        <Select value={selectedProxyId} onValueChange={setSelectedProxyId}>
          <SelectTrigger
            id="profile-proxy-switch-select"
            className="h-8 w-full justify-between"
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <HugeiconsIcon
                icon={Route02Icon}
                strokeWidth={2}
                className="text-muted-foreground"
              />
              <span className="truncate">{triggerLabel}</span>
            </span>
          </SelectTrigger>
          <SelectContent
            align="start"
            position="popper"
            className="max-h-80 w-[var(--radix-select-trigger-width)] rounded-md border-border/70 bg-popover/95 p-0 shadow-xl backdrop-blur"
          >
            <SelectGroup className="p-1">
              {proxies.map((proxy) => (
                <SelectItem
                  key={proxy.proxyId}
                  value={proxy.proxyId}
                  className="min-h-12 px-2.5 py-1.5 text-xs focus:bg-accent/70 data-[state=checked]:bg-accent/50"
                  textValue={formatSavedProxyUrl(proxy)}
                >
                  <ProxyOption
                    title={formatSavedProxyUrl(proxy)}
                    description={proxyLocation(proxy)}
                    proxy={proxy}
                  />
                </SelectItem>
              ))}
              {!isLoading && !proxies.length ? (
                <SelectItem
                  value={emptyProxyValue}
                  disabled
                  className="min-h-10 px-2.5 py-1.5 text-xs"
                >
                  <ProxyOption
                    title="暂无已保存代理"
                    description="新增代理后再保存该模式"
                  />
                </SelectItem>
              ) : null}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <ProxyLocationLine proxy={selectedProxy} />
      {isLoading ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Spinner className="size-3.5" />
          加载代理中
        </div>
      ) : null}
      <div className="flex items-center gap-3 px-1">
        <Separator className="flex-1 border-dashed" />
        <span className="text-xs font-medium text-muted-foreground">或</span>
        <Separator className="flex-1 border-dashed" />
      </div>
      <Button
        type="button"
        variant="outline"
        className="h-8"
        onClick={onAddProxy}
      >
        <HugeiconsIcon
          icon={AddCircleIcon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        新增代理
      </Button>
      {mode === 'rotating' ? (
        <span className="sr-only">动态代理使用已保存代理。</span>
      ) : null}
    </div>
  );
}

function ProxyLocationLine({ proxy }: { proxy: ProxyListItem | null }) {
  if (!proxy) return <div className="min-h-6" />;
  const code = resolveCountryCode(
    proxy.lastCheck.countryCode,
    proxy.lastCheck.country,
  );
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
      <CountryFlag code={code} country={proxy.lastCheck.country} />
      <span className="truncate">{proxyLocation(proxy)}</span>
    </div>
  );
}

function ProxyOption({
  description,
  proxy,
  title,
}: {
  description: string;
  proxy?: ProxyListItem;
  title: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 py-0.5 pr-5">
      <div className="truncate font-medium text-foreground">{title}</div>
      <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground">
        {proxy ? <ProxyMarker proxy={proxy} /> : null}
        <span className="truncate">{description}</span>
      </div>
    </div>
  );
}

function ProxyMarker({ proxy }: { proxy: ProxyListItem }) {
  const code = resolveCountryCode(
    proxy.lastCheck.countryCode,
    proxy.lastCheck.country,
  );
  if (code)
    return <CountryFlag code={code} country={proxy.lastCheck.country} />;
  return (
    <HugeiconsIcon
      icon={Route02Icon}
      strokeWidth={2}
      className="size-3.5 shrink-0 text-muted-foreground"
    />
  );
}
