import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWardrobe } from '../hooks/useWardrobe';
import { useWearLog } from '../hooks/useWearLog';
import { useStorageSpaces } from '../hooks/useStorageSpaces';
import type { Category, Fit, Season } from '../types';
import { Button, FilterBar, EmptyState, Modal } from '../components/common';
import ItemGrid from '../components/wardrobe/ItemGrid';
import ItemForm from '../components/wardrobe/ItemForm';
import {
  buildWearCountMap,
  collectAvailableTags,
  filterAndSortItems,
  type CpwFilter,
  type ForSaleFilter,
  type SortOption,
  type WearFilter,
} from '../utils/wardrobeFilters';

const SORT_VALUES: SortOption[] = [
  'newest',
  'oldest',
  'mostWorn',
  'leastWorn',
  'priceHigh',
  'priceLow',
  'cpwLow',
  'cpwHigh',
];

const WEAR_VALUES: WearFilter[] = ['all', 'never', 'worn', '5plus'];
const FOR_SALE_VALUES: ForSaleFilter[] = ['all', 'yes', 'no'];
const CPW_VALUES: CpwFilter[] = ['all', 'hasPrice', 'deadMoney'];

function parseEnumParam<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  if (value && (allowed as readonly string[]).includes(value)) {
    return value as T;
  }
  return fallback;
}

export default function WardrobePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { items } = useWardrobe();
  const { wearLogs } = useWearLog();
  const { storageSpaces } = useStorageSpaces();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const category = (searchParams.get('category') || 'all') as Category | 'all';
  const color = searchParams.get('color') || 'all';
  const season = (searchParams.get('season') || 'all') as Season | 'all';
  const q = searchParams.get('q') || '';
  const tag = searchParams.get('tag') || 'all';
  const fit = (searchParams.get('fit') || 'all') as Fit | 'all';
  const storage = searchParams.get('storage') || 'all';
  const forSale = parseEnumParam(searchParams.get('forSale'), FOR_SALE_VALUES, 'all');
  const wear = parseEnumParam(searchParams.get('wear'), WEAR_VALUES, 'all');
  const cpw = parseEnumParam(searchParams.get('cpw'), CPW_VALUES, 'all');
  const sort = parseEnumParam(searchParams.get('sort'), SORT_VALUES, 'newest');

  const wearCounts = useMemo(() => buildWearCountMap(items, wearLogs), [items, wearLogs]);
  const availableTags = useMemo(() => collectAvailableTags(items), [items]);

  const filteredItems = useMemo(
    () =>
      filterAndSortItems(items, wearCounts, {
        category,
        color,
        season,
        q,
        tag,
        fit,
        storage,
        forSale,
        wear,
        cpw,
        sort,
      }),
    [items, wearCounts, category, color, season, q, tag, fit, storage, forSale, wear, cpw, sort],
  );

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    const isDefault =
      value === 'all' || (key === 'sort' && value === 'newest');
    if (isDefault) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setSearchParams(params);
  };

  const updateSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (!value) {
      params.delete('q');
    } else {
      params.set('q', value);
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Wardrobe</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </Button>
      </div>

      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Search by name, brand, tags, notes..."
          value={q}
          onChange={(e) => updateSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <FilterBar
        selectedCategory={category}
        selectedColor={color}
        selectedSeason={season}
        selectedTag={tag}
        selectedFit={fit}
        selectedStorage={storage}
        selectedForSale={forSale}
        selectedWear={wear}
        selectedCpw={cpw}
        selectedSort={sort}
        storageSpaces={storageSpaces}
        availableTags={availableTags}
        onCategoryChange={(v) => updateFilter('category', v)}
        onColorChange={(v) => updateFilter('color', v)}
        onSeasonChange={(v) => updateFilter('season', v)}
        onTagChange={(v) => updateFilter('tag', v)}
        onFitChange={(v) => updateFilter('fit', v)}
        onStorageChange={(v) => updateFilter('storage', v)}
        onForSaleChange={(v) => updateFilter('forSale', v)}
        onWearChange={(v) => updateFilter('wear', v)}
        onCpwChange={(v) => updateFilter('cpw', v)}
        onSortChange={(v) => updateFilter('sort', v)}
        onClear={clearFilters}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          title="Your wardrobe is empty"
          description="Start by adding your first clothing item. Take a photo or upload an image to catalog your clothes."
          action={{ label: 'Add Your First Item', onClick: () => setIsAddModalOpen(true) }}
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No items match your search"
          description="Try different keywords or adjust your filters."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          </p>
          <ItemGrid items={filteredItems} />
        </div>
      )}

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Item" size="lg">
        <ItemForm onClose={() => setIsAddModalOpen(false)} />
      </Modal>
    </div>
  );
}
