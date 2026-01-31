import { useState } from 'react';
import { useThumbnailURL } from '../../hooks/useImageDB';
import { useWardrobe } from '../../hooks/useWardrobe';
import { useOutfits } from '../../hooks/useOutfits';
import { useToast } from '../common/Toast';
import { Card, Button, Modal } from '../common';
import type { Outfit } from '../../types';

interface OutfitCardProps {
  outfit: Outfit;
  onEdit: () => void;
}

function OutfitThumbnail({ imageId }: { imageId: string | undefined }) {
  const url = useThumbnailURL(imageId);

  if (!url) {
    return <div className="w-full h-full bg-gray-200" />;
  }

  return <img src={url} alt="" className="w-full h-full object-cover" />;
}

export default function OutfitCard({ outfit, onEdit }: OutfitCardProps) {
  const { getItem } = useWardrobe();
  const { deleteOutfit } = useOutfits();
  const { showToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const previewItems = outfit.items.slice(0, 4);
  const remainingCount = outfit.items.length - 4;

  const handleDelete = () => {
    deleteOutfit(outfit.id);
    showToast('Outfit deleted', 'success');
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Card padding="none" className="overflow-hidden group">
        <div className="aspect-square bg-gray-100 relative">
          <div className="grid grid-cols-2 gap-0.5 p-0.5 h-full">
            {previewItems.map((itemPos) => {
              const item = getItem(itemPos.itemId);
              return (
                <div key={itemPos.itemId} className="relative overflow-hidden">
                  <OutfitThumbnail imageId={item?.imageId} />
                </div>
              );
            })}
            {previewItems.length < 4 &&
              Array.from({ length: 4 - previewItems.length }).map((_, idx) => (
                <div key={`empty-${idx}`} className="bg-gray-200" />
              ))}
          </div>

          {remainingCount > 0 && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full">
              +{remainingCount} more
            </div>
          )}

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              onClick={onEdit}
              className="p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-medium text-gray-900 truncate">{outfit.name}</h3>
          <p className="text-sm text-gray-500">{outfit.items.length} items</p>
        </div>
      </Card>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Outfit">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{outfit.name}"? This action cannot be undone.
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
