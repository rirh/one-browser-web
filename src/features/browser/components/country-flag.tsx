import { cn } from '@/lib/utils';
import { useState } from 'react';

import { AppImage as Image } from '@/components/app-image';

const knownCountryCodes: Record<string, string> = {
  australia: 'AU',
  brazil: 'BR',
  canada: 'CA',
  china: 'CN',
  germany: 'DE',
  france: 'FR',
  'hong kong': 'HK',
  india: 'IN',
  indonesia: 'ID',
  italy: 'IT',
  japan: 'JP',
  malaysia: 'MY',
  netherlands: 'NL',
  philippines: 'PH',
  singapore: 'SG',
  'south korea': 'KR',
  taiwan: 'TW',
  thailand: 'TH',
  'united kingdom': 'GB',
  'united states': 'US',
  usa: 'US',
  vietnam: 'VN',
  中国: 'CN',
  香港: 'HK',
  日本: 'JP',
  新加坡: 'SG',
  美国: 'US',
  英国: 'GB',
};

export function CountryFlag({
  className,
  code,
  country,
}: {
  className?: string;
  code?: string | null;
  country?: string | null;
}) {
  const resolvedCode = resolveCountryCode(code, country);
  const [failedCode, setFailedCode] = useState<string | null>(null);
  const failed = Boolean(resolvedCode && failedCode === resolvedCode);

  if (!resolvedCode || failed) {
    return (
      <span
        className={cn(
          'flex h-3.5 w-5 shrink-0 items-center justify-center rounded-[3px] border bg-muted text-[0.5rem] font-medium text-muted-foreground',
          className,
        )}
      >
        {resolvedCode ?? '--'}
      </span>
    );
  }

  const lowerCode = resolvedCode.toLowerCase();

  return (
    <Image
      src={`https://flagcdn.com/w40/${lowerCode}.png`}
      alt={`${resolvedCode} flag`}
      width={24}
      height={16}
      unoptimized
      onError={() => setFailedCode(resolvedCode)}
      className={cn(
        'h-3.5 w-5 shrink-0 rounded-[3px] border bg-muted object-cover',
        className,
      )}
    />
  );
}

export function resolveCountryCode(
  code?: string | null,
  country?: string | null,
) {
  const normalizedCode = normalizeCountryCode(code);
  if (normalizedCode) {
    return normalizedCode;
  }

  const normalizedCountry = country?.trim().toLowerCase();
  if (!normalizedCountry) {
    return null;
  }

  return knownCountryCodes[normalizedCountry] ?? null;
}

function normalizeCountryCode(value?: string | null) {
  const normalized = value?.trim();
  if (!normalized) {
    return null;
  }

  if (/^[A-Za-z]{2}$/.test(normalized)) {
    return normalized.toUpperCase();
  }

  return null;
}
