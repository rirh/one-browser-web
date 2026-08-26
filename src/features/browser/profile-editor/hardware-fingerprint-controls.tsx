import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Refresh01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { HTMLAttributes, ReactNode } from 'react';

import { CompactTabs, EditorFieldRow } from './editor-controls';
import {
  type MediaDevicesMode,
  type ModeOption,
  type NumericValueOption,
  type RealManualRandomMode,
  formatNumericValue,
  realManualRandomOptions,
  selectedNumericValueOption,
} from './hardware-fingerprint-model';
import type {
  ProfileEditorForm,
  SystemFingerprintDefaults,
  UpdateProfileEditorField,
} from './types';

export function SwitchTile({
  checked,
  id,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  id: string;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <Field
      orientation="horizontal"
      className="w-fit flex-row items-center gap-2 p-0"
    >
      <Switch
        id={id}
        size="sm"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <FieldLabel htmlFor={id} className="text-sm">
        {label}
      </FieldLabel>
    </Field>
  );
}

export function MediaDevicesManualFields({
  defaults,
  form,
  updateField,
}: {
  defaults: SystemFingerprintDefaults;
  form: ProfileEditorForm;
  updateField: UpdateProfileEditorField;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <CompactCountInput
        id="profile-editor-media-audio-inputs"
        label="音频输入"
        value={form.mediaAudioInputs}
        placeholder={defaults.mediaAudioInputs || '1'}
        onChange={(value) => updateField('mediaAudioInputs', value)}
      />
      <CompactCountInput
        id="profile-editor-media-audio-outputs"
        label="音频输出"
        value={form.mediaAudioOutputs}
        placeholder={defaults.mediaAudioOutputs || '1'}
        onChange={(value) => updateField('mediaAudioOutputs', value)}
      />
      <CompactCountInput
        id="profile-editor-media-video-inputs"
        label="视频输入"
        value={form.mediaVideoInputs}
        placeholder={defaults.mediaVideoInputs || '1'}
        onChange={(value) => updateField('mediaVideoInputs', value)}
      />
    </div>
  );
}

function CompactCountInput({
  id,
  label,
  onChange,
  placeholder,
  value,
}: {
  id: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <Field className="gap-1">
      <FieldLabel htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </FieldLabel>
      <InputGroup className="h-8">
        <InputGroupInput
          id={id}
          min={0}
          max={128}
          step={1}
          type="number"
          inputMode="numeric"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </InputGroup>
    </Field>
  );
}

export function ModeTabsField<T extends string>({
  children,
  label,
  onValueChange,
  options,
  value,
}: {
  children?: ReactNode;
  label: string;
  onValueChange: (value: T) => void;
  options: Array<ModeOption<T>>;
  value: T;
}) {
  return (
    <EditorFieldRow label={label}>
      <div className="flex min-w-0 flex-col gap-2">
        <CompactTabs
          value={value}
          options={options}
          onValueChange={onValueChange}
        />
        {children}
      </div>
    </EditorFieldRow>
  );
}

export function RandomizedInputField({
  id,
  inputMode,
  label,
  mode,
  onModeChange,
  onRefresh,
  onValueChange,
  placeholder,
  value,
}: {
  id: string;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  label: string;
  mode: RealManualRandomMode;
  onModeChange: (mode: RealManualRandomMode) => void;
  onRefresh: () => void;
  onValueChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <ModeTabsField
      label={label}
      value={mode}
      options={realManualRandomOptions}
      onValueChange={onModeChange}
    >
      {mode !== 'real' ? (
        <CompactInput
          id={id}
          inputMode={inputMode}
          value={value}
          readOnly={mode === 'random'}
          placeholder={placeholder}
          onChange={onValueChange}
          onRefresh={mode === 'random' ? onRefresh : undefined}
        />
      ) : null}
    </ModeTabsField>
  );
}

export function RandomizedSelectField({
  id,
  label,
  mode,
  onModeChange,
  onRefresh,
  onValueChange,
  options,
  placeholder,
  unitLabel,
  value,
}: {
  id: string;
  label: string;
  mode: RealManualRandomMode;
  onModeChange: (mode: RealManualRandomMode) => void;
  onRefresh: () => void;
  onValueChange: (value: string) => void;
  options: NumericValueOption[];
  placeholder: string;
  unitLabel: string;
  value: string;
}) {
  const selectedOption = selectedNumericValueOption(options, value);
  return (
    <ModeTabsField
      label={label}
      value={mode}
      options={realManualRandomOptions}
      onValueChange={onModeChange}
    >
      {mode === 'manual' ? (
        <Combobox
          items={options}
          value={selectedOption}
          isItemEqualToValue={(item, nextValue) =>
            item.value === nextValue.value
          }
          itemToStringLabel={(option: NumericValueOption) => option.label}
          itemToStringValue={(option: NumericValueOption) => option.value}
          onValueChange={(option: NumericValueOption | null) =>
            onValueChange(option?.value ?? '')
          }
        >
          <ComboboxInput
            id={id}
            placeholder={placeholder}
            showClear
            className="w-full"
          />
          <ComboboxContent>
            <ComboboxEmpty>没有匹配的选项</ComboboxEmpty>
            <ComboboxList>
              {(option: NumericValueOption) => (
                <ComboboxItem key={option.value} value={option}>
                  {option.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      ) : null}

      {mode === 'random' ? (
        <CompactInput
          id={id}
          value={formatNumericValue(value, unitLabel)}
          readOnly
          placeholder={placeholder}
          onChange={() => undefined}
          onRefresh={onRefresh}
        />
      ) : null}
    </ModeTabsField>
  );
}

function CompactInput({
  id,
  inputMode,
  onChange,
  onRefresh,
  placeholder,
  readOnly,
  value,
}: {
  id: string;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  onChange: (value: string) => void;
  onRefresh?: () => void;
  placeholder: string;
  readOnly?: boolean;
  value: string;
}) {
  return (
    <InputGroup className="h-8">
      <InputGroupInput
        id={id}
        inputMode={inputMode}
        readOnly={readOnly}
        value={value}
        placeholder={placeholder}
        className={cn(readOnly && 'text-muted-foreground')}
        onChange={(event) => onChange(event.target.value)}
      />
      {onRefresh ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-sm"
            aria-label={`重新生成 ${placeholder}`}
            onClick={onRefresh}
          >
            <HugeiconsIcon icon={Refresh01Icon} strokeWidth={2} />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}

export type { MediaDevicesMode };
