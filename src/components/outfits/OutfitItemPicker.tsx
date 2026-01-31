import { useState } from 'react';
import { useWardrobe } from '../../hooks/useWardrobe';
import { useThumbnailURL } from '../../hooks/useImageDB';
import { CATEGORIES } from '../../utils/constants';
import type { Category, WardrobeItem } from '../../types';

interface OutfitItemPickerProps {
  selectedIds: string[];
  onSelect: (itemId: string) => void;
}

function ItemThumbnail({ item, isSelected, onSelect }: { item: WardrobeItem; isSelected: boolean; onSelect: () => void }) {
  const thumbnailUrl = useThumbnailURL(item.imageId);

  return (
    <button
      onClick={onSelect}
      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
        isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent hover:border-gray-300'
      }`}
    >
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      {isSelected && (
        <div className="absolute top-1 right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

export default function OutfitItemPicker({ selectedIds, onSelect }: OutfitItemPickerProps) {
  const { items } = useWardrobe();
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');

  const filteredItems = filterCategory === 'all'
    ? items
    : items.filter((item) => item.category === filterCategory);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as Category | 'all')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
        {filteredItems.map((item) => (
          <ItemThumbnail
            key={item.id}
            item={item}
            isSelected={selectedIds.includes(item.id)}
            onSelect={() => onSelect(item.id)}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">No items in this category</p>
      )}
    </div>
  );
}
