import { useState } from 'react';
import { useWearLog } from '../../hooks/useWearLog';
import { useWardrobe } from '../../hooks/useWardrobe';
import { useOutfits } from '../../hooks/useOutfits';
import { useThumbnailURL } from '../../hooks/useImageDB';
import { useToast } from '../common/Toast';
import type { WardrobeItem, Category } from '../../types';

interface WearLogFormProps {
  date: string;
  onClose: () => void;
}

const CATEGORY_FILTERS: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'shorts', label: 'Shorts' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'bags', label: 'Bags' },
];

function ItemCard({
  item,
  isSelected,
  onToggle,
}: {
  item: WardrobeItem;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const url = useThumbnailURL(item.imageId);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative bg-white rounded-[16px] overflow-hidden text-left transition-all ${
        isSelected
          ? 'ring-2 ring-[#8e51ff] shadow-[0px_0px_0px_1px_rgba(142,81,255,0.3)]'
          : 'shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05),0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]'
      }`}
    >
      {/* Photo */}
      <div className="aspect-[184/230] w-full overflow-hidden bg-gray-100">
        {url ? (
          <img src={url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
      </div>

      {/* Info */}
      <div className="px-[10px] pt-[10px] pb-[10px]">
        <p className="text-[13px] font-medium leading-[19.5px] text-[#0a0a0a] truncate tracking-[-0.076px]">
          {item.name}
        </p>
        <p className="text-[11px] font-medium leading-[16.5px] text-[#717182] capitalize tracking-[0.064px]">
          {item.category}
        </p>
      </div>

      {/* Select button */}
      <div
        className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] transition-colors ${
          isSelected ? 'bg-[#7008e7]' : 'bg-white/80'
        }`}
      >
        {isSelected ? (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-[#717182]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </div>
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
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const filteredItems =
    categoryFilter === 'all' ? items : items.filter((i) => i.category === categoryFilter);

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
    <form onSubmit={handleSubmit} className="flex flex-col -mx-6 -my-6" style={{ maxHeight: '85vh' }}>
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-0 shrink-0">
        <div>
          <h2 className="text-[20px] font-medium leading-[30px] text-[#0a0a0a] tracking-[-0.449px]">
            Log Wear
          </h2>
          <p className="text-[13px] font-normal leading-[19.5px] text-[#717182] tracking-[-0.076px]">
            {formattedDate}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors mt-1"
        >
          <svg className="w-5 h-5 text-[#717182]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Segmented control */}
      <div className="mx-5 mt-5 shrink-0">
        <div className="flex p-1 bg-[rgba(236,236,240,0.5)] rounded-[14px] h-[43.5px]">
          <button
            type="button"
            onClick={() => setMode('items')}
            className={`flex-1 rounded-[10px] text-[13px] font-medium leading-[19.5px] tracking-[-0.076px] transition-all ${
              mode === 'items'
                ? 'bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] text-[#030213]'
                : 'text-[#717182]'
            }`}
          >
            Individual Items
          </button>
          <button
            type="button"
            onClick={() => setMode('outfit')}
            className={`flex-1 rounded-[10px] text-[13px] font-medium leading-[19.5px] tracking-[-0.076px] transition-all ${
              mode === 'outfit'
                ? 'bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.06)] text-[#030213]'
                : 'text-[#717182]'
            }`}
          >
            From Outfit
          </button>
        </div>
      </div>

      {/* Category filter (items mode only) */}
      {mode === 'items' && (
        <div className="mt-3 shrink-0">
          <div className="flex gap-[6px] overflow-x-auto pl-5 pr-5 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {CATEGORY_FILTERS.map((cat) => {
              const isActive = categoryFilter === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`shrink-0 h-7 px-3 rounded-[10px] text-[12px] font-medium leading-[18px] transition-colors ${
                    isActive
                      ? 'bg-[#f5f3ff] border border-[#8e51ff] text-[#7008e7]'
                      : 'text-[#717182] border border-transparent hover:border-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-5 pt-3 pb-3 min-h-0">
        {/* Item grid */}
        {mode === 'items' ? (
          filteredItems.length === 0 ? (
            <p className="text-sm text-[#717182] text-center py-8">No items in this category</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isSelected={selectedItemIds.includes(item.id)}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}
            </div>
          )
        ) : (
          /* Outfit list */
          <div className="space-y-2">
            {outfits.length === 0 ? (
              <p className="text-sm text-[#717182] text-center py-8">No outfits created yet</p>
            ) : (
              outfits.map((outfit) => (
                <button
                  key={outfit.id}
                  type="button"
                  onClick={() => selectOutfit(outfit.id)}
                  className={`w-full p-3 text-left rounded-[12px] border transition-colors ${
                    selectedOutfitId === outfit.id
                      ? 'border-[#8e51ff] bg-[#f5f3ff]'
                      : 'border-[rgba(0,0,0,0.08)] bg-white hover:border-[rgba(0,0,0,0.15)]'
                  }`}
                >
                  <p className="text-[13px] font-medium text-[#0a0a0a]">{outfit.name}</p>
                  <p className="text-[11px] text-[#717182] mt-0.5">{outfit.items.length} items</p>
                </button>
              ))
            )}
          </div>
        )}

        {/* Existing logs */}
        {existingLogs.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-[#717182] mb-2">Logged today</p>
            <div className="space-y-2">
              {existingLogs.map((log) => {
                const outfit = log.outfitId ? getOutfit(log.outfitId) : null;
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between px-3 py-2 bg-white rounded-[12px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05),0px_1px_3px_0px_rgba(0,0,0,0.08)]"
                  >
                    <div>
                      <p className="text-[13px] font-medium text-[#0a0a0a]">
                        {outfit ? outfit.name : `${log.itemIds.length} item${log.itemIds.length !== 1 ? 's' : ''}`}
                      </p>
                      {log.notes && (
                        <p className="text-[11px] text-[#717182] mt-0.5">{log.notes}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-[#717182] mb-1.5">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this wear..."
            rows={2}
            className="w-full px-3 py-2 border border-[rgba(0,0,0,0.1)] rounded-[10px] text-[13px] text-[#0a0a0a] placeholder:text-[#b0b0be] focus:outline-none focus:ring-2 focus:ring-[#8e51ff] focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 flex gap-3 px-5 pt-4 pb-5 border-t border-[rgba(0,0,0,0.1)]">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 h-11 rounded-[14px] bg-[#ececf0] text-[#717182] text-[16px] font-medium leading-6 tracking-[-0.313px] transition-opacity hover:opacity-80"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 h-11 rounded-[14px] bg-[#ddd6ff] text-[#a684ff] text-[16px] font-medium leading-6 tracking-[-0.313px] transition-opacity hover:opacity-80"
        >
          Log Wear
        </button>
      </div>
    </form>
  );
}
