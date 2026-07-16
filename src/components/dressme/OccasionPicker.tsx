import { OCCASIONS } from '../../utils/constants';
import type { Occasion } from '../../types';

interface OccasionPickerProps {
  value: Occasion;
  onChange: (occasion: Occasion) => void;
  prefillSource?: string;
}

export default function OccasionPicker({ value, onChange, prefillSource }: OccasionPickerProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-700">Occasion</h2>
        {prefillSource && (
          <span className="text-xs text-indigo-600">From: {prefillSource}</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {OCCASIONS.map((occ) => (
          <button
            key={occ.value}
            type="button"
            onClick={() => onChange(occ.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              value === occ.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {occ.label}
          </button>
        ))}
      </div>
    </div>
  );
}
