import { LayoutGrid, List, ChevronDown } from 'lucide-react';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Rating: High to Low' },
  { value: 'name-asc', label: 'Name: A → Z' },
] as const;

import type { ViewMode } from '@/types/shop/shop.types';

type SortBy = (typeof sortOptions)[number]['value'];

type SortBarProps = {
  sortBy: SortBy;
  onChangeSort: (next: SortBy) => void;
  resultsCount: number;
  viewMode: ViewMode;
  onChangeViewMode: (next: ViewMode) => void;
};

const SortBar = ({
  sortBy,
  onChangeSort,
  resultsCount,
  viewMode,
  onChangeViewMode,
}: SortBarProps) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onChangeSort(e.target.value as SortBy)
            }
            className="appearance-none rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_30%,transparent)] bg-[color:var(--hl-surface-low)] px-4 py-2 pr-10 text-sm text-[color:var(--hl-on-surface)] outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--hl-primary)_35%,transparent)]"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--hl-secondary)]"
          />
        </div>
        <div className="hl-sans text-sm text-[color:color-mix(in_srgb,var(--hl-on-surface)_65%,transparent)]">
          Showing{' '}
          <span className="font-semibold text-[color:var(--hl-on-surface)]">{resultsCount}</span>{' '}
          results
        </div>
      </div>

      <div className="inline-flex overflow-hidden rounded-md border border-[color:color-mix(in_srgb,var(--hl-outline-variant)_30%,transparent)] bg-[color:var(--hl-surface-low)]">
        <button
          type="button"
          onClick={() => onChangeViewMode('grid')}
          className={[
            'grid h-10 w-11 place-items-center transition',
            viewMode === 'grid'
              ? 'bg-[color:var(--hl-primary)] text-[color:var(--hl-on-primary)]'
              : 'text-[color:var(--hl-secondary)]',
          ].join(' ')}
          aria-label="Grid view"
        >
          <LayoutGrid size={18} />
        </button>
        <button
          type="button"
          onClick={() => onChangeViewMode('list')}
          className={[
            'grid h-10 w-11 place-items-center border-l border-[color:color-mix(in_srgb,var(--hl-outline-variant)_30%,transparent)] transition',
            viewMode === 'list'
              ? 'bg-[color:var(--hl-primary)] text-[color:var(--hl-on-primary)]'
              : 'text-[color:var(--hl-secondary)]',
          ].join(' ')}
          aria-label="List view"
        >
          <List size={18} />
        </button>
      </div>
    </div>
  );
};

export default SortBar;
