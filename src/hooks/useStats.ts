import { useMemo } from 'react';
import { useWardrobe } from './useWardrobe';
import { useOutfits } from './useOutfits';
import { useWearLog } from './useWearLog';
import type { WardrobeItem, Category } from '../types';

interface WearCount {
  item: WardrobeItem;
  count: number;
}

interface CategoryCount {
  category: Category;
  count: number;
}

interface Stats {
  totalItems: number;
  totalOutfits: number;
  totalWears: number;
  mostWorn: WearCount[];
  leastWorn: WearCount[];
  neverWorn: WardrobeItem[];
  neverWornCount: number;
  categoryBreakdown: CategoryCount[];
}

export function useStats(): Stats {
  const { items } = useWardrobe();
  const { outfits } = useOutfits();
  const { wearLogs } = useWearLog();

  return useMemo(() => {
    // Calculate wear counts per item
    const wearCounts = new Map<string, number>();
    items.forEach((item) => wearCounts.set(item.id, 0));

    wearLogs.forEach((log) => {
      log.itemIds.forEach((itemId) => {
        const current = wearCounts.get(itemId) || 0;
        wearCounts.set(itemId, current + 1);
      });
    });

    // Create sorted lists
    const itemsWithCounts: WearCount[] = items.map((item) => ({
      item,
      count: wearCounts.get(item.id) || 0,
    }));

    const sortedByWear = [...itemsWithCounts].sort((a, b) => b.count - a.count);
    const mostWorn = sortedByWear.filter((w) => w.count > 0).slice(0, 5);
    const leastWorn = sortedByWear.filter((w) => w.count > 0).slice(-5).reverse();
    const neverWorn = itemsWithCounts.filter((w) => w.count === 0).map((w) => w.item);

    // Category breakdown
    const categoryMap = new Map<Category, number>();
    items.forEach((item) => {
      const current = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, current + 1);
    });

    const categoryBreakdown: CategoryCount[] = Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalItems: items.length,
      totalOutfits: outfits.length,
      totalWears: wearLogs.length,
      mostWorn,
      leastWorn,
      neverWorn,
      neverWornCount: neverWorn.length,
      categoryBreakdown,
    };
  }, [items, outfits, wearLogs]);
}
