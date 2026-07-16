import type { WeatherInfo } from '../../types';
import type { WeatherPreset } from '../../services/weatherService';
import { WEATHER_PRESETS } from '../../services/weatherService';

interface WeatherWidgetProps {
  weather: WeatherInfo | null;
  isLoading: boolean;
  onSelectPreset: (preset: WeatherPreset) => void;
  selectedPreset: WeatherPreset | null;
}

function WeatherIcon({ weather }: { weather: WeatherInfo }) {
  if (weather.isRaining) {
    return (
      <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    );
  }
  if (weather.condition === 'Clear' || weather.condition === 'Warm') {
    return (
      <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  );
}

export default function WeatherWidget({
  weather,
  isLoading,
  onSelectPreset,
  selectedPreset,
}: WeatherWidgetProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-700">Today&apos;s Weather</h2>
        {weather?.locationLabel && (
          <span className="text-xs text-gray-500">{weather.locationLabel}</span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-6 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
        </div>
      ) : weather ? (
        <div className="flex items-center gap-3">
          <WeatherIcon weather={weather} />
          <div>
            <p className="text-2xl font-semibold text-gray-900">
              {Math.round(weather.temperature)}°C
            </p>
            <p className="text-sm text-gray-500">
              Feels like {Math.round(weather.apparentTemperature)}°C · {weather.condition}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-3">
          Could not load weather. Pick a condition below:
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {WEATHER_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onSelectPreset(preset.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedPreset === preset.value || (weather?.isManual && weather.condition.toLowerCase() === preset.value)
                ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
