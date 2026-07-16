import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Occasion, DressMeSuggestion, WeatherInfo } from '../types';
import { useWardrobe } from '../hooks/useWardrobe';
import { useWearLog } from '../hooks/useWearLog';
import { useOutfits } from '../hooks/useOutfits';
import { useEvents } from '../hooks/useEvents';
import { isAIConfigured } from '../services/aiService';
import { generateDressMeSuggestions } from '../services/dressMeService';
import {
  loadWeather,
  getManualWeather,
  type WeatherPreset,
} from '../services/weatherService';
import { buildDefaultPositions } from '../utils/outfitLayout';
import { Button } from '../components/common';
import { useToast } from '../components/common/Toast';
import { WeatherWidget, OccasionPicker, OutfitSuggestionCard } from '../components/dressme';

const SESSION_KEY = 'dressme_last_suggestions';
const SESSION_OCCASION_KEY = 'dressme_last_occasion';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function DressMePage() {
  const { items } = useWardrobe();
  const { wearLogs, addWearLog } = useWearLog();
  const { addOutfit } = useOutfits();
  const { getEventsForDate } = useEvents();
  const { showToast } = useToast();

  const today = getToday();
  const todayEvents = getEventsForDate(today);

  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<WeatherPreset | null>(null);
  const [occasion, setOccasion] = useState<Occasion>(
    () => todayEvents[0]?.occasion ?? 'casual'
  );
  const [suggestions, setSuggestions] = useState<DressMeSuggestion[] | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? (JSON.parse(stored) as DressMeSuggestion[]) : null;
    } catch {
      return null;
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const prefillSource = todayEvents[0]?.name;

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      setWeatherLoading(true);
      try {
        const result = await loadWeather();
        if (!cancelled && result) {
          setWeather(result);
        }
      } catch {
        // Fall back to manual presets in UI
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    }

    fetchWeather();
    return () => { cancelled = true; };
  }, []);

  const effectiveWeather = weather ?? (selectedPreset ? getManualWeather(selectedPreset) : null);

  const handleSelectPreset = useCallback((preset: WeatherPreset) => {
    setSelectedPreset(preset);
    setWeather(getManualWeather(preset));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!effectiveWeather) {
      showToast('Please select a weather condition', 'error');
      return;
    }

    setIsGenerating(true);
    setSelectedId(null);

    try {
      const response = await generateDressMeSuggestions(
        { occasion, weather: effectiveWeather, date: today },
        items,
        wearLogs,
        todayEvents
      );
      setSuggestions(response.suggestions);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(response.suggestions));
      sessionStorage.setItem(SESSION_OCCASION_KEY, occasion);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate outfits';
      showToast(message, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [effectiveWeather, occasion, today, items, wearLogs, todayEvents, showToast]);

  const handleWearToday = useCallback((suggestion: DressMeSuggestion) => {
    addWearLog({
      date: today,
      itemIds: suggestion.itemIds,
      notes: `Dress Me: ${suggestion.name}`,
    });
    setSelectedId(suggestion.id);
    showToast(`Logged "${suggestion.name}" for today`, 'success');
  }, [addWearLog, today, showToast]);

  const handleSaveOutfit = useCallback((suggestion: DressMeSuggestion) => {
    setSavingId(suggestion.id);
    try {
      addOutfit({
        name: suggestion.name,
        description: suggestion.rationale,
        items: buildDefaultPositions(suggestion.itemIds),
      });
      showToast(`Saved "${suggestion.name}" to outfits`, 'success');
    } finally {
      setSavingId(null);
    }
  }, [addOutfit, showToast]);

  if (!isAIConfigured()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">API Key Required</h2>
        <p className="text-gray-500 text-center max-w-md mb-4">
          Dress Me needs an AI provider configured before it can suggest outfits.
        </p>
        <Link
          to="/settings"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Configure AI Settings
        </Link>
      </div>
    );
  }

  const canGenerate = items.length >= 4 && !!effectiveWeather && !isGenerating;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dress Me</h1>
        <p className="text-sm text-gray-500 mt-1">{formatDate(today)}</p>
      </div>

      <WeatherWidget
        weather={weather}
        isLoading={weatherLoading}
        onSelectPreset={handleSelectPreset}
        selectedPreset={selectedPreset}
      />

      <OccasionPicker
        value={occasion}
        onChange={setOccasion}
        prefillSource={prefillSource}
      />

      {items.length < 4 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            Add at least 4 items to your wardrobe before using Dress Me.{' '}
            <Link to="/" className="font-medium underline">Go to Wardrobe</Link>
          </p>
        </div>
      ) : !effectiveWeather && !weatherLoading ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Select a weather condition above to generate outfit suggestions.
          </p>
        </div>
      ) : null}

      <div className="flex gap-3">
        <Button onClick={handleGenerate} disabled={!canGenerate}>
          {isGenerating ? 'Generating...' : 'Suggest 3 Outfits'}
        </Button>
        {suggestions && suggestions.length > 0 && (
          <Button variant="outline" onClick={handleGenerate} disabled={!canGenerate}>
            Regenerate All
          </Button>
        )}
      </div>

      {isGenerating && (
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isGenerating && suggestions && suggestions.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          {suggestions.map((suggestion) => (
            <OutfitSuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              isSelected={selectedId === suggestion.id}
              onWearToday={() => handleWearToday(suggestion)}
              onSaveOutfit={() => handleSaveOutfit(suggestion)}
              isSaving={savingId === suggestion.id}
            />
          ))}
        </div>
      )}

      {suggestions && suggestions.length > 0 && suggestions.length < 3 && (
        <p className="text-sm text-gray-500">
          Only {suggestions.length} valid outfit{suggestions.length === 1 ? '' : 's'} could be generated. Try regenerating.
        </p>
      )}
    </div>
  );
}
