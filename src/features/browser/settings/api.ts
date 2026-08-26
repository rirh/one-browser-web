import type {
  AppSettings,
  ChromiumPathStatus,
  UpdateSettingsRequest,
  ValidateChromiumPathRequest,
} from '@/features/browser/contracts';
import { desktopInvoke } from '@/platform/desktop';

export function getSettings() {
  return desktopInvoke<AppSettings>('get_settings');
}

export function updateSettings(patch: UpdateSettingsRequest) {
  return desktopInvoke<AppSettings>('update_settings', { patch });
}

export function validateChromiumPath(
  request: ValidateChromiumPathRequest = {},
) {
  return desktopInvoke<ChromiumPathStatus>('validate_chromium_path', {
    request,
  });
}
