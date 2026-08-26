import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DialogActionButton } from '@/components/ui/dialog-action-button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { FolderOpenIcon, Upload01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as React from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import {
  type BrowserAssetUploadFormValues,
  DEFAULT_BROWSER_ASSET_UPLOAD_FORM_VALUES,
  browserAssetUploadSchema,
  formatBytes,
  parseChromiumAssetFileName,
} from '../model/upload-form';
import type { BrowserAssetResource } from '../types';
import {
  type BrowserAssetUploadProgress,
  uploadBrowserAssetPackage,
} from '../upload-request';
import { RequiredFieldLabel, SelectField } from './upload-form-fields';

type BrowserAssetUploadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (asset: BrowserAssetResource) => void;
};

export function BrowserAssetUploadDialog({
  open,
  onOpenChange,
  onUploaded,
}: BrowserAssetUploadDialogProps) {
  const [error, setError] = React.useState('');
  const [progress, setProgress] =
    React.useState<BrowserAssetUploadProgress | null>(null);
  const archiveInputRef = React.useRef<HTMLInputElement>(null);
  const archiveNameInputId = React.useId();
  const archiveFileInputId = React.useId();
  const sha256InputId = React.useId();
  const platformInputId = React.useId();
  const archInputId = React.useId();
  const versionInputId = React.useId();
  const makeCurrentInputId = React.useId();
  const remarkInputId = React.useId();
  const form = useForm<BrowserAssetUploadFormValues>({
    resolver: zodResolver(browserAssetUploadSchema),
    defaultValues: DEFAULT_BROWSER_ASSET_UPLOAD_FORM_VALUES,
  });
  const file =
    useWatch({ control: form.control, name: 'file' }) ??
    DEFAULT_BROWSER_ASSET_UPLOAD_FORM_VALUES.file;
  const parsedArchive = file ? parseChromiumAssetFileName(file.name) : null;
  const { errors, isSubmitting } = form.formState;

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetForm();
    }
  }

  function resetForm() {
    form.reset(DEFAULT_BROWSER_ASSET_UPLOAD_FORM_VALUES);
    setError('');
    setProgress(null);
  }

  function handleArchiveSelection(files: FileList | null) {
    const nextFile = files?.item(0) ?? null;
    const shouldValidate = form.formState.submitCount > 0;
    form.setValue('file', nextFile, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue('sha256', '', {
      shouldDirty: true,
      shouldValidate,
    });
    form.clearErrors('sha256');
    setError('');

    if (!nextFile) {
      form.setValue('version', '', { shouldDirty: true, shouldValidate });
      return;
    }

    const parsed = parseChromiumAssetFileName(nextFile.name);
    if (!parsed) {
      form.setValue('version', '', { shouldDirty: true, shouldValidate });
      return;
    }

    form.setValue('platform', parsed.platform, {
      shouldDirty: true,
      shouldValidate,
    });
    form.setValue('arch', parsed.arch, {
      shouldDirty: true,
      shouldValidate,
    });
    form.setValue('version', parsed.version, {
      shouldDirty: true,
      shouldValidate,
    });
    form.setValue('sha256', parsed.sha256 ?? '', {
      shouldDirty: true,
      shouldValidate,
    });
  }

  async function handleSubmit(values: BrowserAssetUploadFormValues) {
    setError('');
    const uploadFile = values.file;
    if (!uploadFile) {
      return;
    }

    try {
      const asset = await uploadBrowserAssetPackage({
        uploadFile,
        values,
        onProgress: setProgress,
      });
      onUploaded(asset);
      onOpenChange(false);
      resetForm();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '上传失败');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[86svh] overflow-hidden p-0 sm:max-w-2xl">
        <form
          noValidate
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex max-h-[86svh] min-h-0 flex-col"
        >
          <DialogHeader className="gap-0.5 bg-muted/50 px-4 py-2 pr-12 text-left">
            <DialogTitle className="text-sm font-semibold">
              上传安装包
            </DialogTitle>
            <DialogDescription className="text-xs/relaxed">
              小包可直传，大包使用分片上传到 OneFile 后设为客户端下载版本。
            </DialogDescription>
          </DialogHeader>

          {progress ? (
            <Field className="shrink-0 gap-2 px-4 py-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{progress.label}</span>
                <span>{progress.value}%</span>
              </div>
              <Progress value={progress.value} />
            </Field>
          ) : null}

          <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
            <FieldGroup className="gap-4">
              {error ? (
                <Alert variant="destructive">
                  <AlertTitle>上传失败</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <Field data-invalid={Boolean(errors.file)}>
                <RequiredFieldLabel htmlFor={archiveNameInputId} required>
                  选择安装包
                </RequiredFieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id={archiveNameInputId}
                    value={file?.name ?? ''}
                    placeholder="请选择 .tar.gz 安装包"
                    readOnly
                    aria-invalid={Boolean(errors.file)}
                    aria-required="true"
                    className="truncate"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="sm"
                      disabled={isSubmitting}
                      aria-controls={archiveFileInputId}
                      onClick={() => archiveInputRef.current?.click()}
                    >
                      <HugeiconsIcon
                        icon={FolderOpenIcon}
                        strokeWidth={2}
                        data-icon="inline-start"
                      />
                      选择文件
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <input
                  ref={archiveInputRef}
                  id={archiveFileInputId}
                  type="file"
                  accept=".tar.gz,application/gzip"
                  className="sr-only"
                  disabled={isSubmitting}
                  aria-label="选择安装包文件"
                  onChange={(event) =>
                    handleArchiveSelection(event.currentTarget.files)
                  }
                />
                <FieldDescription className="text-xs/relaxed">
                  {file
                    ? `${file.name} · ${formatBytes(file.size)}`
                    : '支持 make build/build-win 生成的 .tar.gz 文件。'}
                </FieldDescription>
                <FieldError errors={[errors.file]} />
              </Field>

              <Controller
                control={form.control}
                name="sha256"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <RequiredFieldLabel htmlFor={sha256InputId} required>
                      SHA-256
                    </RequiredFieldLabel>
                    <Input
                      {...field}
                      id={sha256InputId}
                      placeholder="64 位十六进制校验值"
                      disabled={isSubmitting}
                      readOnly={Boolean(parsedArchive?.sha256)}
                      aria-invalid={fieldState.invalid}
                      aria-required="true"
                      onChange={(event) => {
                        field.onChange(event);
                        form.clearErrors('sha256');
                      }}
                    />
                    <FieldDescription className="text-xs/relaxed">
                      {parsedArchive?.sha256
                        ? '已从安装包文件名自动识别。'
                        : '旧安装包未携带校验值时可以手动输入。'}
                    </FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <FieldGroup className="grid gap-3 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="platform"
                  render={({ field, fieldState }) => (
                    <SelectField
                      id={platformInputId}
                      label="运行平台"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={[
                        { label: 'macOS', value: 'macos' },
                        { label: 'Windows', value: 'windows' },
                      ]}
                      disabled={isSubmitting}
                      error={fieldState.error}
                      required
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="arch"
                  render={({ field, fieldState }) => (
                    <SelectField
                      id={archInputId}
                      label="架构"
                      value={field.value}
                      onValueChange={field.onChange}
                      options={[
                        { label: 'arm64', value: 'arm64' },
                        { label: 'x64', value: 'x64' },
                      ]}
                      disabled={isSubmitting}
                      error={fieldState.error}
                      required
                    />
                  )}
                />
                <Field
                  className="sm:col-span-2"
                  data-invalid={Boolean(errors.version)}
                >
                  <RequiredFieldLabel htmlFor={versionInputId} required>
                    版本
                  </RequiredFieldLabel>
                  <Input
                    id={versionInputId}
                    {...form.register('version')}
                    placeholder="例如 26.716.2105"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.version)}
                    aria-required="true"
                  />
                  <FieldDescription className="text-xs/relaxed">
                    从安装包文件名自动识别，也可以手动修改。
                  </FieldDescription>
                  <FieldError errors={[errors.version]} />
                </Field>
              </FieldGroup>

              <Controller
                control={form.control}
                name="makeCurrent"
                render={({ field }) => (
                  <Field
                    orientation="horizontal"
                    className="items-center gap-2"
                  >
                    <Switch
                      id={makeCurrentInputId}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                      size="sm"
                    />
                    <FieldLabel htmlFor={makeCurrentInputId}>
                      设为当前版本
                    </FieldLabel>
                  </Field>
                )}
              />

              <Field>
                <FieldLabel htmlFor={remarkInputId}>备注</FieldLabel>
                <Textarea
                  id={remarkInputId}
                  {...form.register('remark')}
                  disabled={isSubmitting}
                  placeholder="可选"
                  className="min-h-16 resize-none"
                />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl bg-muted/50 px-4 py-2">
            <DialogActionButton
              type="button"
              action="cancel"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
            >
              取消
            </DialogActionButton>
            <DialogActionButton
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              loadingText="上传中"
            >
              <HugeiconsIcon
                icon={Upload01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              上传
            </DialogActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
