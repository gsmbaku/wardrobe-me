import { useThumbnailURL } from '../../hooks/useImageDB';
import type { WardrobeItem } from '../../types';

interface WearCount {
  item: WardrobeItem;
  count: number;
}

interface MostWornChartProps {
  items: WearCount[];
}

function ChartItem({ item, count, maxCount }: { item: WardrobeItem; count: number; maxCount: number }) {
  const thumbnailUrl = useThumbnailURL(item.imageId);
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-900 truncate">{item.name}</span>
          <span className="text-sm text-gray-500 ml-2">{count}x</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function MostWornChart({ items }: MostWornChartProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No wear data yet</p>
        <p className="text-sm">Start logging what you wear to see stats</p>
      </div>
    );
  }

  const maxCount = Math.max(...items.map((i) => i.count));

  return (
    <div className="space-y-4">
      {items.map(({ item, count }) => (
        <ChartItem key={item.id} item={item} count={count} maxCount={maxCount} />
      ))}
    </div>
  );
}
