import { DesktopApiError } from '@/lib/desktop';

import type {
  CreateProfileRequest,
  ProfileMode,
  UpdateProfileRequest,
} from '../contracts';
import { prepareEgressOpenSelection } from '../egress/selection';
import { createProfile, getProfile, updateProfile } from '../profiles/api';
import { closeProfile, openProfile } from '../runtime/api';
import { toastEnvironmentWarnings } from '../runtime/environment-warnings';
import { toastBrowserOpenPending } from '../runtime/open-progress-toast';
import {
  getChromiumDownloadManifest,
  installChromiumVersion,
} from '../status/api';
import {
  closeRemoteEnvironment,
  getRemoteEnvironment,
  openRemoteEnvironment,
} from './api';
import { remoteEnvironmentProfileId } from './runtime-profile-id';
import type { RemoteEnvironmentResource } from './types';

type LocalProfileUpsertRequest = CreateProfileRequest & UpdateProfileRequest;

const profileModes = new Set<ProfileMode>([
  'standard',
  'compat',
  'strict',
  'dev',
]);

export async function openRemoteEnvironmentLocally(environmentId: number) {
  toastBrowserOpenPending(
    '正在读取环境配置',
    '正在获取环境、代理与浏览器版本信息',
    2,
    8,
  );
  const environment = await getRemoteEnvironment(environmentId);
  toastBrowserOpenPending(
    '正在准备浏览器环境',
    '正在同步代理配置并检查 Chromium 版本',
    3,
    8,
  );
  const [request, chromiumManifest] = await Promise.all([
    remoteEnvironmentToProfileRequest(environment),
    getChromiumDownloadManifest(environment.chromium_version),
  ]);
  toastBrowserOpenPending(
    '正在准备 Chromium',
    '正在确认本机浏览器版本，缺失时将自动安装',
    4,
    8,
  );
  const chromium = await installChromiumVersion(
    chromiumManifest,
    Boolean(environment.chromium_version),
  );
  request.advanced = {
    ...request.advanced,
    chromiumPath: chromium.path,
  };

  toastBrowserOpenPending(
    '正在同步启动配置',
    '正在保存本地环境、测试线路并申请启动权限',
    5,
    8,
  );
  const [egressSelection] = await Promise.all([
    prepareEgressOpenSelection(),
    upsertLocalProfile(request),
  ]);
  const openedEnvironment = await openRemoteEnvironment(
    environmentId,
    egressSelection,
  );

  const tunnelRoute =
    openedEnvironment.tunnelRoute ?? openedEnvironment.tunnel_route;
  try {
    if (!tunnelRoute) {
      throw new Error('服务器未返回 Egress 隧道路由，已阻止浏览器直连');
    }
    toastBrowserOpenPending(
      '正在启动浏览器',
      '环境已就绪，正在进行启动前检查',
      6,
      8,
    );
    const runtime = await openProfile({
      profileId: request.profileId,
      mode: request.mode,
      headless: request.advanced?.headless,
      tunnelRoute: {
        transport: tunnelRoute.transport,
        endpoint: tunnelRoute.endpoint,
        tlsEnabled: tunnelRoute.tls_enabled,
        accessToken: tunnelRoute.access_token,
        expiresAt: tunnelRoute.expires_at,
        generation: tunnelRoute.generation,
        exitId: tunnelRoute.exit_id,
        expectedExitIp: tunnelRoute.expected_exit_ip,
        directFallback: tunnelRoute.direct_fallback,
      },
    });
    toastEnvironmentWarnings(runtime.environmentWarnings);
    // The route token is an ephemeral launch credential. The native tunnel
    // owns it after openProfile returns, so do not retain it in mutation state.
    return {
      ...openedEnvironment,
      tunnel_route: undefined,
      tunnelRoute: undefined,
    };
  } catch (error) {
    try {
      if (tunnelRoute)
        await closeRemoteEnvironment(environmentId, tunnelRoute.generation);
    } catch (rollbackError) {
      console.error(
        '[remote-environment] failed to release remote environment after local open failure',
        rollbackError,
      );
    }
    throw error;
  }
}

export async function closeRemoteEnvironmentLocally(environmentId: number) {
  try {
    await closeProfile({
      profileId: remoteEnvironmentProfileId(environmentId),
    });
  } catch (error) {
    if (!isNotFoundDesktopError(error)) {
      throw error;
    }
  }

  // Native runtime events own remote synchronization, including natural exits.
  return { environment_id: environmentId };
}

function remoteEnvironmentToProfileRequest(
  environment: RemoteEnvironmentResource,
): LocalProfileUpsertRequest {
  return {
    profileId: remoteEnvironmentProfileId(environment),
    profileNo: environment.environment_no,
    name: environment.name,
    identityName: remoteEnvironmentIdentityName(environment),
    remark: environment.remark,
    groupId: environment.group_key,
    tags: [],
    tabs: [],
    mode: normalizeProfileMode(environment.mode),
    proxyId: null,
    // The Egress connector owns the original proxy credentials. Keeping this
    // mirror profile credential-free prevents accidental direct fallback.
    proxyConfig: null,
    fingerprintConfig: environment.fingerprint_config ?? undefined,
    advanced: environment.advanced ?? undefined,
  };
}

function remoteEnvironmentIdentityName(environment: RemoteEnvironmentResource) {
  const name = environment.name.trim();
  return isEnglishIdentityName(name) ? name : environment.environment_key;
}

function isEnglishIdentityName(value: string) {
  return /^[A-Za-z0-9][A-Za-z0-9 ._-]*$/.test(value.trim());
}

async function upsertLocalProfile(request: LocalProfileUpsertRequest) {
  try {
    await getProfile({ profileId: request.profileId });
  } catch (error) {
    if (isNotFoundDesktopError(error)) {
      await createProfile(request);
      return;
    }

    throw error;
  }

  await updateProfile(request);
}

function normalizeProfileMode(value: string): ProfileMode {
  return profileModes.has(value as ProfileMode)
    ? (value as ProfileMode)
    : 'standard';
}

function isNotFoundDesktopError(error: unknown) {
  return error instanceof DesktopApiError && error.code === 40401;
}
