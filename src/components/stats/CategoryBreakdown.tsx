import type { Category } from '../../types';
import { CATEGORIES } from '../../utils/constants';

interface CategoryCount {
  category: Category;
  count: number;
}

interface CategoryBreakdownProps {
  breakdown: CategoryCount[];
}

const COLORS = [
  'bg-indigo-500',
  'bg-pink-500',
  'bg-purple-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-orange-500',
];

export default function CategoryBreakdown({ breakdown }: CategoryBreakdownProps) {
  if (breakdown.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No items in your wardrobe yet</p>
      </div>
    );
  }

  const total = breakdown.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="space-y-4">
      <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
        {breakdown.map(({ category, count }, idx) => {
          const percentage = (count / total) * 100;
          return (
            <div
              key={category}
              className={`${COLORS[idx % COLORS.length]} transition-all duration-500`}
              style={{ width: `${percentage}%` }}
              title={`${CATEGORIES.find((c) => c.value === category)?.label}: ${count}`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {breakdown.map(({ category, count }, idx) => {
          const label = CATEGORIES.find((c) => c.value === category)?.label;
          const percentage = ((count / total) * 100).toFixed(0);
          return (
            <div key={category} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${COLORS[idx % COLORS.length]}`} />
              <span className="text-sm text-gray-600">
                {label} ({count}) - {percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
