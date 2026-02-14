import { useState } from 'react';
import type { WardrobeItem, Category } from '../../types';
import { useWardrobe } from '../../hooks/useWardrobe';
import { useThumbnailURL } from '../../hooks/useImageDB';
import { CATEGORIES } from '../../utils/constants';

interface ItemSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onToggleItem: (item: WardrobeItem) => void;
}

function ItemCard({
  item,
  isSelected,
  onToggle
}: {
  item: WardrobeItem;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const thumbnailUrl = useThumbnailURL(item.imageId);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-200'
          : 'border-transparent hover:border-gray-300'
      }`}
    >
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-xs">{item.name}</span>
        </div>
      )}
      {isSelected && (
        <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
          <div className="bg-indigo-600 rounded-full p-1">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <p className="text-white text-xs truncate">{item.name}</p>
      </div>
    </button>
  );
}

export default function ItemSelector({
  isOpen,
  onClose,
  selectedIds,
  onToggleItem
}: ItemSelectorProps) {
  const { items } = useWardrobe();
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');

  if (!isOpen) return null;

  const filteredItems = filterCategory === 'all'
    ? items
    : items.filter(item => item.category === filterCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-white w-full md:w-[500px] md:max-h-[80vh] max-h-[70vh] rounded-t-2xl md:rounded-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Select Items ({selectedIds.length} selected)
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -m-2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3 border-b border-gray-100 overflow-x-auto">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                filterCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFilterCategory(cat.value)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                  filterCategory === cat.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredItems.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No items found</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filteredItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.includes(item.id)}
                  onToggle={() => onToggleItem(item)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
