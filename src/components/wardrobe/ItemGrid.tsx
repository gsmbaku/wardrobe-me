import type { WardrobeItem } from '../../types';
import ItemCard from './ItemCard';

interface ItemGridProps {
  items: WardrobeItem[];
}

export default function ItemGrid({ items }: ItemGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
