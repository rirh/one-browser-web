import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { FieldDescription, FieldGroup } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { useMemo, useState } from 'react';

import { EditorFieldRow } from './editor-controls';
import { defaultAdditionalFontsValue } from './font-options';
import { FontsManualPanel } from './fonts-manual-panel';
import {
  MediaDevicesManualFields,
  ModeTabsField,
  RandomizedInputField,
  RandomizedSelectField,
  SwitchTile,
} from './hardware-fingerprint-controls';
import {
  type AutoManualMode,
  type MediaDevicesMode,
  type NoiseFieldName,
  type RealManualMode,
  type RealManualRandomMode,
  type ScreenResolutionOption,
  autoManualOptions,
  baseCpuCoreOptions,
  baseRamGbOptions,
  doNotTrackOptions,
  explicitDeviceName,
  hardwareProfiles,
  isMediaDevicesMode,
  isRealManualMode,
  mediaDevicesOptions,
  noiseFields,
  normalizeNumericValue,
  normalizedMacAddress,
  numericValueOptions,
  randomItem,
  randomMacAddress,
  randomNearbyHardwareValue,
  realManualOptions,
  resolveHardwareSystem,
  screenResolutionOptionsWithCurrent,
  selectedScreenResolutionOption,
  webgpuOptions,
} from './hardware-fingerprint-model';
import type {
  ProfileEditorForm,
  SystemFingerprintDefaults,
  UpdateProfileEditorField,
} from './types';

type HardwareFingerprintFieldsProps = {
  defaults: SystemFingerprintDefaults;
  form: ProfileEditorForm;
  updateField: UpdateProfileEditorField;
};

export function HardwareFingerprintFields({
  defaults,
  form,
  updateField,
}: HardwareFingerprintFieldsProps) {
  const [cpuMode, setCpuMode] = useState<RealManualRandomMode>(
    form.cpuCores.trim() ? 'manual' : 'real',
  );
  const [ramMode, setRamMode] = useState<RealManualRandomMode>(
    form.ramGb.trim() ? 'manual' : 'real',
  );
  const [deviceNameMode, setDeviceNameMode] = useState<RealManualRandomMode>(
    form.deviceName.trim() ? 'manual' : 'real',
  );
  const [macAddressMode, setMacAddressMode] = useState<RealManualRandomMode>(
    form.macAddress.trim() ? 'manual' : 'real',
  );

  const hardwareSystem = resolveHardwareSystem(defaults.system);
  const hardwareProfile = hardwareProfiles[hardwareSystem];
  const screenMode = isRealManualMode(form.screenMode)
    ? form.screenMode
    : 'real';
  const fontsMode = form.fontsMode === 'manual' ? 'manual' : 'auto';
  const webgpuMode = form.webgpuMode === 'off' ? 'off' : 'on';
  const mediaDevicesMode = isMediaDevicesMode(form.mediaDevicesMode)
    ? form.mediaDevicesMode
    : 'auto';
  const doNotTrackMode = form.doNotTrack === 'on' ? 'on' : 'off';
  const activeCpuMode = form.cpuCores.trim() ? cpuMode : 'real';
  const activeRamMode = form.ramGb.trim() ? ramMode : 'real';
  const activeDeviceNameMode = form.deviceName.trim() ? deviceNameMode : 'real';
  const activeMacAddressMode = form.macAddress.trim() ? macAddressMode : 'real';
  const screenResolutionOptions = useMemo(
    () => screenResolutionOptionsWithCurrent(form.screenResolution),
    [form.screenResolution],
  );
  const cpuCoreOptions = useMemo(
    () => numericValueOptions(baseCpuCoreOptions, 'cores', form.cpuCores),
    [form.cpuCores],
  );
  const ramGbOptions = useMemo(
    () => numericValueOptions(baseRamGbOptions, 'GB', form.ramGb),
    [form.ramGb],
  );
  const selectedScreenResolution = form.screenResolution.trim()
    ? selectedScreenResolutionOption(
        screenResolutionOptions,
        form.screenResolution,
      )
    : null;

  function setNoiseField(key: NoiseFieldName, checked: boolean) {
    updateField(key, checked ? defaults[key] || 'Noise' : 'off');
  }
  function setScreenMode(mode: RealManualMode) {
    updateField('screenMode', mode);
    if (mode === 'real') updateField('screenResolution', '');
  }
  function setFontsMode(mode: AutoManualMode) {
    updateField('fontsMode', mode);
    if (mode === 'auto') {
      updateField('fonts', '');
      return;
    }
    updateField('fonts', form.fonts || defaultAdditionalFontsValue);
  }
  function setCpuModeValue(mode: RealManualRandomMode) {
    setCpuMode(mode);
    if (mode === 'real') {
      updateField('cpuCores', '');
      return;
    }
    if (mode === 'random') {
      randomizeCpuCores();
      return;
    }
    updateField(
      'cpuCores',
      normalizeNumericValue(form.cpuCores || defaults.cpuCores) || '8',
    );
  }
  function randomizeCpuCores() {
    const nextValue = randomNearbyHardwareValue(
      hardwareProfile.cpuCores,
      defaults.cpuCores,
    );
    setCpuMode('random');
    updateField('cpuCores', nextValue);
  }
  function setRamModeValue(mode: RealManualRandomMode) {
    setRamMode(mode);
    if (mode === 'real') {
      updateField('ramGb', '');
      return;
    }
    if (mode === 'random') {
      randomizeRamGb();
      return;
    }
    updateField(
      'ramGb',
      normalizeNumericValue(form.ramGb || defaults.ramGb) || '8',
    );
  }
  function randomizeRamGb() {
    const nextValue = randomNearbyHardwareValue(
      hardwareProfile.ramGb,
      defaults.ramGb,
    );
    setRamMode('random');
    updateField('ramGb', nextValue);
  }
  function setMediaDevicesMode(mode: MediaDevicesMode) {
    updateField('mediaDevicesMode', mode);
    if (mode !== 'manual') {
      updateField('mediaAudioInputs', '');
      updateField('mediaAudioOutputs', '');
      updateField('mediaVideoInputs', '');
      return;
    }
    updateField('mediaAudioInputs', form.mediaAudioInputs || '1');
    updateField('mediaAudioOutputs', form.mediaAudioOutputs || '1');
    updateField('mediaVideoInputs', form.mediaVideoInputs || '1');
  }
  function setDeviceNameModeValue(mode: RealManualRandomMode) {
    setDeviceNameMode(mode);
    if (mode === 'real') {
      updateField('deviceName', '');
      return;
    }
    if (mode === 'random') {
      randomizeDeviceName();
      return;
    }
    updateField('deviceName', form.deviceName || defaults.deviceName || '设备');
  }
  function randomizeDeviceName() {
    if (explicitDeviceName(defaults.deviceName)) {
      setDeviceNameMode('random');
      updateField('deviceName', defaults.deviceName);
      return;
    }
    const nextValue =
      hardwareSystem === 'windows'
        ? `${randomItem(hardwareProfile.deviceNames)}-${Math.floor(Math.random() * 900000) + 100000}`
        : randomItem(hardwareProfile.deviceNames);
    setDeviceNameMode('random');
    updateField('deviceName', nextValue);
  }
  function setMacAddressModeValue(mode: RealManualRandomMode) {
    setMacAddressMode(mode);
    if (mode === 'real') {
      updateField('macAddress', '');
      return;
    }
    if (mode === 'random') {
      randomizeMacAddress();
      return;
    }
    updateField(
      'macAddress',
      form.macAddress ||
        normalizedMacAddress(defaults.macAddress) ||
        '02:00:00:00:00:01',
    );
  }
  function randomizeMacAddress() {
    setMacAddressMode('random');
    updateField('macAddress', randomMacAddress());
  }

  return (
    <FieldGroup className="gap-3">
      <ModeTabsField
        label="WebGPU"
        value={webgpuMode}
        options={webgpuOptions}
        onValueChange={(mode) => updateField('webgpuMode', mode)}
      />
      <EditorNoiseFields form={form} setNoiseField={setNoiseField} />
      <Separator />
      <div className="flex flex-col gap-3">
        <ModeTabsField
          label="屏幕"
          value={screenMode}
          options={realManualOptions}
          onValueChange={setScreenMode}
        >
          {screenMode === 'manual' ? (
            <Combobox
              items={screenResolutionOptions}
              value={selectedScreenResolution}
              isItemEqualToValue={(item, value) => item.value === value.value}
              itemToStringLabel={(option: ScreenResolutionOption) =>
                option.label
              }
              itemToStringValue={(option: ScreenResolutionOption) =>
                option.value
              }
              onValueChange={(option: ScreenResolutionOption | null) =>
                updateField('screenResolution', option?.value ?? '')
              }
            >
              <ComboboxInput
                id="profile-editor-screen-resolution"
                placeholder="选择分辨率"
                showClear
                className="w-full"
              />
              <ComboboxContent>
                <ComboboxEmpty>没有匹配的分辨率</ComboboxEmpty>
                <ComboboxList>
                  {(option: ScreenResolutionOption) => (
                    <ComboboxItem key={option.value} value={option}>
                      {option.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          ) : null}
        </ModeTabsField>

        <ModeTabsField
          label="字体"
          value={fontsMode}
          options={autoManualOptions}
          onValueChange={setFontsMode}
        >
          {fontsMode === 'manual' ? (
            <div className="flex flex-col gap-1.5">
              <FontsManualPanel
                defaults={defaults}
                form={form}
                updateField={updateField}
              />
              <FieldDescription>
                字体名单当前仅保存，尚未覆盖 Chromium 的字体枚举结果。
              </FieldDescription>
            </div>
          ) : null}
        </ModeTabsField>

        <RandomizedSelectField
          id="profile-editor-hardware-cpu"
          label="CPU"
          mode={activeCpuMode}
          value={form.cpuCores}
          options={cpuCoreOptions}
          placeholder="选择 CPU 核心数"
          unitLabel="cores"
          onModeChange={setCpuModeValue}
          onValueChange={(value) => {
            setCpuMode('manual');
            updateField('cpuCores', value);
          }}
          onRefresh={randomizeCpuCores}
        />
        <RandomizedSelectField
          id="profile-editor-hardware-ram"
          label="RAM"
          mode={activeRamMode}
          value={form.ramGb}
          options={ramGbOptions}
          placeholder="选择内存"
          unitLabel="GB"
          onModeChange={setRamModeValue}
          onValueChange={(value) => {
            setRamMode('manual');
            updateField('ramGb', value);
          }}
          onRefresh={randomizeRamGb}
        />
        <ModeTabsField
          label="媒体设备"
          value={mediaDevicesMode}
          options={mediaDevicesOptions}
          onValueChange={setMediaDevicesMode}
        >
          {mediaDevicesMode === 'manual' ? (
            <MediaDevicesManualFields
              defaults={defaults}
              form={form}
              updateField={updateField}
            />
          ) : (
            <FieldDescription>
              自动和真实模式使用当前设备列表。
            </FieldDescription>
          )}
        </ModeTabsField>
        <RandomizedInputField
          id="profile-editor-hardware-device-name"
          label="设备名称"
          mode={activeDeviceNameMode}
          value={form.deviceName}
          placeholder={defaults.deviceName}
          onModeChange={setDeviceNameModeValue}
          onValueChange={(value) => {
            setDeviceNameMode('manual');
            updateField('deviceName', value);
          }}
          onRefresh={randomizeDeviceName}
        />
        <RandomizedInputField
          id="profile-editor-hardware-mac-address"
          label="MAC 地址"
          mode={activeMacAddressMode}
          value={form.macAddress}
          placeholder={defaults.macAddress}
          onModeChange={setMacAddressModeValue}
          onValueChange={(value) => {
            setMacAddressMode('manual');
            updateField('macAddress', value);
          }}
          onRefresh={randomizeMacAddress}
        />
        <ModeTabsField
          label="请勿跟踪"
          value={doNotTrackMode}
          options={doNotTrackOptions}
          onValueChange={(mode) => updateField('doNotTrack', mode)}
        />
      </div>
    </FieldGroup>
  );
}

function EditorNoiseFields({
  form,
  setNoiseField,
}: {
  form: ProfileEditorForm;
  setNoiseField: (key: NoiseFieldName, checked: boolean) => void;
}) {
  return (
    <EditorFieldRow label="硬件噪声">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {noiseFields.map((field) => (
          <SwitchTile
            key={field.key}
            id={`profile-editor-hardware-${field.key}`}
            label={field.label}
            checked={form[field.key].trim() !== 'off'}
            onCheckedChange={(checked) => setNoiseField(field.key, checked)}
          />
        ))}
      </div>
    </EditorFieldRow>
  );
}
