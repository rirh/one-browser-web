import { useActiveTheme } from '@/components/theme/use-active-theme';
import { cn } from '@/lib/utils';
import { isTauriRuntime } from '@/lib/desktop';
import * as React from 'react';

import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
} from './turnstile-widget';

const INVITE_TURNSTILE_ACTION = 'invite_email';

export type { TurnstileWidgetHandle };

type InviteTurnstileFieldProps = {
  className?: string;
  onTokenChange: (token: string) => void;
  onError?: () => void;
};

export const InviteTurnstileField = React.forwardRef<
  TurnstileWidgetHandle,
  InviteTurnstileFieldProps
>(function InviteTurnstileField({ className, onError, onTokenChange }, ref) {
  const siteKey = getInviteTurnstileSiteKey();
  const theme = useActiveTheme();

  if (!siteKey || isTauriRuntime()) {
    return null;
  }

  return (
    <div className={cn('min-w-0', className)}>
      <TurnstileWidget
        ref={ref}
        siteKey={siteKey}
        action={INVITE_TURNSTILE_ACTION}
        appearance="always"
        size="flexible"
        theme={theme}
        loadingLabel="正在加载人机验证"
        className="mx-0 justify-start"
        onTokenChange={onTokenChange}
        onError={onError}
      />
    </div>
  );
});

export function isInviteTurnstileEnabled() {
  return !isTauriRuntime() && Boolean(getInviteTurnstileSiteKey());
}

function getInviteTurnstileSiteKey() {
  return import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() || '';
}
