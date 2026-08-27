import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/responsive-dialog';
import { DialogActionButton } from '@/components/ui/dialog-action-button';
import { isTauriRuntime } from '@/lib/desktop/client';
import { BrowserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import * as React from 'react';

const desktopAppDeepLink = 'one-browser://open';

type DesktopAppRequest = {
  description?: string;
  title?: string;
};

type DesktopAppGateContextValue = {
  requireDesktopApp: (request?: DesktopAppRequest) => boolean;
};

const DesktopAppGateContext =
  React.createContext<DesktopAppGateContextValue | null>(null);

export function DesktopAppGateProvider({ children }: React.PropsWithChildren) {
  const [request, setRequest] = React.useState<DesktopAppRequest | null>(null);

  const requireDesktopApp = React.useCallback(
    (nextRequest: DesktopAppRequest = {}) => {
      if (isTauriRuntime()) {
        return true;
      }

      setRequest(nextRequest);
      return false;
    },
    [],
  );

  const value = React.useMemo(
    () => ({ requireDesktopApp }),
    [requireDesktopApp],
  );

  function openDesktopApp() {
    setRequest(null);
    window.location.assign(desktopAppDeepLink);
  }

  return (
    <DesktopAppGateContext.Provider value={value}>
      {children}
      <ResponsiveDialog
        open={Boolean(request)}
        onOpenChange={(open) => {
          if (!open) {
            setRequest(null);
          }
        }}
      >
        <ResponsiveDialogContent className="sm:max-w-sm">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {request?.title ?? '在 One Browser App 中继续'}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              此操作需要桌面端能力
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <ResponsiveDialogBody className="flex items-start gap-3 py-4">
            <div className="bg-primary/10 text-primary ring-primary/15 flex size-10 shrink-0 items-center justify-center rounded-lg ring-1">
              <HugeiconsIcon icon={BrowserIcon} strokeWidth={2} />
            </div>
            <p className="text-muted-foreground pt-0.5 text-sm/6">
              {request?.description ??
                '打开 One Browser App 后，即可使用本机浏览器、网络与系统能力。'}
            </p>
          </ResponsiveDialogBody>
          <ResponsiveDialogFooter>
            <DialogActionButton
              action="cancel"
              type="button"
              onClick={() => setRequest(null)}
            >
              取消
            </DialogActionButton>
            <DialogActionButton type="button" onClick={openDesktopApp}>
              打开 App
            </DialogActionButton>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </DesktopAppGateContext.Provider>
  );
}

export function useDesktopAppGate() {
  const context = React.useContext(DesktopAppGateContext);

  if (!context) {
    throw new Error(
      'useDesktopAppGate must be used within DesktopAppGateProvider.',
    );
  }

  return context;
}
