import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { ArrowDown01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as React from 'react';

import type {
  ProfileEditorForm,
  UpdateProfileEditorField,
} from '../../profile-editor/types';
import {
  buildProfileGroupOptions,
  normalizeProfileGroup,
} from '../../profiles/group-utils';

export function GroupField({
  form,
  groupOptions,
  updateField,
}: {
  form: ProfileEditorForm;
  groupOptions: string[];
  updateField: UpdateProfileEditorField;
}) {
  const options = React.useMemo(
    () => buildProfileGroupOptions(groupOptions, form.groupId),
    [form.groupId, groupOptions],
  );
  const selectedGroup = normalizeProfileGroup(form.groupId);

  return (
    <Field>
      <FieldLabel className="sr-only" htmlFor="remote-env-group">
        分组
      </FieldLabel>
      <InputGroup className="w-full">
        <InputGroupInput
          id="remote-env-group"
          value={selectedGroup}
          onChange={(event) => updateField('groupId', event.target.value)}
          placeholder="分组，可留空"
        />
        <InputGroupAddon align="inline-end">
          {selectedGroup ? (
            <InputGroupButton
              aria-label="清除分组"
              size="icon-xs"
              variant="ghost"
              onClick={() => updateField('groupId', '')}
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                strokeWidth={2}
                className="pointer-events-none"
              />
            </InputGroupButton>
          ) : null}
          {options.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <InputGroupButton
                  aria-label="选择分组"
                  size="icon-xs"
                  variant="ghost"
                >
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    strokeWidth={2}
                    className="pointer-events-none"
                  />
                </InputGroupButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-64 min-w-40">
                <DropdownMenuRadioGroup
                  value={selectedGroup}
                  onValueChange={(value) => updateField('groupId', value)}
                >
                  {options.map((option) => (
                    <DropdownMenuRadioItem key={option} value={option}>
                      {option}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          {!selectedGroup && options.length === 0 ? (
            <InputGroupButton
              aria-label="暂无分组"
              size="icon-xs"
              variant="ghost"
              disabled
            >
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                strokeWidth={2}
                className="pointer-events-none"
              />
            </InputGroupButton>
          ) : null}
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
