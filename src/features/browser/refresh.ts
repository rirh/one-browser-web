import { toast } from 'sonner';

type ManualRefreshResult = {
  isError: boolean;
};

export async function refreshWithSuccessToast(
  refetch: () => Promise<ManualRefreshResult>,
  successMessage = '刷新成功',
) {
  try {
    const result = await refetch();
    if (result.isError) {
      toast.error('刷新失败，请稍后重试');
      return;
    }
    toast.success(successMessage);
  } catch {
    toast.error('刷新失败，请稍后重试');
  }
}
