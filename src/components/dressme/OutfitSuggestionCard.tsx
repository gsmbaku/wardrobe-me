import { useThumbnailURL } from '../../hooks/useImageDB';
import { useWardrobe } from '../../hooks/useWardrobe';
import { Button, Card } from '../common';
import type { DressMeSuggestion } from '../../types';

interface OutfitSuggestionCardProps {
  suggestion: DressMeSuggestion;
  isSelected: boolean;
  onWearToday: () => void;
  onSaveOutfit: () => void;
  isSaving?: boolean;
}

function ItemThumbnail({ imageId }: { imageId: string | undefined }) {
  const url = useThumbnailURL(imageId);
  if (!url) return <div className="w-full h-full bg-gray-200" />;
  return <img src={url} alt="" className="w-full h-full object-cover" />;
}

export default function OutfitSuggestionCard({
  suggestion,
  isSelected,
  onWearToday,
  onSaveOutfit,
  isSaving,
}: OutfitSuggestionCardProps) {
  const { getItem } = useWardrobe();
  const previewItems = suggestion.itemIds.slice(0, 4);
  const remainingCount = suggestion.itemIds.length - 4;

  return (
    <Card
      padding="none"
      className={`overflow-hidden ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
    >
      <div className="aspect-square bg-gray-100 relative">
        <div className="grid grid-cols-2 gap-0.5 p-0.5 h-full">
          {previewItems.map((itemId) => {
            const item = getItem(itemId);
            return (
              <div key={itemId} className="relative overflow-hidden">
                <ItemThumbnail imageId={item?.imageId} />
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
        {isSelected && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded-full">
            Wearing today
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900">{suggestion.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{suggestion.rationale}</p>
        </div>

        {suggestion.highlights && suggestion.highlights.length > 0 && (
          <ul className="text-xs text-gray-500 space-y-1">
            {suggestion.highlights.map((highlight, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-indigo-400">•</span>
                {highlight}
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={onWearToday}
            disabled={isSelected}
            className="flex-1"
          >
            {isSelected ? 'Logged' : 'Wear Today'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onSaveOutfit}
            disabled={isSaving}
            className="flex-1"
          >
            Save Outfit
          </Button>
        </div>
      </div>
    </Card>
  );
}
