import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function SettingsGroup({
  children,
  className,
  description,
  title,
}: {
  children: ReactNode;
  className?: string;
  description?: string;
  title: string;
}) {
  return (
    <FieldSet className="gap-1">
      <FieldLegend className="mb-0 text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </FieldLegend>
      {description ? (
        <FieldDescription className="mb-1 text-[12px] leading-relaxed font-normal">
          {description}
        </FieldDescription>
      ) : null}
      <FieldGroup
        className={cn(
          'gap-0 overflow-hidden rounded-lg border bg-card',
          className,
        )}
      >
        {children}
      </FieldGroup>
    </FieldSet>
  );
}

export function SettingsRow({
  children,
  controlClassName,
  description,
  htmlFor,
  label,
  labelId,
}: {
  children: ReactNode;
  controlClassName?: string;
  description: ReactNode;
  htmlFor?: string;
  label: string;
  labelId?: string;
}) {
  return (
    <Field
      orientation="responsive"
      className="items-center justify-between gap-4 px-3 py-2.5"
    >
      <FieldContent className="min-w-0">
        <FieldLabel
          htmlFor={htmlFor}
          id={labelId}
          className="text-[14px] leading-none font-normal"
        >
          {label}
        </FieldLabel>
        <FieldDescription className="mt-0.5 text-[12px] leading-relaxed font-normal">
          {description}
        </FieldDescription>
      </FieldContent>
      <div
        className={cn(
          'flex w-full shrink-0 items-center justify-start @md/field-group:w-auto @md/field-group:justify-end',
          controlClassName,
        )}
      >
        {children}
      </div>
    </Field>
  );
}

export function SettingsFormRow({
  children,
  description,
  htmlFor,
  label,
}: {
  children: ReactNode;
  description: ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <Field
      orientation="responsive"
      className="items-center justify-between gap-4 px-3 py-2.5"
    >
      <FieldContent className="min-w-0">
        <FieldLabel
          htmlFor={htmlFor}
          className="text-[14px] leading-none font-normal"
        >
          {label}
        </FieldLabel>
        <FieldDescription className="mt-0.5 text-[12px] leading-relaxed font-normal">
          {description}
        </FieldDescription>
      </FieldContent>
      <div className="flex w-full shrink-0 items-center @md/field-group:w-72">
        {children}
      </div>
    </Field>
  );
}

export function SettingsDivider() {
  return <Separator className="mx-3 w-auto" />;
}
