import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useMemo, useState } from 'react';
import type { FieldErrors } from 'react-hook-form';

import {
  type LanguageOption,
  type TimeZoneOption,
  autoManualOptions,
  languageOptionsWithCurrent,
  selectedLanguageOption,
  timeZoneOptions,
  webrtcModeOptions,
} from './advanced-options';
import { CompactTabs, EditorFieldRow } from './editor-controls';
import type {
  ProfileEditorForm,
  SystemFingerprintDefaults,
  UpdateProfileEditorField,
} from './types';

export function GeolocationField({
  errors,
  form,
  updateField,
}: {
  errors: FieldErrors<ProfileEditorForm>;
  form: ProfileEditorForm;
  updateField: UpdateProfileEditorField;
}) {
  const manualMode = form.geolocationMode === 'manual';
  return (
    <EditorFieldRow label="地理位置" controlClassName="flex flex-col gap-2">
      <CompactTabs
        value={manualMode ? 'manual' : 'auto'}
        onValueChange={(value) => {
          if (value === 'auto') {
            updateField('geolocationMode', 'auto');
            updateField('latitude', '');
            updateField('longitude', '');
            updateField('accuracy', '');
          }
          if (value === 'manual') updateField('geolocationMode', 'manual');
        }}
        options={autoManualOptions}
      />
      {!manualMode ? (
        <FieldDescription>
          基于 IP 会校验国家、时区和语言；精确坐标需选择自定义。
        </FieldDescription>
      ) : null}
      {manualMode ? (
        <div className="grid gap-3 md:grid-cols-3">
          <NumberTextField
            error={errors.latitude}
            id="profile-editor-latitude"
            label="纬度"
            hideLabel
            value={form.latitude}
            placeholder="纬度"
            onChange={(value) => updateField('latitude', value)}
          />
          <NumberTextField
            error={errors.longitude}
            id="profile-editor-longitude"
            label="经度"
            hideLabel
            value={form.longitude}
            placeholder="经度"
            onChange={(value) => updateField('longitude', value)}
          />
          <NumberTextField
            error={errors.accuracy}
            id="profile-editor-accuracy"
            label="精度(m)"
            hideLabel
            min={10}
            value={form.accuracy}
            placeholder="10"
            onChange={(value) => updateField('accuracy', value)}
          />
        </div>
      ) : null}
    </EditorFieldRow>
  );
}

export function LanguageField({
  defaults,
  form,
  updateField,
}: {
  defaults: SystemFingerprintDefaults;
  form: ProfileEditorForm;
  updateField: UpdateProfileEditorField;
}) {
  const [languageMode, setLanguageMode] = useState<'auto' | 'manual'>(
    form.locale.trim().length > 0 || form.acceptLanguages.trim().length > 0
      ? 'manual'
      : 'auto',
  );
  const options = useMemo(
    () => languageOptionsWithCurrent(form.locale || defaults.locale),
    [defaults.locale, form.locale],
  );
  const manualMode =
    languageMode === 'manual' ||
    form.locale.trim().length > 0 ||
    form.acceptLanguages.trim().length > 0;
  const selectedOption =
    form.locale.trim().length > 0 || form.acceptLanguages.trim().length > 0
      ? selectedLanguageOption(options, form.locale, form.acceptLanguages)
      : null;
  const applyLanguage = (option: LanguageOption | null) => {
    updateField('locale', option?.value ?? '');
    updateField('acceptLanguages', option?.acceptLanguages ?? '');
  };

  return (
    <EditorFieldRow label="语言" controlClassName="flex flex-col gap-2">
      <CompactTabs
        value={manualMode ? 'manual' : 'auto'}
        onValueChange={(value) => {
          if (value === 'auto') {
            setLanguageMode('auto');
            applyLanguage(null);
          }
          if (value === 'manual') setLanguageMode('manual');
        }}
        options={autoManualOptions}
      />
      {manualMode ? (
        <Combobox
          items={options}
          value={selectedOption}
          isItemEqualToValue={(item, value) => item.value === value.value}
          itemToStringLabel={(option: LanguageOption) => option.label}
          itemToStringValue={(option: LanguageOption) => option.value}
          onValueChange={applyLanguage}
        >
          <ComboboxInput
            id="profile-editor-language"
            placeholder="选择语言"
            showClear
            className="w-full"
          />
          <ComboboxContent>
            <ComboboxEmpty>没有匹配的语言</ComboboxEmpty>
            <ComboboxList>
              {(option: LanguageOption) => (
                <ComboboxItem key={option.value} value={option}>
                  {option.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      ) : null}
    </EditorFieldRow>
  );
}

export function TimezoneField({
  defaults,
  form,
  updateField,
}: {
  defaults: SystemFingerprintDefaults;
  form: ProfileEditorForm;
  updateField: UpdateProfileEditorField;
}) {
  const options = useMemo(
    () => timeZoneOptions(defaults.timeZone, form.timeZone),
    [defaults.timeZone, form.timeZone],
  );
  const manualMode = form.timeZone.trim().length > 0;
  const selectedOption =
    options.find((option) => option.value === form.timeZone) ?? null;
  return (
    <EditorFieldRow label="时区" controlClassName="flex flex-col gap-2">
      <CompactTabs
        value={manualMode ? 'manual' : 'auto'}
        onValueChange={(value) => {
          if (value === 'auto') updateField('timeZone', '');
          if (value === 'manual') {
            updateField(
              'timeZone',
              form.timeZone || defaults.timeZone || 'Asia/Shanghai',
            );
          }
        }}
        options={autoManualOptions}
      />
      {manualMode ? (
        <Combobox
          items={options}
          value={selectedOption}
          isItemEqualToValue={(item, value) => item.value === value.value}
          itemToStringLabel={(option: TimeZoneOption) => option.label}
          itemToStringValue={(option: TimeZoneOption) => option.value}
          onValueChange={(option: TimeZoneOption | null) =>
            updateField('timeZone', option?.value ?? '')
          }
        >
          <ComboboxInput
            id="profile-editor-timezone"
            placeholder="选择时区"
            showClear
            className="w-full"
          />
          <ComboboxContent>
            <ComboboxEmpty>没有匹配的时区</ComboboxEmpty>
            <ComboboxList>
              {(option: TimeZoneOption) => (
                <ComboboxItem key={option.value} value={option}>
                  {option.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      ) : null}
    </EditorFieldRow>
  );
}

export function WebrtcField({
  form,
  updateField,
}: {
  form: ProfileEditorForm;
  updateField: UpdateProfileEditorField;
}) {
  const mode = form.webrtcMode || 'auto';
  const manualMode = mode === 'manual';
  return (
    <EditorFieldRow label="WebRTC" controlClassName="flex flex-col gap-2">
      <CompactTabs
        className="w-full"
        listClassName="grid w-full grid-cols-4 overflow-hidden"
        itemClassName="w-full min-w-0 px-2"
        value={mode}
        onValueChange={(value) => updateField('webrtcMode', value)}
        options={webrtcModeOptions}
      />
      {manualMode ? (
        <div className="flex flex-col gap-1.5">
          <Input
            id="profile-editor-webrtc-ip"
            value={form.webrtcIp}
            onChange={(event) => updateField('webrtcIp', event.target.value)}
            placeholder="IP 地址"
          />
          <FieldDescription>
            指定 IP 仅参与一致性检查，当前不会改写 WebRTC 候选地址。
          </FieldDescription>
        </div>
      ) : (
        <div className="flex min-h-10 items-center justify-between gap-2.5 rounded-md border border-border/70 px-2.5 py-1.5">
          <div className="min-w-0">
            <div className="truncate text-xs font-medium">
              通过代理路由 UDP 流量
            </div>
            <div className="truncate text-xs text-muted-foreground">
              需要代理支持 UDP，否则将被阻止。
            </div>
          </div>
          <Switch
            id="profile-editor-route-udp"
            aria-label="通过代理路由 UDP 流量"
            checked={form.routeUdpViaProxy}
            onCheckedChange={(checked) =>
              updateField('routeUdpViaProxy', checked)
            }
          />
        </div>
      )}
    </EditorFieldRow>
  );
}

function NumberTextField({
  error,
  hideLabel = false,
  id,
  label,
  min,
  onChange,
  placeholder,
  value,
}: {
  error?: { message?: string };
  hideLabel?: boolean;
  id: string;
  label: string;
  min?: number;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  const invalid = Boolean(error);
  return (
    <Field data-invalid={invalid}>
      <FieldLabel className={hideLabel ? 'sr-only' : undefined} htmlFor={id}>
        {label}
      </FieldLabel>
      <Input
        id={id}
        aria-invalid={invalid}
        value={value}
        inputMode="decimal"
        min={min}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}
