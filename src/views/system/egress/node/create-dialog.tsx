import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CheckCircle2Icon,
  ContainerIcon,
  CopyIcon,
  NetworkIcon,
  ServerIcon,
  ShieldAlertIcon,
} from "lucide-react"
import { useForm, useWatch, type FieldErrors } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import {
  createEgressEnrollment,
  getEgressEnrollmentConfig,
  listEgressNodes,
  updateEgressNode,
} from "@/api/system/egress-nodes"
import { useTranslation } from "@/components/providers/language-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AnimatedSegmentedTabs } from "@/components/ui/animated-segmented-tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DialogActionButton } from "@/components/ui/dialog-action-button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog"
import { formatAbsoluteDateTime } from "@/lib/datetime"
import { systemQueryKeys } from "@/lib/query-keys"
import { cn } from "@/lib/utils"
import { translateAdminText } from "@/local"
import type {
  CreateEgressEnrollmentPayload,
  EgressEnrollmentConfig,
  EgressNodeResource,
  EgressNodeStatus,
} from "@/types/admin"
import { showResourceError } from "@/views/system/_components/resource/toast"

import { getEgressNodeStatusLabel, getEgressNodeStatusVariant } from "./status"

const DOMAIN_PATTERN =
  /^(?=.{1,253}$)(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/

const enrollmentSchema = z.object({
  domain: z
    .string()
    .trim()
    .min(1, "请输入域名")
    .regex(DOMAIN_PATTERN, "请输入有效的完整域名，不要包含协议或端口"),
  display_name: z
    .string()
    .trim()
    .min(1, "请输入节点名称")
    .max(128, "节点名称不能超过 128 个字符"),
  max_connections: z
    .number()
    .int("最大连接数必须是整数")
    .min(1, "最大连接数不能小于 1")
    .max(16_384, "最大连接数不能超过 16384"),
  max_streams: z
    .number()
    .int("最大流数必须是整数")
    .min(1, "最大流数不能小于 1")
    .max(65_535, "最大流数不能超过 65535"),
  replace: z.boolean(),
})

type EnrollmentFormValues = z.infer<typeof enrollmentSchema>
type InstallMethod = "native" | "docker"

const DEFAULT_VALUES: EnrollmentFormValues = {
  domain: "",
  display_name: "",
  max_connections: 256,
  max_streams: 2048,
  replace: false,
}

export function CreateEgressNodeDialog({
  open,
  editingNode,
  mode = "edit",
  onOpenChange,
}: {
  open: boolean
  editingNode: EgressNodeResource | null
  mode?: "edit" | "enroll"
  onOpenChange: (open: boolean) => void
}) {
  const { locale, t } = useTranslation()
  const tt = (text: string) => translateAdminText(locale, text)
  const queryClient = useQueryClient()
  const [installMethod, setInstallMethod] =
    React.useState<InstallMethod>("native")
  const enrollmentMode =
    mode === "enroll" &&
    editingNode != null &&
    (editingNode.lifecycle === "pending" ||
      (editingNode.status === "init" && editingNode.heartbeat_at === null))
  const editingActiveNode =
    editingNode?.lifecycle === "active" && !enrollmentMode
  const enrollmentConfigQuery = useQuery({
    queryKey: systemQueryKeys.egressEnrollmentConfig,
    queryFn: getEgressEnrollmentConfig,
    enabled: open && !editingActiveNode,
    staleTime: 60_000,
    retry: false,
  })
  const defaultValues = React.useMemo(
    () => enrollmentDefaultValues(editingNode),
    [editingNode]
  )
  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues,
  })
  React.useEffect(() => {
    if (open) {
      form.reset(defaultValues)
    }
  }, [defaultValues, form, open])
  const replaceEnrollment = useWatch({
    control: form.control,
    name: "replace",
  })
  const mutation = useMutation({
    mutationFn: async (values: EnrollmentFormValues) => {
      if (editingActiveNode && editingNode) {
        await updateEgressNode(editingNode.egress_id, {
          display_name: values.display_name,
        })
        return null
      }
      if (!enrollmentConfigQuery.data) {
        throw new Error("无法确认 Server 环境")
      }
      return createEgressEnrollment(toEnrollmentPayload(values, editingNode))
    },
    gcTime: 0,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: systemQueryKeys.egressNodes,
      })
      if (data === null) {
        toast.success(tt("节点信息已更新"), {
          description: editingNode
            ? `${editingNode.display_name} · ${editingNode.egress_id}`
            : undefined,
        })
        form.reset(defaultValues)
        onOpenChange(false)
      }
    },
    onError: (error) => showResourceError(error, locale),
  })
  const result = mutation.data
  const enrollmentStatusQuery = useQuery({
    queryKey: [
      ...systemQueryKeys.egressNodes,
      "enrollment-status",
      result?.egress_id,
    ],
    queryFn: () =>
      listEgressNodes({
        page: 1,
        page_size: 1,
        keyword: result?.egress_id,
      }),
    enabled: open && result != null,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Number.POSITIVE_INFINITY,
  })
  const enrollmentNode = enrollmentStatusQuery.data?.list.find(
    (node) => node.egress_id === result?.egress_id
  )
  const resetMutation = mutation.reset

  React.useEffect(() => {
    if (!open || !result || enrollmentNode?.status !== "healthy") {
      return
    }

    const closeTimer = window.setTimeout(() => {
      resetMutation()
      form.reset(defaultValues)
      setInstallMethod("native")
      onOpenChange(false)
    }, 0)

    return () => window.clearTimeout(closeTimer)
  }, [
    defaultValues,
    enrollmentNode?.status,
    form,
    onOpenChange,
    open,
    resetMutation,
    result,
  ])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && mutation.isPending) {
      return
    }
    if (!nextOpen) {
      mutation.reset()
      form.reset(defaultValues)
      setInstallMethod("native")
    }
    onOpenChange(nextOpen)
  }

  function handleInvalidSubmit(errors: FieldErrors<EnrollmentFormValues>) {
    const firstError = Object.values(errors)[0]?.message
    toast.error(tt("节点信息未填写完整"), {
      description:
        typeof firstError === "string"
          ? tt(firstError)
          : tt("请检查表单中的必填项或格式提示。"),
    })
  }

  async function copyCommand(command: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(command)
      toast.success(tt(successMessage))
    } catch {
      toast.error(tt("复制失败，请手动选择命令复制。"))
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogContent
        className="sm:max-w-2xl"
        onInteractOutside={(event) => event.preventDefault()}
      >
        {result ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>
                {tt(editingNode ? "接入命令已生成" : "节点已创建")}
              </ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                {tt("选择一种方式，在目标服务器执行一键安装脚本。")}
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>

            <ResponsiveDialogBody className="flex flex-col gap-3 overflow-y-auto">
              <EnrollmentStatusCard
                node={enrollmentNode}
                egressId={result.egress_id}
                expiresAt={result.expires_at}
                environment={result.environment}
                tlsEnabled={result.tls_enabled}
              />

              <div className="flex items-center justify-between gap-3">
                <FieldLabel>{tt("安装方式")}</FieldLabel>
                <AnimatedSegmentedTabs
                  label={tt("安装方式")}
                  value={installMethod}
                  onValueChange={setInstallMethod}
                  className="max-w-full"
                  listClassName="grid h-8 w-64 max-w-full grid-cols-2"
                  triggerClassName="w-full px-3"
                  options={[
                    {
                      value: "native",
                      label: (
                        <>
                          <ServerIcon data-icon="inline-start" />
                          {tt("普通安装")}
                        </>
                      ),
                    },
                    {
                      value: "docker",
                      label: (
                        <>
                          <ContainerIcon data-icon="inline-start" />
                          Docker
                        </>
                      ),
                    },
                  ]}
                />
              </div>

              {installMethod === "native" ? (
                <EgressCommandField
                  label={tt("普通安装一键脚本")}
                  command={result.native_install_command}
                  description={tt(
                    "自动识别 amd64/arm64，安装原生程序并注册 systemd 服务。"
                  )}
                  copyLabel={tt("复制一键脚本")}
                  onCopy={() =>
                    copyCommand(
                      result.native_install_command,
                      "普通安装脚本已复制"
                    )
                  }
                />
              ) : (
                <EgressCommandField
                  label={tt("Docker 一键安装脚本")}
                  command={result.docker_install_command}
                  description={tt(
                    "自动识别 amd64/arm64，安装或复用 Docker 并启动 Egress 容器。"
                  )}
                  copyLabel={tt("复制一键脚本")}
                  onCopy={() =>
                    copyCommand(
                      result.docker_install_command,
                      "Docker 安装脚本已复制"
                    )
                  }
                />
              )}

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldAlertIcon className="mt-0.5 size-3.5 shrink-0" />
                {tt(
                  "脚本包含一次性登记令牌，仅在本次弹窗显示；普通安装和 Docker 只需选择一种。"
                )}
              </div>
            </ResponsiveDialogBody>

            <ResponsiveDialogFooter>
              <ResponsiveDialogClose asChild>
                <DialogActionButton type="button" shortcut="none">
                  <CheckCircle2Icon data-icon="inline-start" />
                  {tt("完成")}
                </DialogActionButton>
              </ResponsiveDialogClose>
            </ResponsiveDialogFooter>
          </div>
        ) : (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit(
              (values) => mutation.mutate(values),
              handleInvalidSubmit
            )}
          >
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>
                {tt(
                  enrollmentMode
                    ? "接入节点"
                    : editingNode
                      ? "修改节点"
                      : "新增节点"
                )}
              </ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                {enrollmentMode
                  ? tt(
                      "重新生成一次性接入命令，并在目标服务器选择一种方式完成安装。"
                    )
                  : editingActiveNode
                    ? tt("修改节点名称；域名和运行容量由已安装节点配置保持。")
                    : editingNode
                      ? tt(
                          "修改待接入节点后会生成新的安装命令，旧命令立即失效。"
                        )
                      : tt(
                          "填写节点信息，系统将自动生成节点 ID 和一次性安装命令。"
                        )}
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>

            <ResponsiveDialogBody className="flex flex-col gap-4 overflow-y-auto">
              {enrollmentMode && editingNode ? (
                <EnrollmentStatusCard
                  node={editingNode}
                  egressId={editingNode.egress_id}
                  expiresAt={editingNode.enrollment_expires_at ?? ""}
                  environment={editingNode.environment}
                  tlsEnabled={editingNode.tls_enabled}
                />
              ) : null}

              <EnrollmentEnvironmentAlert
                locale={locale}
                editingActiveNode={editingActiveNode}
                config={enrollmentConfigQuery.data}
                isLoading={enrollmentConfigQuery.isLoading}
                isError={enrollmentConfigQuery.isError}
              />

              {enrollmentMode ? (
                <Alert>
                  <ShieldAlertIcon />
                  <AlertTitle>{tt("将生成新的接入命令")}</AlertTitle>
                  <AlertDescription>
                    {tt(
                      "生成后，之前生成的命令会立即失效；请复制新命令到目标服务器执行。"
                    )}
                  </AlertDescription>
                </Alert>
              ) : (
                <FieldGroup className="grid gap-4 md:grid-cols-2">
                  {editingNode ? (
                    <ReadOnlyField
                      label={tt("节点 ID")}
                      value={editingNode.egress_id}
                      monospace
                    />
                  ) : null}
                  <TextField
                    id="egress-display-name"
                    label={tt("节点名称")}
                    placeholder={tt("请输入节点名称")}
                    error={form.formState.errors.display_name?.message}
                    disabled={mutation.isPending}
                    inputProps={form.register("display_name")}
                  />
                  {!editingActiveNode ? (
                    <TextField
                      id="egress-domain"
                      label={tt("节点域名")}
                      placeholder="egress-sg.example.com"
                      description={tt(
                        "只填写域名，不要包含 http://、https:// 或端口。"
                      )}
                      error={form.formState.errors.domain?.message}
                      disabled={mutation.isPending}
                      inputProps={form.register("domain")}
                    />
                  ) : null}
                  {editingActiveNode && editingNode ? (
                    <ReadOnlyField
                      label={tt("节点域名")}
                      value={editingNode.domain}
                      monospace
                    />
                  ) : null}
                  {!editingActiveNode ? (
                    <details className="rounded-lg border md:col-span-2">
                      <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
                        {tt("高级容量配置")}
                      </summary>
                      <div className="grid gap-4 border-t p-3 md:grid-cols-2">
                        <TextField
                          id="egress-max-connections"
                          label={tt("最大连接数")}
                          type="number"
                          min={1}
                          max={16_384}
                          error={form.formState.errors.max_connections?.message}
                          disabled={mutation.isPending}
                          inputProps={form.register("max_connections", {
                            setValueAs: parseNumberInput,
                          })}
                        />
                        <TextField
                          id="egress-max-streams"
                          label={tt("最大流数")}
                          type="number"
                          min={1}
                          max={65_535}
                          error={form.formState.errors.max_streams?.message}
                          disabled={mutation.isPending}
                          inputProps={form.register("max_streams", {
                            setValueAs: parseNumberInput,
                          })}
                        />
                        {!editingNode ? (
                          <Field className="md:col-span-2">
                            <label
                              htmlFor="egress-replace-enrollment"
                              className="flex cursor-pointer items-start gap-2"
                            >
                              <Checkbox
                                id="egress-replace-enrollment"
                                checked={replaceEnrollment}
                                disabled={mutation.isPending}
                                onCheckedChange={(checked) =>
                                  form.setValue("replace", checked === true, {
                                    shouldDirty: true,
                                  })
                                }
                              />
                              <span className="flex flex-col gap-1">
                                <span className="text-sm font-medium">
                                  {tt("替换相同域名的未完成登记")}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {tt(
                                    "仅用于安装命令遗失或登记卡住；替换后，之前生成的命令会立即失效。"
                                  )}
                                </span>
                              </span>
                            </label>
                          </Field>
                        ) : null}
                      </div>
                    </details>
                  ) : null}
                </FieldGroup>
              )}
            </ResponsiveDialogBody>

            <ResponsiveDialogFooter>
              <ResponsiveDialogClose asChild>
                <DialogActionButton
                  type="button"
                  action="cancel"
                  disabled={mutation.isPending}
                >
                  {t("common.cancel")}
                </DialogActionButton>
              </ResponsiveDialogClose>
              <DialogActionButton
                type="submit"
                loading={mutation.isPending}
                disabled={
                  mutation.isPending ||
                  (!editingActiveNode && !enrollmentConfigQuery.isSuccess)
                }
                loadingText={
                  editingActiveNode ? tt("正在保存节点") : tt("正在生成命令")
                }
              >
                {enrollmentMode
                  ? tt("生成并显示接入命令")
                  : editingActiveNode
                    ? tt("保存修改")
                    : editingNode
                      ? tt("保存并重新生成命令")
                      : tt("生成安装命令")}
              </DialogActionButton>
            </ResponsiveDialogFooter>
          </form>
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}

function EgressCommandField({
  label,
  command,
  description,
  copyLabel,
  onCopy,
}: {
  label: string
  command: string
  description: string
  copyLabel: string
  onCopy: () => void
}) {
  return (
    <Field className="gap-2 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel>{label}</FieldLabel>
        <Button type="button" variant="outline" size="sm" onClick={onCopy}>
          <CopyIcon data-icon="inline-start" />
          {copyLabel}
        </Button>
      </div>
      <pre className="max-h-36 overflow-auto rounded-md border bg-background p-2.5 text-xs leading-relaxed break-all whitespace-pre-wrap select-all">
        <code>{command}</code>
      </pre>
      <FieldDescription>{description}</FieldDescription>
    </Field>
  )
}

function EnrollmentStatusCard({
  node,
  egressId,
  expiresAt,
  environment,
  tlsEnabled,
}: {
  node: EgressNodeResource | undefined
  egressId: string
  expiresAt: string
  environment: "development" | "production"
  tlsEnabled: boolean
}) {
  const { locale } = useTranslation()
  const tt = (text: string) => translateAdminText(locale, text)
  const status: EgressNodeStatus = node?.status ?? "pending"
  const online = node?.online ?? false

  return (
    <div
      className="rounded-lg border bg-muted/20 px-3 py-2.5"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            {tt("当前状态")}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
              <span
                className={cn(
                  "size-2 rounded-full",
                  online ? "bg-emerald-500" : "bg-muted-foreground/50"
                )}
              />
              {tt(online ? "在线" : "离线")}
            </span>
            <Badge variant={getEgressNodeStatusVariant(status)}>
              {tt(getEgressNodeStatusLabel(status))}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <Badge variant="outline">
            {tt(environment === "development" ? "测试环境" : "正式环境")}
          </Badge>
          <Badge variant="outline">
            {tt(tlsEnabled ? "TLS 已启用" : "无需证书")}
          </Badge>
        </div>
      </div>

      <dl className="mt-2 grid gap-2 border-t pt-2 text-xs sm:grid-cols-2">
        <div className="flex min-w-0 items-center gap-2">
          <dt className="shrink-0 text-muted-foreground">{tt("节点 ID")}</dt>
          <dd className="truncate font-mono" title={egressId}>
            {egressId}
          </dd>
        </div>
        <div className="flex min-w-0 items-center gap-2 sm:justify-end">
          <dt className="shrink-0 text-muted-foreground">{tt("有效期至")}</dt>
          <dd className="truncate tabular-nums" title={expiresAt}>
            {formatAbsoluteDateTime(expiresAt, tt("暂无"))}
          </dd>
        </div>
      </dl>
    </div>
  )
}

function EnrollmentEnvironmentAlert({
  locale,
  editingActiveNode,
  config,
  isLoading,
  isError,
}: {
  locale: Parameters<typeof translateAdminText>[0]
  editingActiveNode: boolean
  config: EgressEnrollmentConfig | undefined
  isLoading: boolean
  isError: boolean
}) {
  const tt = (text: string) => translateAdminText(locale, text)

  if (editingActiveNode) {
    return (
      <Alert>
        <NetworkIcon />
        <AlertTitle>{tt("已接入节点的域名保持不变")}</AlertTitle>
        <AlertDescription>
          {tt(
            "域名关联当前 Egress 接入点；如需更换域名，请新增节点并完成迁移后再删除旧节点。"
          )}
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <Alert>
        <NetworkIcon />
        <AlertTitle>{tt("正在确认 Server 环境")}</AlertTitle>
        <AlertDescription>
          {tt("环境确认完成后才可以生成安装命令。")}
        </AlertDescription>
      </Alert>
    )
  }

  if (isError || !config) {
    return (
      <Alert variant="destructive">
        <ShieldAlertIcon />
        <AlertTitle>{tt("无法确认 Server 环境")}</AlertTitle>
        <AlertDescription>
          {tt("请检查 Server 的 Egress 安装配置后重试。")}
        </AlertDescription>
      </Alert>
    )
  }

  const development = config.environment === "development"
  return (
    <Alert>
      {development ? <NetworkIcon /> : <ShieldAlertIcon />}
      <AlertTitle>
        {tt(development ? "测试环境接入" : "正式环境接入")}
      </AlertTitle>
      <AlertDescription>
        {tt(
          development
            ? "Server 当前为测试环境，安装命令使用 HTTP 数据通道，不需要域名证书。"
            : "Server 当前为正式环境，节点域名必须解析到公网 IPv4，并准备有效 TLS 证书。"
        )}
      </AlertDescription>
    </Alert>
  )
}

type TextFieldProps = {
  id: string
  label: string
  className?: string
  description?: string
  error?: string
  disabled?: boolean
  type?: React.HTMLInputTypeAttribute
  min?: number
  max?: number
  placeholder?: string
  inputProps: React.ComponentProps<typeof Input>
}

function TextField({
  id,
  label,
  className,
  description,
  error,
  disabled,
  inputProps,
  ...inputOptions
}: TextFieldProps) {
  const { locale } = useTranslation()

  return (
    <Field className={className} data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        {...inputOptions}
        {...inputProps}
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError>
        {error ? translateAdminText(locale, error) : undefined}
      </FieldError>
    </Field>
  )
}

function ReadOnlyField({
  label,
  value,
  monospace = false,
}: {
  label: string
  value: string
  monospace?: boolean
}) {
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <div
        className={cn(
          "flex h-8 items-center rounded-md border bg-muted/50 px-2.5 text-sm",
          monospace && "font-mono"
        )}
        title={value}
      >
        <span className="truncate">{value}</span>
      </div>
    </Field>
  )
}

function toEnrollmentPayload(
  values: EnrollmentFormValues,
  editingNode: EgressNodeResource | null
): CreateEgressEnrollmentPayload {
  return {
    domain: values.domain,
    display_name: values.display_name,
    max_connections: values.max_connections,
    max_streams: values.max_streams,
    replace: editingNode ? true : values.replace,
    replace_egress_id: editingNode?.egress_id,
  }
}

function enrollmentDefaultValues(
  editingNode: EgressNodeResource | null
): EnrollmentFormValues {
  if (!editingNode) {
    return DEFAULT_VALUES
  }
  return {
    domain: editingNode.domain,
    display_name: editingNode.display_name,
    max_connections: editingNode.max_connections,
    max_streams: editingNode.max_streams,
    replace: editingNode.lifecycle === "pending",
  }
}

function parseNumberInput(value: unknown) {
  const parsed = Number(value)
  return value === "" || Number.isNaN(parsed) ? 0 : parsed
}
