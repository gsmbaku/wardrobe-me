import type { Category, Season } from '../../types';
import { CATEGORIES, SEASONS, COLORS } from '../../utils/constants';

interface FilterBarProps {
  selectedCategory: Category | 'all';
  selectedColor: string | 'all';
  selectedSeason: Season | 'all';
  onCategoryChange: (category: Category | 'all') => void;
  onColorChange: (color: string | 'all') => void;
  onSeasonChange: (season: Season | 'all') => void;
}

export default function FilterBar({
  selectedCategory,
  selectedColor,
  selectedSeason,
  onCategoryChange,
  onColorChange,
  onSeasonChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value as Category | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Color</label>
        <select
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Colors</option>
          {COLORS.map((color) => (
            <option key={color.value} value={color.value}>
              {color.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Season</label>
        <select
          value={selectedSeason}
          onChange={(e) => onSeasonChange(e.target.value as Season | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Seasons</option>
          {SEASONS.map((season) => (
            <option key={season.value} value={season.value}>
              {season.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
