import type { Outfit } from '../../types';
import OutfitCard from './OutfitCard';

interface OutfitGridProps {
  outfits: Outfit[];
  onEdit: (outfitId: string) => void;
}

export default function OutfitGrid({ outfits, onEdit }: OutfitGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {outfits.map((outfit) => (
        <OutfitCard key={outfit.id} outfit={outfit} onEdit={() => onEdit(outfit.id)} />
      ))}
    </div>
  );
}
