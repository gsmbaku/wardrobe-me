import type { Season, WeatherInfo } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

const WEATHER_CACHE_TTL_MS = 30 * 60 * 1000;

export interface SavedLocation {
  lat: number;
  lon: number;
  label?: string;
  updatedAt: string;
}

interface WeatherCache {
  weather: WeatherInfo;
  lat: number;
  lon: number;
  cachedAt: string;
}

export type WeatherPreset = 'cold' | 'mild' | 'warm' | 'rainy';

export const WEATHER_PRESETS: { value: WeatherPreset; label: string }[] = [
  { value: 'cold', label: 'Cold' },
  { value: 'mild', label: 'Mild' },
  { value: 'warm', label: 'Warm' },
  { value: 'rainy', label: 'Rainy' },
];

function mapWeatherCode(code: number): { condition: string; isRaining: boolean } {
  if (code === 0) return { condition: 'Clear', isRaining: false };
  if (code <= 3) return { condition: 'Cloudy', isRaining: false };
  if (code <= 48) return { condition: 'Foggy', isRaining: false };
  if (code <= 57) return { condition: 'Drizzle', isRaining: true };
  if (code <= 67) return { condition: 'Rain', isRaining: true };
  if (code <= 77) return { condition: 'Snow', isRaining: false };
  if (code <= 82) return { condition: 'Rain Showers', isRaining: true };
  if (code <= 86) return { condition: 'Snow Showers', isRaining: false };
  if (code <= 99) return { condition: 'Thunderstorm', isRaining: true };
  return { condition: 'Unknown', isRaining: false };
}

export function weatherToSeasonHints(weather: WeatherInfo): Season[] {
  const temp = weather.apparentTemperature;
  const seasons: Season[] = ['all-season'];

  if (weather.isRaining || temp < 12) {
    seasons.push('fall', 'winter');
  }
  if (temp >= 10 && temp <= 24) {
    seasons.push('spring', 'fall');
  }
  if (temp > 20) {
    seasons.push('summer');
  }

  return [...new Set(seasons)];
}

export function getManualWeather(preset: WeatherPreset): WeatherInfo {
  const presets: Record<WeatherPreset, Omit<WeatherInfo, 'fetchedAt' | 'isManual'>> = {
    cold: {
      temperature: 5,
      apparentTemperature: 2,
      condition: 'Cold',
      weatherCode: 71,
      isRaining: false,
      locationLabel: 'Manual',
    },
    mild: {
      temperature: 16,
      apparentTemperature: 15,
      condition: 'Mild',
      weatherCode: 2,
      isRaining: false,
      locationLabel: 'Manual',
    },
    warm: {
      temperature: 26,
      apparentTemperature: 27,
      condition: 'Warm',
      weatherCode: 0,
      isRaining: false,
      locationLabel: 'Manual',
    },
    rainy: {
      temperature: 14,
      apparentTemperature: 12,
      condition: 'Rain',
      weatherCode: 61,
      isRaining: true,
      locationLabel: 'Manual',
    },
  };

  return {
    ...presets[preset],
    fetchedAt: new Date().toISOString(),
    isManual: true,
  };
}

export function getSavedLocation(): SavedLocation | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LOCATION);
    return data ? (JSON.parse(data) as SavedLocation) : null;
  } catch {
    return null;
  }
}

export function saveLocation(location: SavedLocation): void {
  localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(location));
}

function getCachedWeather(lat: number, lon: number): WeatherInfo | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WEATHER_CACHE);
    if (!data) return null;

    const cache = JSON.parse(data) as WeatherCache;
    const age = Date.now() - new Date(cache.cachedAt).getTime();
    if (age > WEATHER_CACHE_TTL_MS) return null;
    if (Math.abs(cache.lat - lat) > 0.01 || Math.abs(cache.lon - lon) > 0.01) return null;

    return cache.weather;
  } catch {
    return null;
  }
}

function setCachedWeather(lat: number, lon: number, weather: WeatherInfo): void {
  const cache: WeatherCache = {
    weather,
    lat,
    lon,
    cachedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.WEATHER_CACHE, JSON.stringify(cache));
}

export async function getCurrentWeather(lat: number, lon: number, label?: string): Promise<WeatherInfo> {
  const cached = getCachedWeather(lat, lon);
  if (cached) return cached;

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current', 'temperature_2m,apparent_temperature,weather_code');
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json() as {
    current: {
      temperature_2m: number;
      apparent_temperature: number;
      weather_code: number;
    };
  };

  const { condition, isRaining } = mapWeatherCode(data.current.weather_code);
  const weather: WeatherInfo = {
    temperature: data.current.temperature_2m,
    apparentTemperature: data.current.apparent_temperature,
    condition,
    weatherCode: data.current.weather_code,
    isRaining,
    fetchedAt: new Date().toISOString(),
    locationLabel: label,
    isManual: false,
  };

  setCachedWeather(lat, lon, weather);
  return weather;
}

export function requestGeolocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}

export async function loadWeather(): Promise<WeatherInfo | null> {
  try {
    const coords = await requestGeolocation();
    const location: SavedLocation = {
      lat: coords.lat,
      lon: coords.lon,
      label: 'Current location',
      updatedAt: new Date().toISOString(),
    };
    saveLocation(location);
    return await getCurrentWeather(coords.lat, coords.lon, location.label);
  } catch {
    const saved = getSavedLocation();
    if (saved) {
      try {
        return await getCurrentWeather(saved.lat, saved.lon, saved.label);
      } catch {
        return null;
      }
    }
    return null;
  }
}
