import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { changeCurrentUserPassword } from '@/features/auth/api';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  EyeIcon,
  LockPasswordIcon,
  ViewOffIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMutation } from '@tanstack/react-query';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const passwordSchema = z
  .object({
    old_password: z.string().min(1, '请输入当前密码'),
    new_password: z
      .string()
      .min(10, '新密码至少需要 10 位')
      .max(128, '新密码不能超过 128 位'),
    confirm_password: z.string().min(1, '请再次输入新密码'),
  })
  .refine((values) => values.new_password === values.confirm_password, {
    path: ['confirm_password'],
    message: '两次输入的新密码不一致',
  })
  .refine((values) => values.old_password !== values.new_password, {
    path: ['new_password'],
    message: '新密码不能和当前密码相同',
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function PasswordSettingsCard() {
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
  });
  const updatePassword = useMutation({
    mutationFn: (values: PasswordFormValues) =>
      changeCurrentUserPassword({
        old_password: values.old_password,
        new_password: values.new_password,
      }),
    onSuccess: () => {
      form.reset();
      toast.success('登录密码已更新');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '密码修改失败');
    },
  });

  return (
    <Card
      size="sm"
      className="overflow-visible bg-transparent p-0 shadow-none ring-0 data-[size=sm]:py-0"
    >
      <form
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit((values) => updatePassword.mutate(values))}
      >
        <CardContent className="p-0 group-data-[size=sm]/card:px-0">
          <FieldGroup className="rounded-lg bg-background p-3 sm:p-4">
            <PasswordField
              id="account-old-password"
              label="当前密码"
              autoComplete="current-password"
              disabled={updatePassword.isPending}
              error={form.formState.errors.old_password?.message}
              {...form.register('old_password')}
            />
            <PasswordField
              id="account-new-password"
              label="新密码"
              description="至少 10 位，建议包含大小写字母、数字或符号。"
              autoComplete="new-password"
              disabled={updatePassword.isPending}
              error={form.formState.errors.new_password?.message}
              {...form.register('new_password')}
            />
            <PasswordField
              id="account-confirm-password"
              label="确认新密码"
              autoComplete="new-password"
              disabled={updatePassword.isPending}
              error={form.formState.errors.confirm_password?.message}
              {...form.register('confirm_password')}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2 p-0 group-data-[size=sm]/card:px-0">
          <Button
            type="button"
            variant="outline"
            disabled={updatePassword.isPending || !form.formState.isDirty}
            onClick={() => form.reset()}
          >
            清空
          </Button>
          <Button type="submit" disabled={updatePassword.isPending}>
            {updatePassword.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <HugeiconsIcon
                icon={LockPasswordIcon}
                strokeWidth={2}
                data-icon="inline-start"
              />
            )}
            保存密码
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function PasswordField({
  label,
  description,
  error,
  disabled,
  ...props
}: React.ComponentProps<typeof InputGroupInput> & {
  label: string;
  description?: string;
  error?: string;
}) {
  const [visible, setVisible] = React.useState(false);

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={props.id}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          type={visible ? 'text' : 'password'}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          {...props}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            aria-label={visible ? '隐藏密码' : '显示密码'}
            aria-pressed={visible}
            disabled={disabled}
            size="icon-xs"
            onClick={() => setVisible((value) => !value)}
          >
            <HugeiconsIcon
              icon={visible ? ViewOffIcon : EyeIcon}
              strokeWidth={2}
            />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={[error ? { message: error } : undefined]} />
    </Field>
  );
}
