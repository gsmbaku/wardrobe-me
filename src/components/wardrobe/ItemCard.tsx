import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThumbnailURL } from '../../hooks/useImageDB';
import { useWardrobe } from '../../hooks/useWardrobe';
import { useWearLog } from '../../hooks/useWearLog';
import { useToast } from '../common/Toast';
import { Card, Button, Modal } from '../common';
import type { WardrobeItem } from '../../types';
import { CATEGORIES, COLORS } from '../../utils/constants';

interface ItemCardProps {
  item: WardrobeItem;
}

export default function ItemCard({ item }: ItemCardProps) {
  const thumbnailUrl = useThumbnailURL(item.imageId);
  const { deleteItem } = useWardrobe();
  const { getWearCountForItem } = useWearLog();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const wearCount = getWearCountForItem(item.id);
  const categoryLabel = CATEGORIES.find((c) => c.value === item.category)?.label;
  const colorInfo = COLORS.find((c) => c.value === item.color);

  const handleDelete = async () => {
    try {
      await deleteItem(item.id);
      showToast('Item deleted', 'success');
    } catch {
      showToast('Failed to delete item', 'error');
    }
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Card padding="none" className="overflow-hidden group">
        <div
          className="aspect-square bg-gray-100 cursor-pointer relative"
          onClick={() => navigate(`/items/${item.id}`)}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* For Sale Badge */}
          {item.forSale && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full shadow-sm">
              For Sale
            </div>
          )}

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {wearCount > 0 && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full">
              Worn {wearCount}x
            </div>
          )}
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
              <p className="text-sm text-gray-500">{categoryLabel}</p>
            </div>
            <div
              className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0"
              style={{ background: colorInfo?.hex.startsWith('linear') ? colorInfo.hex : colorInfo?.hex }}
              title={colorInfo?.label}
            />
          </div>
        </div>
      </Card>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Item">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{item.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
