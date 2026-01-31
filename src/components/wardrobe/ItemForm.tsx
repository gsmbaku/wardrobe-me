import { useState } from 'react';
import { useWardrobe } from '../../hooks/useWardrobe';
import { useToast } from '../common/Toast';
import { Button } from '../common';
import ImageUploader from './ImageUploader';
import { CATEGORIES, SEASONS, COLORS } from '../../utils/constants';
import type { Category, Season } from '../../types';

interface ItemFormProps {
  onClose: () => void;
}

export default function ItemForm({ onClose }: ItemFormProps) {
  const { addItem } = useWardrobe();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('tops');
  const [color, setColor] = useState('black');
  const [seasons, setSeasons] = useState<Season[]>(['all-season']);
  const [brand, setBrand] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSeason = (season: Season) => {
    setSeasons((prev) =>
      prev.includes(season)
        ? prev.filter((s) => s !== season)
        : [...prev, season]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter a name', 'error');
      return;
    }

    if (!image) {
      showToast('Please select an image', 'error');
      return;
    }

    if (seasons.length === 0) {
      showToast('Please select at least one season', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await addItem({
        name: name.trim(),
        category,
        color,
        seasons,
        image,
        brand: brand.trim() || undefined,
        purchaseDate: purchaseDate || undefined,
        price: price ? parseFloat(price) : undefined,
        notes: notes.trim() || undefined,
      });

      showToast('Item added successfully', 'success');
      onClose();
    } catch (error) {
      showToast('Failed to add item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
          <ImageUploader onImageSelect={setImage} />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Blue Cotton T-Shirt"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    color === c.value ? 'border-indigo-500 scale-110' : 'border-gray-200'
                  }`}
                  style={{
                    background: c.hex.startsWith('linear') ? c.hex : c.hex,
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seasons *</label>
            <div className="flex flex-wrap gap-2">
              {SEASONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => toggleSeason(s.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    seasons.includes(s.value)
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Optional"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Care instructions, outfit ideas, or any other notes..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
}
