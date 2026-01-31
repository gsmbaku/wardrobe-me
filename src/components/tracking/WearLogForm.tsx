import { useState } from 'react';
import { useWearLog } from '../../hooks/useWearLog';
import { useWardrobe } from '../../hooks/useWardrobe';
import { useOutfits } from '../../hooks/useOutfits';
import { useThumbnailURL } from '../../hooks/useImageDB';
import { useToast } from '../common/Toast';
import { Button } from '../common';
import type { WardrobeItem } from '../../types';

interface WearLogFormProps {
  date: string;
  onClose: () => void;
}

function ItemThumbnail({ item, isSelected, onToggle }: { item: WardrobeItem; isSelected: boolean; onToggle: () => void }) {
  const url = useThumbnailURL(item.imageId);

  return (
    <button
      onClick={onToggle}
      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
        isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-transparent hover:border-gray-300'
      }`}
    >
      {url ? (
        <img src={url} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-100" />
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

export default function WearLogForm({ date, onClose }: WearLogFormProps) {
  const { addWearLog, getLogsForDate, deleteWearLog } = useWearLog();
  const { items } = useWardrobe();
  const { outfits, getOutfit } = useOutfits();
  const { showToast } = useToast();

  const existingLogs = getLogsForDate(date);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState<'outfit' | 'items'>('items');

  const toggleItem = (itemId: string) => {
    setSelectedOutfitId(null);
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const selectOutfit = (outfitId: string) => {
    const outfit = getOutfit(outfitId);
    if (outfit) {
      setSelectedOutfitId(outfitId);
      setSelectedItemIds(outfit.items.map((i) => i.itemId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedItemIds.length === 0) {
      showToast('Please select at least one item', 'error');
      return;
    }

    addWearLog({
      date,
      outfitId: selectedOutfitId || undefined,
      itemIds: selectedItemIds,
      notes: notes.trim() || undefined,
    });

    showToast('Wear logged', 'success');
    onClose();
  };

  const handleDeleteLog = (logId: string) => {
    deleteWearLog(logId);
    showToast('Log deleted', 'success');
  };

  return (
    <div className="space-y-6">
      {existingLogs.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Existing logs for this day</h3>
          <div className="space-y-2">
            {existingLogs.map((log) => {
              const outfit = log.outfitId ? getOutfit(log.outfitId) : null;
              return (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {outfit ? outfit.name : `${log.itemIds.length} items`}
                    </p>
                    {log.notes && <p className="text-xs text-gray-500">{log.notes}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setMode('items')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'items' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
            }`}
          >
            Individual Items
          </button>
          <button
            type="button"
            onClick={() => setMode('outfit')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === 'outfit' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
            }`}
          >
            From Outfit
          </button>
        </div>

        {mode === 'outfit' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select an Outfit</label>
            {outfits.length === 0 ? (
              <p className="text-sm text-gray-500">No outfits created yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {outfits.map((outfit) => (
                  <button
                    key={outfit.id}
                    type="button"
                    onClick={() => selectOutfit(outfit.id)}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-colors ${
                      selectedOutfitId === outfit.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{outfit.name}</p>
                    <p className="text-sm text-gray-500">{outfit.items.length} items</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Items ({selectedItemIds.length} selected)
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <ItemThumbnail
                  key={item.id}
                  item={item}
                  isSelected={selectedItemIds.includes(item.id)}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this wear..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Log Wear</Button>
        </div>
      </form>
    </div>
  );
}
