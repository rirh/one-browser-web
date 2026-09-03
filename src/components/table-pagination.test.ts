import { describe, expect, it } from 'vitest';

import { getPaginationItems, resolveTablePagination } from './table-pagination';

describe('resolveTablePagination', () => {
  it('hides pagination when all records fit on one page', () => {
    expect(resolveTablePagination(undefined, 15, 1)).toBeNull();
    expect(resolveTablePagination(Number.NaN, 15, 1)).toBeNull();
    expect(resolveTablePagination(14, 15, 1)).toBeNull();
    expect(resolveTablePagination(15, 15, 1)).toBeNull();
  });

  it('returns a clamped multi-page range', () => {
    expect(resolveTablePagination(31, 15, 9)).toEqual({
      firstRow: 31,
      hasNextPage: false,
      hasPreviousPage: true,
      lastRow: 31,
      page: 3,
      pageCount: 3,
    });
  });
});

describe('getPaginationItems', () => {
  it('shows all page links for a short range', () => {
    expect(getPaginationItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('uses ellipses around a middle page', () => {
    expect(getPaginationItems(6, 12)).toEqual([
      1,
      'ellipsis',
      5,
      6,
      7,
      'ellipsis',
      12,
    ]);
  });
});
