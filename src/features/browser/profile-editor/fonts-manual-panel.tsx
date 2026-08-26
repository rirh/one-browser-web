import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogActionButton } from '@/components/ui/dialog-action-button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { PencilEdit02Icon, Refresh01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useMemo, useState } from 'react';

import {
  additionalFontOptions,
  defaultAdditionalFontsValue,
  parseFontList,
  serializeFontList,
  systemFontsLabel,
} from './font-options';
import type {
  ProfileEditorForm,
  SystemFingerprintDefaults,
  UpdateProfileEditorField,
} from './types';

export function FontsManualPanel({
  defaults,
  form,
  updateField,
}: {
  defaults: SystemFingerprintDefaults;
  form: ProfileEditorForm;
  updateField: UpdateProfileEditorField;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [draftFonts, setDraftFonts] = useState<string[]>([]);
  const selectedFonts = useMemo(() => parseFontList(form.fonts), [form.fonts]);
  const selectedFontSet = useMemo(() => new Set(draftFonts), [draftFonts]);
  const filteredFonts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return additionalFontOptions;
    }

    return additionalFontOptions.filter((font) =>
      font.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);
  const systemLabel = systemFontsLabel(
    form.system || defaults.system || defaults.fonts,
  );

  function openEditor() {
    setDraftFonts(selectedFonts);
    setQuery('');
    setOpen(true);
  }

  function toggleFont(font: string, checked: boolean) {
    setDraftFonts((currentFonts) => {
      if (checked) {
        return currentFonts.includes(font)
          ? currentFonts
          : [...currentFonts, font];
      }

      return currentFonts.filter((item) => item !== font);
    });
  }

  function resetFonts() {
    updateField('fonts', defaultAdditionalFontsValue);
  }

  function saveFonts() {
    const selectedSet = new Set(draftFonts);
    const orderedFonts = additionalFontOptions.filter((font) =>
      selectedSet.has(font),
    );

    updateField('fonts', serializeFontList(orderedFonts));
    setOpen(false);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-dashed border-border/70 bg-muted/20 p-1.5">
        <div className="inline-flex h-7 items-center justify-start gap-1.5 rounded-md bg-muted px-2 text-xs font-medium text-foreground">
          <span>系统字体: {systemLabel}</span>
        </div>

        <div className="flex h-7 overflow-hidden rounded-md border border-border bg-background">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="选择附加字体"
            className="h-7 justify-start gap-1.5 rounded-r-none px-2"
            onClick={openEditor}
          >
            <span>附加字体: {selectedFonts.length}</span>
            <HugeiconsIcon
              icon={PencilEdit02Icon}
              strokeWidth={2}
              data-icon="inline-end"
            />
          </Button>
          <Separator orientation="vertical" className="h-4 self-center" />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="重置附加字体"
            className="size-7 rounded-l-none"
            onClick={resetFonts}
          >
            <HugeiconsIcon icon={Refresh01Icon} strokeWidth={2} data-icon />
          </Button>
        </div>
      </div>

      <ResponsiveDialog open={open} onOpenChange={setOpen}>
        <ResponsiveDialogContent className="sm:max-w-xl">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>附加字体</ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="sr-only">
              选择此环境额外暴露的字体。
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody className="flex flex-col gap-3">
            <Input
              value={query}
              placeholder="搜索字体..."
              onChange={(event) => setQuery(event.target.value)}
            />
            <ScrollArea className="h-72 rounded-md border border-border/70">
              <div className="flex flex-col p-2">
                {filteredFonts.length > 0 ? (
                  filteredFonts.map((font) => (
                    <label
                      key={font}
                      className={cn(
                        'flex min-h-9 cursor-pointer items-center gap-2 rounded-md px-2 text-sm hover:bg-muted/60',
                        selectedFontSet.has(font) && 'bg-muted/50',
                      )}
                    >
                      <Checkbox
                        checked={selectedFontSet.has(font)}
                        onCheckedChange={(checked) =>
                          toggleFont(font, checked === true)
                        }
                      />
                      <span className="min-w-0 truncate">{font}</span>
                    </label>
                  ))
                ) : (
                  <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                    没有匹配的字体
                  </div>
                )}
              </div>
            </ScrollArea>
          </ResponsiveDialogBody>
          <ResponsiveDialogFooter>
            <DialogActionButton
              action="cancel"
              type="button"
              className="sm:min-w-24"
              onClick={() => setOpen(false)}
            >
              取消
            </DialogActionButton>
            <DialogActionButton
              type="button"
              className="sm:min-w-32"
              onClick={saveFonts}
            >
              保存
            </DialogActionButton>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}
