import {
  AppearancePreferencesProvider,
  ThemeColorProvider,
} from '@/components/theme';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { I18nProvider } from '@/i18n/provider';

import { AppUpdateChecker } from './app-update-checker';
import BuildInfo from './build-info';
import { QueryProvider } from './query';
import { ThemeProvider } from './theme';

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <I18nProvider>
      <QueryProvider>
        <ThemeProvider>
          <ThemeColorProvider>
            <AppearancePreferencesProvider>
              <TooltipProvider>{children}</TooltipProvider>
              <BuildInfo />
              <AppUpdateChecker />
              <Toaster position="bottom-right" richColors />
            </AppearancePreferencesProvider>
          </ThemeColorProvider>
        </ThemeProvider>
      </QueryProvider>
    </I18nProvider>
  );
}
