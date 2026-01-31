import { useImageURL } from '../../hooks/useImageDB';
import { useWearLog } from '../../hooks/useWearLog';
import { Button } from '../common';
import type { WardrobeItem } from '../../types';
import { CATEGORIES, COLORS, SEASONS } from '../../utils/constants';

interface ItemDetailProps {
  item: WardrobeItem;
  onDelete: () => void;
}

export default function ItemDetail({ item, onDelete }: ItemDetailProps) {
  const imageUrl = useImageURL(item.imageId);
  const { getWearCountForItem } = useWearLog();

  const wearCount = getWearCountForItem(item.id);
  const categoryLabel = CATEGORIES.find((c) => c.value === item.category)?.label;
  const colorInfo = COLORS.find((c) => c.value === item.color);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500">Category</label>
            <p className="font-medium text-gray-900">{categoryLabel}</p>
          </div>

          <div>
            <label className="text-sm text-gray-500">Color</label>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border border-gray-200"
                style={{ background: colorInfo?.hex.startsWith('linear') ? colorInfo.hex : colorInfo?.hex }}
              />
              <span className="font-medium text-gray-900">{colorInfo?.label}</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Seasons</label>
            <div className="flex flex-wrap gap-1 mt-1">
              {item.seasons.map((season) => {
                const seasonLabel = SEASONS.find((s) => s.value === season)?.label;
                return (
                  <span
                    key={season}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    {seasonLabel}
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500">Times Worn</label>
            <p className="font-medium text-gray-900">{wearCount}</p>
          </div>

          {item.brand && (
            <div>
              <label className="text-sm text-gray-500">Brand</label>
              <p className="font-medium text-gray-900">{item.brand}</p>
            </div>
          )}

          {item.purchaseDate && (
            <div>
              <label className="text-sm text-gray-500">Purchase Date</label>
              <p className="font-medium text-gray-900">
                {new Date(item.purchaseDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {item.price !== undefined && (
            <div>
              <label className="text-sm text-gray-500">Price</label>
              <p className="font-medium text-gray-900">${item.price.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>

      {item.notes && (
        <div>
          <label className="text-sm text-gray-500">Notes</label>
          <p className="font-medium text-gray-900 whitespace-pre-wrap">{item.notes}</p>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button variant="danger" onClick={onDelete}>
          Delete Item
        </Button>
      </div>
    </div>
  );
}
