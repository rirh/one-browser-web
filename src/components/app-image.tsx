import type { ImgHTMLAttributes } from 'react';

type AppImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  priority?: boolean;
  unoptimized?: boolean;
};

export function AppImage({
  priority,
  unoptimized: _unoptimized,
  ...props
}: AppImageProps) {
  return (
    <img
      {...props}
      loading={priority ? 'eager' : props.loading}
      fetchPriority={priority ? 'high' : props.fetchPriority}
    />
  );
}
