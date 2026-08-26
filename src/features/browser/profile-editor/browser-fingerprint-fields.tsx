import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ListViewIcon, Refresh01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMemo, useState } from 'react';

import {
  type BrowserSystemOption,
  type BrowserVersion,
  allGeneratedUserAgents,
  browserSystems,
  browserUserAgent,
  chromeFullVersion,
  resolveBrowserSystem,
  resolveBrowserVersion,
} from './browser-system-options';
import { CompactTabs, EditorFieldRow } from './editor-controls';
import {
  type FingerprintOperatingSystem,
  localFingerprintOsConflict,
} from './local-fingerprint-guard';
import type {
  ProfileEditorForm,
  SystemFingerprintDefaults,
  UpdateProfileEditorField,
} from './types';

type UserAgentMode = 'manual' | 'random';

const userAgentModeOptions: Array<{ value: UserAgentMode; label: string }> = [
  { value: 'manual', label: '手动' },
  { value: 'random', label: '随机' },
];

export function BrowserSystemPicker({
  defaults,
  form,
  hostSystem,
  updateField,
}: {
  defaults: SystemFingerprintDefaults;
  form: ProfileEditorForm;
  hostSystem?: FingerprintOperatingSystem | null;
  updateField: UpdateProfileEditorField;
}) {
  const currentSystem = useMemo(
    () => resolveBrowserSystem(form.system || defaults.system),
    [defaults.system, form.system],
  );
  const systemOption = browserSystems.find(
    (system) => system.value === currentSystem,
  )!;
  const currentVersion = resolveBrowserVersion(
    systemOption,
    form.system || defaults.system,
  );
  const osConflict = hostSystem
    ? localFingerprintOsConflict(form, defaults)
    : null;

  function applyBrowserVersion(
    nextSystem: BrowserSystemOption,
    nextVersion: BrowserVersion,
    options?: { forceUserAgent?: boolean },
  ) {
    updateField('system', nextVersion.label);
    updateField('platform', nextSystem.platform);
    updateField('platformVersion', nextVersion.platformVersion);
    updateField('architecture', nextVersion.architecture);
    updateField('uaFullVersion', chromeFullVersion);

    if (
      options?.forceUserAgent ||
      !form.userAgent.trim() ||
      allGeneratedUserAgents.has(form.userAgent)
    ) {
      updateField('userAgent', nextVersion.userAgent);
    }
  }

  return (
    <EditorFieldRow label="系统">
      <div className="flex min-w-0 flex-col gap-1.5">
        <ButtonGroup className="h-7 max-w-full">
          <Select
            value={systemOption.value}
            onValueChange={(value) => {
              if (!value) {
                return;
              }

              const nextSystem = resolveSystemOption(value);
              applyBrowserVersion(nextSystem, nextSystem.versions[0], {
                forceUserAgent: true,
              });
            }}
          >
            <SelectTrigger
              aria-invalid={Boolean(osConflict)}
              aria-label="选择系统"
              className="h-full shrink-0 bg-background px-2 leading-none"
            >
              <span className="flex items-center gap-1.5 leading-none">
                <SystemLogo system={systemOption} />
                <span className="font-medium">{systemOption.label}</span>
              </span>
            </SelectTrigger>
            <SelectContent align="start" position="popper">
              <SelectGroup>
                {browserSystems.map((system) => {
                  const disabled = Boolean(
                    hostSystem && system.value !== hostSystem,
                  );

                  return (
                    <SelectItem
                      key={system.value}
                      value={system.value}
                      disabled={disabled}
                    >
                      <SystemLogo system={system} />
                      <span className="font-medium">{system.label}</span>
                      {disabled ? (
                        <span className="text-muted-foreground">
                          非本机系统
                        </span>
                      ) : null}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select
            value={currentVersion.label}
            onValueChange={(value) => {
              const nextVersion =
                systemOption.versions.find(
                  (version) => version.label === value,
                ) ?? currentVersion;
              applyBrowserVersion(systemOption, nextVersion);
            }}
          >
            <SelectTrigger className="h-full shrink-0 bg-background px-2 leading-none *:data-[slot=select-value]:leading-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" position="popper">
              <SelectGroup>
                {systemOption.versions.map((version) => (
                  <SelectItem key={version.label} value={version.label}>
                    <span className="font-medium">{version.label}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </ButtonGroup>
        <FieldError>{osConflict?.message}</FieldError>
      </div>
    </EditorFieldRow>
  );
}

export function BrowserFingerprintFields({
  defaults,
  form,
  updateField,
}: {
  defaults: SystemFingerprintDefaults;
  form: ProfileEditorForm;
  updateField: UpdateProfileEditorField;
}) {
  const [mode, setMode] = useState<UserAgentMode>('manual');
  const [clientHintsOpen, setClientHintsOpen] = useState(false);
  const currentSystem = useMemo(
    () => resolveBrowserSystem(form.system || defaults.system),
    [defaults.system, form.system],
  );
  const systemOption = browserSystems.find(
    (system) => system.value === currentSystem,
  )!;
  const currentVersion = resolveBrowserVersion(
    systemOption,
    form.system || defaults.system,
  );
  const clientHints = {
    platform: form.platform || systemOption.platform,
    platformVersion:
      form.platformVersion ||
      currentVersion.platformVersion ||
      defaults.platformVersion,
    architecture:
      form.architecture || currentVersion.architecture || defaults.architecture,
    uaFullVersion: form.uaFullVersion || chromeFullVersion,
  };
  const userAgent = form.userAgent || currentVersion.userAgent;

  function applyRandomizedBrowserParams(
    nextSystem: BrowserSystemOption,
    nextVersion: BrowserVersion,
  ) {
    const nextChromeVersion = randomChromeVersion(defaults);

    updateField('system', nextVersion.label);
    updateField('platform', nextSystem.platform);
    updateField(
      'platformVersion',
      platformVersionForCurrentSystem(nextSystem, nextVersion, defaults),
    );
    updateField(
      'architecture',
      defaults.architecture.trim() || nextVersion.architecture,
    );
    updateField('uaFullVersion', nextChromeVersion);
    updateField('userAgent', browserUserAgent(nextSystem, nextChromeVersion));
  }

  function randomizeUserAgent() {
    const defaultSystem = resolveSystemOption(
      resolveBrowserSystem(defaults.system),
    );
    const defaultVersion = resolveBrowserVersion(
      defaultSystem,
      defaults.system,
    );

    setMode('random');
    applyRandomizedBrowserParams(defaultSystem, defaultVersion);
  }

  function setUserAgentMode(nextMode: UserAgentMode) {
    setMode(nextMode);

    if (nextMode === 'random') {
      randomizeUserAgent();
      return;
    }

    if (!form.userAgent.trim()) {
      updateField('userAgent', currentVersion.userAgent);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <EditorFieldRow label="用户代理">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="grid min-w-0 items-center gap-2 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
            <CompactTabs
              className="h-9"
              listClassName="h-9"
              itemClassName="h-7 min-w-16 px-3 text-xs"
              value={mode}
              onValueChange={setUserAgentMode}
              options={userAgentModeOptions}
            />

            <InputGroup className="h-9">
              <InputGroupInput
                id="profile-editor-user-agent"
                value={userAgent}
                readOnly={mode === 'random'}
                onChange={(event) => {
                  setMode('manual');
                  updateField('userAgent', event.target.value);
                }}
                placeholder={defaults.userAgent}
                className={cn(mode === 'random' && 'text-muted-foreground')}
              />
              {mode === 'random' ? (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    size="icon-sm"
                    aria-label="随机生成用户代理"
                    onClick={randomizeUserAgent}
                  >
                    <HugeiconsIcon icon={Refresh01Icon} strokeWidth={2} />
                  </InputGroupButton>
                </InputGroupAddon>
              ) : null}
            </InputGroup>

            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-expanded={clientHintsOpen}
              aria-label={clientHintsOpen ? '收起客户端提示' : '展开客户端提示'}
              title={clientHintsOpen ? '收起客户端提示' : '展开客户端提示'}
              className="size-9"
              onClick={() => setClientHintsOpen((open) => !open)}
            >
              <HugeiconsIcon icon={ListViewIcon} strokeWidth={2} />
            </Button>
          </div>

          {clientHintsOpen ? (
            <ClientHintsPanel
              clientHints={clientHints}
              mode={mode}
              updateField={updateField}
            />
          ) : null}
        </div>
      </EditorFieldRow>
    </div>
  );
}

function ClientHintsPanel({
  clientHints,
  mode,
  updateField,
}: {
  clientHints: {
    platform: string;
    platformVersion: string;
    architecture: string;
    uaFullVersion: string;
  };
  mode: UserAgentMode;
  updateField: UpdateProfileEditorField;
}) {
  if (mode === 'random') {
    return (
      <div className="rounded-lg border border-dashed border-border/80 p-3">
        <div className="mb-2 text-xs font-medium text-muted-foreground">
          客户端提示
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <HintValue label="平台" value={clientHints.platform} />
          <HintValue label="平台版本" value={clientHints.platformVersion} />
          <HintValue label="架构" value={clientHints.architecture} />
          <HintValue label="UA 完整版本" value={clientHints.uaFullVersion} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-border/80 p-3">
      <div className="mb-2 text-xs font-medium text-muted-foreground">
        客户端提示
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <HintInput
          id="profile-editor-client-platform"
          label="平台"
          value={clientHints.platform}
          onChange={(value) => updateField('platform', value)}
        />
        <HintInput
          id="profile-editor-platform-version"
          label="平台版本"
          value={clientHints.platformVersion}
          onChange={(value) => updateField('platformVersion', value)}
        />
        <HintInput
          id="profile-editor-architecture"
          label="架构"
          value={clientHints.architecture}
          onChange={(value) => updateField('architecture', value)}
        />
        <HintInput
          id="profile-editor-ua-full-version"
          label="UA 完整版本"
          value={clientHints.uaFullVersion}
          onChange={(value) => updateField('uaFullVersion', value)}
        />
      </div>
    </div>
  );
}

function HintInput({
  id,
  label,
  onChange,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <Field className="gap-1">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup className="h-8">
        <InputGroupInput
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </InputGroup>
    </Field>
  );
}

function HintValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="truncate rounded-md bg-muted/60 px-2 py-2 text-xs text-muted-foreground">
      <span className="font-medium">{label}:</span> {value || '-'}
    </div>
  );
}

function randomChromeVersion(defaults: SystemFingerprintDefaults) {
  void defaults;
  return chromeFullVersion;
}

function platformVersionForCurrentSystem(
  system: BrowserSystemOption,
  version: BrowserVersion,
  defaults: SystemFingerprintDefaults,
) {
  if (system.value === 'windows') {
    return version.platformVersion;
  }

  return normalizedVersion(defaults.platformVersion) || version.platformVersion;
}

function normalizedVersion(value: string) {
  const match = value.trim().match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);

  if (!match) {
    return '';
  }

  return `${match[1]}.${match[2] ?? '0'}.${match[3] ?? '0'}`;
}

function resolveSystemOption(value: string): BrowserSystemOption {
  return (
    browserSystems.find((system) => system.value === value) ?? browserSystems[0]
  );
}

function SystemLogo({ system }: { system: BrowserSystemOption }) {
  return (
    <span
      aria-hidden
      className="flex size-4 shrink-0 items-center justify-center text-foreground"
    >
      {system.value === 'windows' ? <WindowsLogoMark /> : <AppleLogoMark />}
    </span>
  );
}

function AppleLogoMark() {
  return (
    <svg aria-hidden viewBox="0 0 384 512" className="size-3.5 fill-current">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.6 17.9 76.4 17.9 48.6-.7 90.4-82.5 103.2-119.3-65.2-30.7-61.7-90-62.3-91.9zM278.1 163.9c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function WindowsLogoMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-3.5">
      <path fill="#0078D4" d="M3 4.6 10.8 3v8.4H3V4.6z" />
      <path fill="#0078D4" d="M12.2 2.8 21 1.3v10.1h-8.8V2.8z" />
      <path fill="#0078D4" d="M3 12.6h7.8V21L3 19.4v-6.8z" />
      <path fill="#0078D4" d="M12.2 12.6H21v10.1l-8.8-1.5v-8.6z" />
    </svg>
  );
}
