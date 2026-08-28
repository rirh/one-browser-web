import { Toaster as Sonner, type ToasterProps } from 'sonner';

import { useTheme } from '@/components/theme/runtime';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      {...props}
    />
  );
};

export { Toaster };
