import { useThumbnailURL } from '../../hooks/useImageDB';
import { useWardrobe } from '../../hooks/useWardrobe';
import { Modal } from '../common';
import type { Outfit, WardrobeItem, Category } from '../../types';

interface OutfitViewModalProps {
  outfit: Outfit;
  isOpen: boolean;
  onClose: () => void;
}

const SECTION_CATEGORIES: Record<string, Category[]> = {
  accessories: ['accessories', 'bags'],
  top: ['tops', 'outerwear', 'dresses'],
  bottom: ['bottoms'],
  shoes: ['shoes'],
};

const SECTION_ORDER = ['accessories', 'top', 'bottom', 'shoes'] as const;

const SECTION_LABELS: Record<string, string> = {
  accessories: 'Accessories',
  top: 'Top',
  bottom: 'Bottom',
  shoes: 'Shoes',
};

function ItemThumbnail({ item }: { item: WardrobeItem }) {
  const url = useThumbnailURL(item.imageId);

  return (
    <div className="flex flex-col items-center w-20">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
        {url ? (
          <img src={url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
      <span className="text-xs text-gray-700 mt-1 text-center truncate w-full">
        {item.name}
      </span>
    </div>
  );
}

function groupItemsBySection(
  outfit: Outfit,
  getItem: (id: string) => WardrobeItem | undefined
): Record<string, WardrobeItem[]> {
  const grouped: Record<string, WardrobeItem[]> = {
    accessories: [],
    top: [],
    bottom: [],
    shoes: [],
  };

  for (const pos of outfit.items) {
    const item = getItem(pos.itemId);
    if (!item) continue;

    for (const [section, categories] of Object.entries(SECTION_CATEGORIES)) {
      if (categories.includes(item.category)) {
        grouped[section].push(item);
        break;
      }
    }
  }

  return grouped;
}

export default function OutfitViewModal({ outfit, isOpen, onClose }: OutfitViewModalProps) {
  const { getItem } = useWardrobe();
  const groupedItems = groupItemsBySection(outfit, getItem);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={outfit.name} size="lg">
      <div className="space-y-6">
        {SECTION_ORDER.map((section) => {
          const items = groupedItems[section];
          if (items.length === 0) return null;

          return (
            <div key={section}>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {SECTION_LABELS[section]}
              </h3>
              <div className="flex flex-wrap gap-4">
                {items.map((item) => (
                  <ItemThumbnail key={item.id} item={item} />
                ))}
              </div>
            </div>
          );
        })}

        {outfit.description && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">{outfit.description}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
