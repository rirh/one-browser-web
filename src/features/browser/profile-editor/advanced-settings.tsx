import {
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { FieldErrors } from 'react-hook-form';

import {
  GeolocationField,
  LanguageField,
  TimezoneField,
  WebrtcField,
} from './advanced-network-fields';
import { WebglInfoField } from './advanced-webgl-field';
import { EditorFieldRow } from './editor-controls';
import { HardwareFingerprintFields } from './hardware-fingerprint-fields';
import type {
  ProfileEditorForm,
  SystemFingerprintDefaults,
  UpdateProfileEditorField,
} from './types';

export function AdvancedSettings({
  defaults,
  errors,
  form,
  open,
  updateField,
}: {
  defaults: SystemFingerprintDefaults;
  errors: FieldErrors<ProfileEditorForm>;
  form: ProfileEditorForm;
  open: boolean;
  updateField: UpdateProfileEditorField;
}) {
  return (
    <>
      {!open ? (
        <CollapsibleTrigger className="mx-auto flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
          显示高级设置
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={2}
            className="size-3 shrink-0"
          />
        </CollapsibleTrigger>
      ) : null}
      <CollapsibleContent>
        <div className="flex flex-col gap-4 rounded-md border border-border/70 p-3">
          <FieldSet>
            <FieldLegend>系统指纹</FieldLegend>
            <FieldGroup>
              <EditorFieldRow label="缩放">
                <Input
                  id="profile-editor-device-scale"
                  value={form.deviceScale}
                  placeholder={defaults.deviceScale || '1'}
                  inputMode="decimal"
                  onChange={(event) =>
                    updateField('deviceScale', event.target.value)
                  }
                  className="max-w-sm"
                />
              </EditorFieldRow>
            </FieldGroup>
          </FieldSet>

          <Separator />

          <FieldSet>
            <FieldLegend>网络与位置</FieldLegend>
            <FieldGroup>
              <WebrtcField form={form} updateField={updateField} />
              <TimezoneField
                defaults={defaults}
                form={form}
                updateField={updateField}
              />
              <GeolocationField
                errors={errors}
                form={form}
                updateField={updateField}
              />
              <LanguageField
                defaults={defaults}
                form={form}
                updateField={updateField}
              />
            </FieldGroup>
          </FieldSet>

          <Separator />

          <FieldSet>
            <FieldLegend>图形与设备</FieldLegend>
            <FieldGroup>
              <WebglInfoField
                defaults={defaults}
                form={form}
                updateField={updateField}
              />
              <HardwareFingerprintFields
                defaults={defaults}
                form={form}
                updateField={updateField}
              />
              <FieldDescription>
                留空或选择基于 IP 时，使用当前系统与出口 IP 推导值。
              </FieldDescription>
            </FieldGroup>
          </FieldSet>
        </div>
        <CollapsibleTrigger className="mx-auto mt-3 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
          收起高级设置
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            strokeWidth={2}
            className="size-3 shrink-0 rotate-180"
          />
        </CollapsibleTrigger>
      </CollapsibleContent>
    </>
  );
}
