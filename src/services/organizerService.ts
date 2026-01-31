import type { WardrobeItem, WearLogEntry, Season } from '../types';

export interface OrganizationSuggestion {
  id: string;
  type: 'seasonal' | 'frequency' | 'category' | 'color' | 'unassigned' | 'unworn';
  title: string;
  description: string;
  icon: string;
  items: WardrobeItem[];
  suggestedAction?: string;
}

function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

function getItemWearCount(itemId: string, wearLogs: WearLogEntry[]): number {
  return wearLogs.filter(log => log.itemIds.includes(itemId)).length;
}

function getLastWornDate(itemId: string, wearLogs: WearLogEntry[]): Date | null {
  const logsWithItem = wearLogs
    .filter(log => log.itemIds.includes(itemId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return logsWithItem.length > 0 ? new Date(logsWithItem[0].date) : null;
}

function daysSince(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function generateSuggestions(
  items: WardrobeItem[],
  wearLogs: WearLogEntry[]
): OrganizationSuggestion[] {
  const suggestions: OrganizationSuggestion[] = [];
  const currentSeason = getCurrentSeason();

  // 1. Unassigned items - items not assigned to any storage space
  const unassignedItems = items.filter(item => !item.storageSpaceId);
  if (unassignedItems.length > 0) {
    suggestions.push({
      id: 'unassigned',
      type: 'unassigned',
      title: 'Items need a home',
      description: `${unassignedItems.length} item${unassignedItems.length > 1 ? 's are' : ' is'} not assigned to any storage space`,
      icon: '📍',
      items: unassignedItems,
      suggestedAction: 'Assign these items to a storage space',
    });
  }

  // 2. Seasonal rotation - off-season items that should be stored away
  const offSeasonItems = items.filter(item => {
    if (item.seasons.includes('all-season')) return false;
    return !item.seasons.includes(currentSeason);
  });
  if (offSeasonItems.length > 0) {
    suggestions.push({
      id: 'seasonal-rotation',
      type: 'seasonal',
      title: `Store ${offSeasonItems.length} off-season items`,
      description: `These items are for other seasons - consider moving them to storage`,
      icon: '🔄',
      items: offSeasonItems,
      suggestedAction: 'Move to storage bin or back of closet',
    });
  }

  // 3. Most worn items - keep accessible
  const itemsWithWearCount = items.map(item => ({
    item,
    wearCount: getItemWearCount(item.id, wearLogs),
  }));
  const mostWornItems = itemsWithWearCount
    .filter(({ wearCount }) => wearCount >= 3)
    .sort((a, b) => b.wearCount - a.wearCount)
    .slice(0, 10)
    .map(({ item }) => item);

  if (mostWornItems.length > 0) {
    suggestions.push({
      id: 'most-worn',
      type: 'frequency',
      title: 'Keep your favorites accessible',
      description: `Your ${mostWornItems.length} most-worn items should be at eye level`,
      icon: '⭐',
      items: mostWornItems,
      suggestedAction: 'Place at eye level or front of closet',
    });
  }

  // 4. Unworn items - consider donating
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const unwornItems = items.filter(item => {
    const lastWorn = getLastWornDate(item.id, wearLogs);
    const createdAt = new Date(item.createdAt);

    // Never worn and added more than 60 days ago
    if (!lastWorn && daysSince(createdAt) > 60) return true;

    // Not worn in the last 6 months
    if (lastWorn && lastWorn < sixMonthsAgo) return true;

    return false;
  });

  if (unwornItems.length > 0) {
    suggestions.push({
      id: 'unworn',
      type: 'unworn',
      title: 'Rarely worn items',
      description: `${unwornItems.length} item${unwornItems.length > 1 ? 's haven\'t' : ' hasn\'t'} been worn in a while`,
      icon: '🤔',
      items: unwornItems,
      suggestedAction: 'Consider donating, selling, or styling differently',
    });
  }

  // 5. Color organization by category
  const categories = [...new Set(items.map(item => item.category))];
  for (const category of categories) {
    const categoryItems = items.filter(item => item.category === category);
    if (categoryItems.length >= 5) {
      const hasMultipleColors = new Set(categoryItems.map(item => item.color)).size >= 3;
      if (hasMultipleColors) {
        suggestions.push({
          id: `color-${category}`,
          type: 'color',
          title: `Organize ${category} by color`,
          description: `Group your ${categoryItems.length} ${category} from dark to light for easier outfit building`,
          icon: '🎨',
          items: categoryItems,
          suggestedAction: 'Arrange: black → navy → gray → colors → white',
        });
        break; // Only show one color suggestion
      }
    }
  }

  return suggestions;
}

export function getStorageSpaceStats(
  spaceId: string,
  items: WardrobeItem[]
): { itemCount: number; categories: Record<string, number> } {
  const spaceItems = items.filter(item => item.storageSpaceId === spaceId);
  const categories: Record<string, number> = {};

  for (const item of spaceItems) {
    categories[item.category] = (categories[item.category] || 0) + 1;
  }

  return {
    itemCount: spaceItems.length,
    categories,
  };
}
