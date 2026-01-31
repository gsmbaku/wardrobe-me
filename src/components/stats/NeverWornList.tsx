import { useThumbnailURL } from '../../hooks/useImageDB';
import type { WardrobeItem } from '../../types';
import { CATEGORIES } from '../../utils/constants';

interface NeverWornListProps {
  items: WardrobeItem[];
}

function NeverWornItem({ item }: { item: WardrobeItem }) {
  const thumbnailUrl = useThumbnailURL(item.imageId);
  const category = CATEGORIES.find((c) => c.value === item.category)?.label;

  const daysSinceAdded = Math.floor(
    (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-sm text-gray-500">{category}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">Added</p>
        <p className="text-sm font-medium text-gray-700">
          {daysSinceAdded === 0 ? 'Today' : `${daysSinceAdded}d ago`}
        </p>
      </div>
    </div>
  );
}

export default function NeverWornList({ items }: NeverWornListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-green-600">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
        <p className="font-medium">All items have been worn!</p>
        <p className="text-sm text-gray-500">You're making good use of your wardrobe</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {items.map((item) => (
        <NeverWornItem key={item.id} item={item} />
      ))}
    </div>
  );
}
