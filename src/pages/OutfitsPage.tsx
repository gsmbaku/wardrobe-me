import { useState } from 'react';
import { useOutfits } from '../hooks/useOutfits';
import { useWardrobe } from '../hooks/useWardrobe';
import { Button, EmptyState, Modal } from '../components/common';
import OutfitGrid from '../components/outfits/OutfitGrid';
import OutfitBuilder from '../components/outfits/OutfitBuilder';

export default function OutfitsPage() {
  const { outfits } = useOutfits();
  const { items } = useWardrobe();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingOutfitId, setEditingOutfitId] = useState<string | null>(null);

  const handleEdit = (outfitId: string) => {
    setEditingOutfitId(outfitId);
    setIsBuilderOpen(true);
  };

  const handleClose = () => {
    setIsBuilderOpen(false);
    setEditingOutfitId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Outfits</h1>
        <Button onClick={() => setIsBuilderOpen(true)} disabled={items.length < 2}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Outfit
        </Button>
      </div>

      {items.length < 2 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="Add more items first"
          description="You need at least 2 items in your wardrobe to create an outfit."
        />
      ) : outfits.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="No outfits yet"
          description="Create your first outfit by combining items from your wardrobe."
          action={{ label: 'Create Your First Outfit', onClick: () => setIsBuilderOpen(true) }}
        />
      ) : (
        <OutfitGrid outfits={outfits} onEdit={handleEdit} />
      )}

      <Modal isOpen={isBuilderOpen} onClose={handleClose} title={editingOutfitId ? 'Edit Outfit' : 'Create Outfit'} size="full">
        <OutfitBuilder outfitId={editingOutfitId} onClose={handleClose} />
      </Modal>
    </div>
  );
}
