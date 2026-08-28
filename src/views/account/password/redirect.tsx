import { openOneUserPasswordPage } from '@/features/account/one-user-account';
import { isTauriRuntime } from '@/lib/desktop';
import { useRouter } from '@/router/compat';
import * as React from 'react';
import { toast } from 'sonner';

export default function OneUserPasswordRedirectPage() {
  const router = useRouter();

  React.useEffect(() => {
    void openOneUserPasswordPage()
      .then(() => {
        if (isTauriRuntime()) {
          router.replace('/account/profile');
        }
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : '无法打开 One User 修改密码页面',
        );
        router.replace('/account/profile');
      });
  }, [router]);

  return null;
}
