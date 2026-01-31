import { useState, useEffect } from 'react';
import { useOutfits } from '../../hooks/useOutfits';
import { useToast } from '../common/Toast';
import { Button } from '../common';
import OutfitItemPicker from './OutfitItemPicker';
import OutfitCanvas from './OutfitCanvas';
import type { OutfitItemPosition } from '../../types';

interface OutfitBuilderProps {
  outfitId?: string | null;
  onClose: () => void;
}

export default function OutfitBuilder({ outfitId, onClose }: OutfitBuilderProps) {
  const { addOutfit, updateOutfit, getOutfit } = useOutfits();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<OutfitItemPosition[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (outfitId) {
      const existing = getOutfit(outfitId);
      if (existing) {
        setName(existing.name);
        setDescription(existing.description || '');
        setItems(existing.items);
      }
    }
  }, [outfitId, getOutfit]);

  const handleItemSelect = (itemId: string) => {
    const exists = items.find((i) => i.itemId === itemId);
    if (exists) {
      setItems(items.filter((i) => i.itemId !== itemId));
    } else {
      const maxZIndex = items.reduce((max, i) => Math.max(max, i.position.zIndex), 0);
      setItems([
        ...items,
        {
          itemId,
          position: { x: 50, y: 50, scale: 1, zIndex: maxZIndex + 1 },
        },
      ]);
    }
  };

  const handleUpdateItem = (itemId: string, position: OutfitItemPosition['position']) => {
    setItems(items.map((i) => (i.itemId === itemId ? { ...i, position } : i)));
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((i) => i.itemId !== itemId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter a name', 'error');
      return;
    }

    if (items.length < 2) {
      showToast('Please add at least 2 items', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (outfitId) {
        updateOutfit(outfitId, {
          name: name.trim(),
          description: description.trim() || undefined,
          items,
        });
        showToast('Outfit updated', 'success');
      } else {
        addOutfit({
          name: name.trim(),
          description: description.trim() || undefined,
          items,
        });
        showToast('Outfit created', 'success');
      }
      onClose();
    } catch {
      showToast('Failed to save outfit', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outfit Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Casual Friday"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Items ({items.length} selected)
            </label>
            <OutfitItemPicker
              selectedIds={items.map((i) => i.itemId)}
              onSelect={handleItemSelect}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Arrange Your Outfit
          </label>
          <OutfitCanvas
            items={items}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
          />
          <p className="text-xs text-gray-500 mt-2">
            Drag items to position. Use controls to resize and layer.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : outfitId ? 'Update Outfit' : 'Create Outfit'}
        </Button>
      </div>
    </form>
  );
}
