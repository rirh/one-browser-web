import { describe, expect, it } from 'vitest';

import {
  clampPercent,
  formatBytes,
  formatDuration,
  formatPercent,
  shortCommit,
} from './format';

describe('health monitor formatting', () => {
  it('formats resource values without leaking invalid numbers', () => {
    expect(formatBytes(1_073_741_824)).toBe('1.0 GB');
    expect(formatBytes(null)).toBe('—');
    expect(formatPercent(42.25)).toBe('42.3%');
    expect(clampPercent(120)).toBe(100);
  });

  it('formats durations and build commits compactly', () => {
    expect(formatDuration(90_061)).toBe('1天1小时');
    expect(shortCommit('1234567890abcdef')).toBe('123456…abcdef');
    expect(shortCommit('unknown')).toBe('—');
  });
});
