'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizes?: number[];
}

function pageItems(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set([1, pageCount, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['gap' as const, p] : [p]));
}

export function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizes = [10, 20, 50],
}: TablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const navButton =
    'h-8 rounded-lg border px-3 text-xs transition-colors disabled:cursor-not-allowed disabled:border-[#EFEBE6] disabled:bg-[#F3F0EC] disabled:text-[#B3AAA1]';

  return (
    <div className="flex flex-col gap-3 px-1 pt-3 text-xs text-[#3F342D] sm:flex-row sm:items-center sm:justify-between dark:text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>Rows per page</span>
        <select
          aria-label="Rows per page"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-7 rounded-md border border-[#E3DED8] bg-white px-1.5 text-xs dark:border-border dark:bg-card"
        >
          {pageSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>
          showing {from}–{to} of {total} rows
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={cn(navButton, 'border-[#E3DED8] bg-white hover:bg-[#F7F4F0]')}
        >
          Previous
        </button>
        {pageItems(page, pageCount).map((item, i) =>
          item === 'gap' ? (
            <span key={`gap-${i}`} className="flex size-8 items-center justify-center rounded-lg border border-[#E3DED8] bg-[#F3F4F8]">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={cn(
                'size-8 rounded-lg border text-xs transition-colors',
                item === page
                  ? 'border-[#6B3416] bg-[#6B3416] text-white'
                  : 'border-[#E3DED8] bg-[#F3F4F8] hover:bg-[#ECEDF2]',
              )}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className={cn(navButton, 'border-[#E3DED8] bg-white hover:bg-[#F7F4F0]')}
        >
          Next
        </button>
      </div>
    </div>
  );
}
