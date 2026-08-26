import type {
  OpenProfileProgressPayload,
  OpenProfileProgressStep,
} from '@/features/browser/contracts';
import { toast } from 'sonner';

import { toBrowserErrorMessage } from '../errors';
import {
  BrowserOpenStatusToast,
  type BrowserOpenToastStatus,
} from './browser-open-status-toast';

const browserOpenToastId = 'browser-open-progress';
const localOpenTotalSteps = 5;
const remoteOpenTotalSteps = 8;

const pendingProgressCopy = {
  checking_proxy: {
    title: '正在检查网络与代理',
    description: '正在验证网络出口与代理可用性',
    localStep: 3,
    remoteStep: 6,
  },
  proxy_checked: {
    title: '网络检查已完成',
    description: '正在应用环境网络与指纹配置',
    localStep: 4,
    remoteStep: 7,
  },
  preparing_launch: {
    title: '正在启动 Chromium',
    description: '正在创建浏览器进程，请稍候',
    localStep: 5,
    remoteStep: 8,
  },
} satisfies Partial<
  Record<
    OpenProfileProgressStep,
    {
      title: string;
      description: string;
      localStep: number;
      remoteStep: number;
    }
  >
>;

export function toastBrowserOpenPending(
  title: string,
  description: string,
  currentStep: number,
  totalSteps: number,
) {
  showBrowserOpenToast({
    status: 'loading',
    title,
    description,
    currentStep,
    totalSteps,
  });
}

export function toastBrowserOpenPreflight(totalSteps: number) {
  toastBrowserOpenPending(
    '正在检查启动条件',
    '正在确认网络连接与 Chromium 状态',
    1,
    totalSteps,
  );
}

export function toastBrowserOpenProgress({
  profileId,
  step,
}: OpenProfileProgressPayload) {
  if (step === 'launched') {
    toastBrowserOpenSuccess();
    return;
  }
  if (step === 'failed') {
    toastBrowserOpenFailure('请检查环境配置后重试');
    return;
  }

  const copy = pendingProgressCopy[step];
  if (!copy) {
    return;
  }

  const isRemoteEnvironment = profileId.startsWith('remote-env-');
  toastBrowserOpenPending(
    copy.title,
    copy.description,
    isRemoteEnvironment ? copy.remoteStep : copy.localStep,
    isRemoteEnvironment ? remoteOpenTotalSteps : localOpenTotalSteps,
  );
}

export function toastBrowserOpenSuccess(message = '浏览器已启动') {
  showBrowserOpenToast({
    status: 'success',
    title: message,
    description: '环境已进入运行状态',
  });
}

export function toastBrowserOpenError(error: unknown) {
  toastBrowserOpenFailure(toBrowserErrorMessage(error));
}

export function toastBrowserOpenFailure(message: string) {
  showBrowserOpenToast({
    status: 'error',
    title: '浏览器启动失败',
    description: message,
  });
}

function showBrowserOpenToast({
  status,
  title,
  description,
  currentStep,
  totalSteps,
}: {
  status: BrowserOpenToastStatus;
  title: string;
  description?: string;
  currentStep?: number;
  totalSteps?: number;
}) {
  toast.custom(
    (toastId) => (
      <BrowserOpenStatusToast
        status={status}
        title={title}
        description={description}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onClose={
          status === 'loading' ? undefined : () => toast.dismiss(toastId)
        }
      />
    ),
    {
      id: browserOpenToastId,
      duration:
        status === 'loading' ? Infinity : status === 'error' ? 8000 : 3500,
      dismissible: status !== 'loading',
      richColors: true,
      unstyled: true,
    },
  );
}
