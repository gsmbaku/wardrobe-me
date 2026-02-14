import { useState, useEffect } from 'react';
import { useWardrobe } from '../../hooks/useWardrobe';
import { useImageURL } from '../../hooks/useImageDB';
import { useToast } from '../common/Toast';
import { Button } from '../common';
import ImageUploader from './ImageUploader';
import { CATEGORIES, SEASONS, COLORS, SIZES, ITEM_TAGS, FITS } from '../../utils/constants';
import type { Category, Season, WardrobeItem, Fit } from '../../types';

interface ItemFormProps {
  onClose: () => void;
  editItem?: WardrobeItem;
}

export default function ItemForm({ onClose, editItem }: ItemFormProps) {
  const { addItem, updateItem } = useWardrobe();
  const { showToast } = useToast();
  const existingImageUrl = useImageURL(editItem?.imageId);

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

  // New fields
  const [size, setSize] = useState('');
  const [customSize, setCustomSize] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [fit, setFit] = useState<Fit | ''>('');
  const [forSale, setForSale] = useState(false);
  const [saleLink, setSaleLink] = useState('');

  const isEditing = !!editItem;

  // Pre-populate form when editing
  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setCategory(editItem.category);
      setColor(editItem.color);
      setSeasons(editItem.seasons);
      setBrand(editItem.brand || '');
      setPurchaseDate(editItem.purchaseDate || '');
      setPrice(editItem.price?.toString() || '');
      setNotes(editItem.notes || '');
      setTags(editItem.tags || []);
      setFit(editItem.fit || '');
      setForSale(editItem.forSale || false);
      setSaleLink(editItem.saleLink || '');

      // Handle size - check if it's a preset or custom
      if (editItem.size) {
        if (SIZES.includes(editItem.size as typeof SIZES[number])) {
          setSize(editItem.size);
        } else {
          setSize('custom');
          setCustomSize(editItem.size);
        }
      }
    }
  }, [editItem]);

  const toggleSeason = (season: Season) => {
    setSeasons((prev) =>
      prev.includes(season)
        ? prev.filter((s) => s !== season)
        : [...prev, season]
    );
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setCustomTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const getFinalSize = () => {
    if (size === 'custom') return customSize.trim() || undefined;
    return size || undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter a name', 'error');
      return;
    }

    if (!isEditing && !image) {
      showToast('Please select an image', 'error');
      return;
    }

    if (seasons.length === 0) {
      showToast('Please select at least one season', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        updateItem(editItem.id, {
          name: name.trim(),
          category,
          color,
          seasons,
          brand: brand.trim() || undefined,
          purchaseDate: purchaseDate || undefined,
          price: price ? parseFloat(price) : undefined,
          notes: notes.trim() || undefined,
          size: getFinalSize(),
          tags: tags.length > 0 ? tags : undefined,
          fit: fit || undefined,
          forSale: forSale || undefined,
          saleLink: forSale && saleLink.trim() ? saleLink.trim() : undefined,
        });
        showToast('Item updated successfully', 'success');
      } else {
        await addItem({
          name: name.trim(),
          category,
          color,
          seasons,
          image: image!,
          brand: brand.trim() || undefined,
          purchaseDate: purchaseDate || undefined,
          price: price ? parseFloat(price) : undefined,
          notes: notes.trim() || undefined,
          size: getFinalSize(),
          tags: tags.length > 0 ? tags : undefined,
          fit: fit || undefined,
          forSale: forSale || undefined,
          saleLink: forSale && saleLink.trim() ? saleLink.trim() : undefined,
        });
        showToast('Item added successfully', 'success');
      }
      onClose();
    } catch (error) {
      showToast(isEditing ? 'Failed to update item' : 'Failed to add item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo {!isEditing && '*'}
          </label>
          <ImageUploader onImageSelect={setImage} previewUrl={existingImageUrl || undefined} />
          {isEditing && !image && (
            <p className="mt-1 text-xs text-gray-500">Leave empty to keep current image</p>
          )}
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

      {/* Size Field */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">No size</option>
            {SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            <option value="custom">Custom</option>
          </select>
          {size === 'custom' && (
            <input
              type="text"
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              placeholder="e.g., 32, 10.5, etc."
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>

        {/* Fit Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fit</label>
          <select
            value={fit}
            onChange={(e) => setFit(e.target.value as Fit | '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">No fit specified</option>
            {FITS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {ITEM_TAGS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => toggleTag(t.value)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                tags.includes(t.value)
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
            placeholder="Add custom tag..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button type="button" variant="outline" onClick={addCustomTag}>Add</Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => {
              const presetTag = ITEM_TAGS.find((t) => t.value === tag);
              return (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full"
                >
                  {presetTag?.label || tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-indigo-900"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* For Sale Field */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={forSale}
              onChange={(e) => setForSale(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-10 h-6 rounded-full transition-colors ${forSale ? 'bg-indigo-600' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${forSale ? 'translate-x-4' : ''}`} />
            </div>
          </div>
          <span className="text-sm font-medium text-gray-700">Item is for sale</span>
        </label>
        {forSale && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sale Link</label>
            <input
              type="url"
              value={saleLink}
              onChange={(e) => setSaleLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}
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
          {isSubmitting ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Item')}
        </Button>
      </div>
    </form>
  );
}
