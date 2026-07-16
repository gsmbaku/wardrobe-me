import type { Category, Fit, Season, WardrobeItem, WearLogEntry } from '../types';

export type WearFilter = 'all' | 'never' | 'worn' | '5plus';
export type ForSaleFilter = 'all' | 'yes' | 'no';
export type CpwFilter = 'all' | 'hasPrice' | 'deadMoney';
export type SortOption =
  | 'newest'
  | 'oldest'
  | 'mostWorn'
  | 'leastWorn'
  | 'priceHigh'
  | 'priceLow'
  | 'cpwLow'
  | 'cpwHigh';

export interface WardrobeFilterCriteria {
  category: Category | 'all';
  color: string | 'all';
  season: Season | 'all';
  q: string;
  tag: string | 'all';
  fit: Fit | 'all';
  storage: string | 'all';
  forSale: ForSaleFilter;
  wear: WearFilter;
  cpw: CpwFilter;
  sort: SortOption;
}

export function buildWearCountMap(
  items: WardrobeItem[],
  wearLogs: WearLogEntry[],
): Map<string, number> {
  const wearCounts = new Map<string, number>();
  for (const item of items) {
    wearCounts.set(item.id, 0);
  }
  for (const log of wearLogs) {
    for (const itemId of log.itemIds) {
      wearCounts.set(itemId, (wearCounts.get(itemId) || 0) + 1);
    }
  }
  return wearCounts;
}

/** Cost-per-wear; Infinity when priced but never worn; null when no price. */
export function getCostPerWear(price: number | undefined, wearCount: number): number | null {
  if (price === undefined) return null;
  if (wearCount <= 0) return Infinity;
  return price / wearCount;
}

function compareNullableNumber(
  a: number | null,
  b: number | null,
  direction: 'asc' | 'desc',
): number {
  const aMissing = a === null;
  const bMissing = b === null;
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;
  return direction === 'asc' ? a - b : b - a;
}

export function filterAndSortItems(
  items: WardrobeItem[],
  wearCounts: Map<string, number>,
  criteria: WardrobeFilterCriteria,
): WardrobeItem[] {
  const query = criteria.q.trim().toLowerCase();

  const filtered = items.filter((item) => {
    if (criteria.category !== 'all' && item.category !== criteria.category) return false;
    if (criteria.color !== 'all' && item.color !== criteria.color) return false;
    if (criteria.season !== 'all' && !item.seasons.includes(criteria.season)) return false;

    if (criteria.tag !== 'all' && !(item.tags?.includes(criteria.tag) ?? false)) return false;
    if (criteria.fit !== 'all' && item.fit !== criteria.fit) return false;

    if (criteria.storage !== 'all') {
      if (criteria.storage === 'none') {
        if (item.storageSpaceId) return false;
      } else if (item.storageSpaceId !== criteria.storage) {
        return false;
      }
    }

    if (criteria.forSale === 'yes' && !item.forSale) return false;
    if (criteria.forSale === 'no' && item.forSale) return false;

    const wearCount = wearCounts.get(item.id) || 0;
    if (criteria.wear === 'never' && wearCount !== 0) return false;
    if (criteria.wear === 'worn' && wearCount < 1) return false;
    if (criteria.wear === '5plus' && wearCount < 5) return false;

    if (criteria.cpw === 'hasPrice' && item.price === undefined) return false;
    if (criteria.cpw === 'deadMoney' && !(item.price !== undefined && wearCount === 0)) {
      return false;
    }

    if (query) {
      const match =
        item.name.toLowerCase().includes(query) ||
        (item.brand?.toLowerCase().includes(query) ?? false) ||
        (item.tags?.some((t) => t.toLowerCase().includes(query)) ?? false) ||
        (item.notes?.toLowerCase().includes(query) ?? false);
      if (!match) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    const aWears = wearCounts.get(a.id) || 0;
    const bWears = wearCounts.get(b.id) || 0;

    switch (criteria.sort) {
      case 'oldest':
        return a.createdAt.localeCompare(b.createdAt);
      case 'mostWorn':
        return bWears - aWears || b.createdAt.localeCompare(a.createdAt);
      case 'leastWorn':
        return aWears - bWears || b.createdAt.localeCompare(a.createdAt);
      case 'priceHigh':
        return compareNullableNumber(a.price ?? null, b.price ?? null, 'desc');
      case 'priceLow':
        return compareNullableNumber(a.price ?? null, b.price ?? null, 'asc');
      case 'cpwLow':
        return compareNullableNumber(
          getCostPerWear(a.price, aWears),
          getCostPerWear(b.price, bWears),
          'asc',
        );
      case 'cpwHigh':
        return compareNullableNumber(
          getCostPerWear(a.price, aWears),
          getCostPerWear(b.price, bWears),
          'desc',
        );
      case 'newest':
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
}

export function collectAvailableTags(items: WardrobeItem[]): string[] {
  const tags = new Set<string>();
  for (const item of items) {
    for (const tag of item.tags ?? []) {
      tags.add(tag);
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}
