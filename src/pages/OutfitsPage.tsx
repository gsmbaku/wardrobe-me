import { useState } from 'react';
import { useOutfits } from '../hooks/useOutfits';
import { useWardrobe } from '../hooks/useWardrobe';
import { Button, EmptyState, Modal } from '../components/common';
import OutfitGrid from '../components/outfits/OutfitGrid';
import OutfitBuilder from '../components/outfits/OutfitBuilder';
import { SEASONS, OCCASIONS } from '../utils/constants';
import type { Season, Occasion } from '../types';

export default function OutfitsPage() {
  const { outfits } = useOutfits();
  const { items } = useWardrobe();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingOutfitId, setEditingOutfitId] = useState<string | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<Season | ''>('');
  const [occasionFilter, setOccasionFilter] = useState<Occasion | ''>('');

  const handleEdit = (outfitId: string) => {
    setEditingOutfitId(outfitId);
    setIsBuilderOpen(true);
  };

  const handleClose = () => {
    setIsBuilderOpen(false);
    setEditingOutfitId(null);
  };

  const filteredOutfits = outfits.filter((outfit) => {
    if (seasonFilter && (!outfit.seasons || !outfit.seasons.includes(seasonFilter))) return false;
    if (occasionFilter && (!outfit.occasions || !outfit.occasions.includes(occasionFilter))) return false;
    return true;
  });

  const hasActiveFilter = seasonFilter !== '' || occasionFilter !== '';

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

      {items.length >= 2 && outfits.length > 0 && (
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value as Season | '')}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Seasons</option>
            {SEASONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={occasionFilter}
            onChange={(e) => setOccasionFilter(e.target.value as Occasion | '')}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Occasions</option>
            {OCCASIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {hasActiveFilter && (
            <button
              onClick={() => { setSeasonFilter(''); setOccasionFilter(''); }}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Clear filters
            </button>
          )}

          {hasActiveFilter && (
            <span className="text-sm text-gray-500 ml-auto">
              {filteredOutfits.length} of {outfits.length} outfits
            </span>
          )}
        </div>
      )}

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
      ) : filteredOutfits.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
          }
          title="No outfits match"
          description="No outfits have those tags. Try a different filter or clear the current ones."
          action={{ label: 'Clear Filters', onClick: () => { setSeasonFilter(''); setOccasionFilter(''); } }}
        />
      ) : (
        <OutfitGrid outfits={filteredOutfits} onEdit={handleEdit} />
      )}

      <Modal isOpen={isBuilderOpen} onClose={handleClose} title={editingOutfitId ? 'Edit Outfit' : 'Create Outfit'} size="full">
        <OutfitBuilder outfitId={editingOutfitId} onClose={handleClose} />
      </Modal>
    </div>
  );
}
