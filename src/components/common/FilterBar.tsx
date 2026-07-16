import type { Category, Fit, Season, StorageSpace } from '../../types';
import {
  CATEGORIES,
  SEASONS,
  COLORS,
  FITS,
  ITEM_TAGS,
  WEAR_FILTER_OPTIONS,
  FOR_SALE_FILTER_OPTIONS,
  CPW_FILTER_OPTIONS,
  SORT_OPTIONS,
} from '../../utils/constants';
import type {
  CpwFilter,
  ForSaleFilter,
  SortOption,
  WearFilter,
} from '../../utils/wardrobeFilters';

const selectClassName =
  'px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white';

interface FilterBarProps {
  selectedCategory: Category | 'all';
  selectedColor: string | 'all';
  selectedSeason: Season | 'all';
  selectedTag: string | 'all';
  selectedFit: Fit | 'all';
  selectedStorage: string | 'all';
  selectedForSale: ForSaleFilter;
  selectedWear: WearFilter;
  selectedCpw: CpwFilter;
  selectedSort: SortOption;
  storageSpaces: StorageSpace[];
  availableTags: string[];
  onCategoryChange: (category: Category | 'all') => void;
  onColorChange: (color: string | 'all') => void;
  onSeasonChange: (season: Season | 'all') => void;
  onTagChange: (tag: string | 'all') => void;
  onFitChange: (fit: Fit | 'all') => void;
  onStorageChange: (storage: string | 'all') => void;
  onForSaleChange: (forSale: ForSaleFilter) => void;
  onWearChange: (wear: WearFilter) => void;
  onCpwChange: (cpw: CpwFilter) => void;
  onSortChange: (sort: SortOption) => void;
  onClear: () => void;
}

function formatTagLabel(tag: string): string {
  const preset = ITEM_TAGS.find((t) => t.value === tag);
  if (preset) return preset.label;
  return tag
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function FilterBar({
  selectedCategory,
  selectedColor,
  selectedSeason,
  selectedTag,
  selectedFit,
  selectedStorage,
  selectedForSale,
  selectedWear,
  selectedCpw,
  selectedSort,
  storageSpaces,
  availableTags,
  onCategoryChange,
  onColorChange,
  onSeasonChange,
  onTagChange,
  onFitChange,
  onStorageChange,
  onForSaleChange,
  onWearChange,
  onCpwChange,
  onSortChange,
  onClear,
}: FilterBarProps) {
  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedColor !== 'all' ||
    selectedSeason !== 'all' ||
    selectedTag !== 'all' ||
    selectedFit !== 'all' ||
    selectedStorage !== 'all' ||
    selectedForSale !== 'all' ||
    selectedWear !== 'all' ||
    selectedCpw !== 'all' ||
    selectedSort !== 'newest';

  const tagOptions = (() => {
    const seen = new Set<string>();
    const options: { value: string; label: string }[] = [];
    for (const tag of ITEM_TAGS) {
      seen.add(tag.value);
      options.push({ value: tag.value, label: tag.label });
    }
    for (const tag of availableTags) {
      if (seen.has(tag)) continue;
      seen.add(tag);
      options.push({ value: tag, label: formatTagLabel(tag) });
    }
    return options;
  })();

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value as Category | 'all')}
          className={selectClassName}
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
          className={selectClassName}
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
          className={selectClassName}
        >
          <option value="all">All Seasons</option>
          {SEASONS.map((season) => (
            <option key={season.value} value={season.value}>
              {season.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tag</label>
        <select
          value={selectedTag}
          onChange={(e) => onTagChange(e.target.value)}
          className={selectClassName}
        >
          <option value="all">All Tags</option>
          {tagOptions.map((tag) => (
            <option key={tag.value} value={tag.value}>
              {tag.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fit</label>
        <select
          value={selectedFit}
          onChange={(e) => onFitChange(e.target.value as Fit | 'all')}
          className={selectClassName}
        >
          <option value="all">All Fits</option>
          {FITS.map((fit) => (
            <option key={fit.value} value={fit.value}>
              {fit.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Storage</label>
        <select
          value={selectedStorage}
          onChange={(e) => onStorageChange(e.target.value)}
          className={selectClassName}
        >
          <option value="all">All Locations</option>
          <option value="none">Unassigned</option>
          {storageSpaces.map((space) => (
            <option key={space.id} value={space.id}>
              {space.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">For Sale</label>
        <select
          value={selectedForSale}
          onChange={(e) => onForSaleChange(e.target.value as ForSaleFilter)}
          className={selectClassName}
        >
          {FOR_SALE_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Wears</label>
        <select
          value={selectedWear}
          onChange={(e) => onWearChange(e.target.value as WearFilter)}
          className={selectClassName}
        >
          {WEAR_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cost / Wear</label>
        <select
          value={selectedCpw}
          onChange={(e) => onCpwChange(e.target.value as CpwFilter)}
          className={selectClassName}
        >
          {CPW_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sort</label>
        <select
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className={selectClassName}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          Clear
        </button>
      ) : null}
    </div>
  );
}
