import { useImageURL } from '../../hooks/useImageDB';
import { useWearLog } from '../../hooks/useWearLog';
import { Button } from '../common';
import type { WardrobeItem } from '../../types';
import { CATEGORIES, COLORS, SEASONS, FITS, ITEM_TAGS } from '../../utils/constants';

interface ItemDetailProps {
  item: WardrobeItem;
  onDelete: () => void;
  onEdit: () => void;
}

export default function ItemDetail({ item, onDelete, onEdit }: ItemDetailProps) {
  const imageUrl = useImageURL(item.imageId);
  const { getWearCountForItem } = useWearLog();

  const wearCount = getWearCountForItem(item.id);
  const categoryLabel = CATEGORIES.find((c) => c.value === item.category)?.label;
  const colorInfo = COLORS.find((c) => c.value === item.color);
  const fitLabel = item.fit ? FITS.find((f) => f.value === item.fit)?.label : null;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
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
          {item.forSale && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
              For Sale
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

          {item.size && (
            <div>
              <label className="text-sm text-gray-500">Size</label>
              <p className="font-medium text-gray-900">{item.size}</p>
            </div>
          )}

          {fitLabel && (
            <div>
              <label className="text-sm text-gray-500">Fit</label>
              <p className="font-medium text-gray-900">{fitLabel}</p>
            </div>
          )}

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

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div>
          <label className="text-sm text-gray-500">Tags</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {item.tags.map((tag) => {
              const presetTag = ITEM_TAGS.find((t) => t.value === tag);
              return (
                <span
                  key={tag}
                  className="px-2 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
                >
                  {presetTag?.label || tag}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* For Sale Section */}
      {item.forSale && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-green-800">This item is for sale</span>
          </div>
          {item.saleLink && (
            <a
              href={item.saleLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-green-700 hover:text-green-900 text-sm font-medium"
            >
              View Listing
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      )}

      {item.notes && (
        <div>
          <label className="text-sm text-gray-500">Notes</label>
          <p className="font-medium text-gray-900 whitespace-pre-wrap">{item.notes}</p>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onEdit}>
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </Button>
        <Button variant="danger" onClick={onDelete}>
          Delete Item
        </Button>
      </div>
    </div>
  );
}
