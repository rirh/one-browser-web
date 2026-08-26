import { cn } from '@/lib/utils';
import * as React from 'react';
import NiceAvatar, { genConfig } from 'react-nice-avatar';

import { normalizeDefaultUserAvatarSeed } from './seed';

export function DefaultUserAvatar({
  className,
  seed,
}: {
  className?: string;
  seed: string;
}) {
  const config = React.useMemo(
    () => genConfig(normalizeDefaultUserAvatarSeed(seed)),
    [seed],
  );

  return (
    <NiceAvatar
      className={cn('size-full', className)}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
      }}
      {...config}
    />
  );
}
