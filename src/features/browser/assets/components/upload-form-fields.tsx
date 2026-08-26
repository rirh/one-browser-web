import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ComponentProps, ReactNode } from 'react';
import type { FieldError as HookFormFieldError } from 'react-hook-form';

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly { label: string; value: string }[];
  disabled?: boolean;
  error?: HookFormFieldError;
  required?: boolean;
};

export function SelectField({
  id,
  label,
  value,
  onValueChange,
  options,
  disabled,
  error,
  required,
}: SelectFieldProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <RequiredFieldLabel htmlFor={id} required={required}>
        {label}
      </RequiredFieldLabel>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          className="w-full"
          aria-invalid={Boolean(error)}
          aria-required={required}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldError errors={[error]} />
    </Field>
  );
}

export function RequiredFieldLabel({
  children,
  required,
  ...props
}: ComponentProps<typeof FieldLabel> & {
  children?: ReactNode;
  required?: boolean;
}) {
  return (
    <FieldLabel {...props}>
      {children}
      {required ? (
        <span className="text-destructive" aria-hidden="true">
          *
        </span>
      ) : null}
    </FieldLabel>
  );
}
