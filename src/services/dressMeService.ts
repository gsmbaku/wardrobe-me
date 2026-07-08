import { v4 as uuid } from 'uuid';
import type {
  WardrobeItem,
  WearLogEntry,
  PlannedEvent,
  DressMeRequest,
  DressMeResponse,
  DressMeSuggestion,
  Occasion,
  WeatherInfo,
} from '../types';
import { OCCASION_TAG_HINTS } from '../utils/constants';
import { weatherToSeasonHints } from './weatherService';
import { sendChatMessage } from './aiService';

const MIN_WARDROBE_SIZE = 4;
const MIN_OUTFIT_ITEMS = 2;
const RECENT_WEAR_DAYS = 3;

interface ParsedSuggestion {
  name: string;
  itemIds: string[];
  rationale: string;
  highlights?: string[];
}

interface ParsedResponse {
  suggestions: ParsedSuggestion[];
}

function filterBySeason(items: WardrobeItem[], weather: WeatherInfo): WardrobeItem[] {
  const seasonHints = weatherToSeasonHints(weather);
  return items.filter((item) =>
    item.seasons.some((s) => seasonHints.includes(s))
  );
}

function filterByOccasion(items: WardrobeItem[], occasion: Occasion): WardrobeItem[] {
  const tagHints = OCCASION_TAG_HINTS[occasion];
  if (tagHints.length === 0) return items;

  return items.filter((item) => {
    if (!item.tags || item.tags.length === 0) return true;
    return item.tags.some((tag) => tagHints.includes(tag));
  });
}

function filterCandidates(
  items: WardrobeItem[],
  weather: WeatherInfo,
  occasion: Occasion
): WardrobeItem[] {
  const seasonFiltered = filterBySeason(items, weather);
  const occasionFiltered = filterByOccasion(seasonFiltered, occasion);

  if (occasionFiltered.length >= 6) return occasionFiltered;
  if (seasonFiltered.length >= 6) return seasonFiltered;
  return items;
}

function buildWearContext(items: WardrobeItem[], wearLogs: WearLogEntry[]): string {
  const today = new Date();
  const lastWornMap = new Map<string, string>();
  const wearCounts = new Map<string, number>();

  wearLogs.forEach((log) => {
    log.itemIds.forEach((itemId) => {
      const existing = lastWornMap.get(itemId);
      if (!existing || log.date > existing) {
        lastWornMap.set(itemId, log.date);
      }
      wearCounts.set(itemId, (wearCounts.get(itemId) || 0) + 1);
    });
  });

  const recentlyWorn: string[] = [];
  const leastWorn: string[] = [];

  items.forEach((item) => {
    const lastWorn = lastWornMap.get(item.id);
    if (lastWorn) {
      const daysSince = Math.floor(
        (today.getTime() - new Date(lastWorn).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince <= RECENT_WEAR_DAYS) {
        recentlyWorn.push(`${item.name} (worn ${daysSince}d ago)`);
      }
    }

    const count = wearCounts.get(item.id) || 0;
    if (count <= 1) {
      leastWorn.push(`${item.name} (worn ${count}x)`);
    }
  });

  const lines: string[] = [];
  if (recentlyWorn.length > 0) {
    lines.push(`Avoid unless necessary (worn in last ${RECENT_WEAR_DAYS} days): ${recentlyWorn.slice(0, 8).join(', ')}`);
  }
  if (leastWorn.length > 0) {
    lines.push(`Prefer including least-worn items: ${leastWorn.slice(0, 5).join(', ')}`);
  }

  return lines.length > 0 ? lines.join('\n') : 'No strong wear rotation constraints.';
}

function buildDressMePrompt(
  request: DressMeRequest,
  candidates: WardrobeItem[],
  wearContext: string,
  events: PlannedEvent[]
): string {
  const candidateList = candidates
    .map((item) =>
      `${item.id} | ${item.name} | ${item.category} | ${item.color} | tags: ${item.tags?.join(', ') || 'none'} | seasons: ${item.seasons.join(', ')} | fit: ${item.fit || 'unknown'}`
    )
    .join('\n');

  const eventContext = events.length > 0
    ? events.map((e) => `- ${e.name} (${e.occasion})`).join('\n')
    : 'No events scheduled today.';

  const rainNote = request.weather.isRaining
    ? '\nIt is raining — include appropriate outerwear or layers where possible.'
    : '';
  const coldNote = request.weather.apparentTemperature < 12
    ? '\nIt is cold — include warm layers or outerwear where appropriate.'
    : '';

  return `You are a personal stylist. Generate EXACTLY 3 complete outfits using ONLY the item IDs from the candidate list below.

Weather: ${request.weather.temperature}°C (feels like ${request.weather.apparentTemperature}°C), ${request.weather.condition}, raining: ${request.weather.isRaining}
Occasion: ${request.occasion}
Date: ${request.date}
${rainNote}${coldNote}

Today's events:
${eventContext}

Wear rotation guidance:
${wearContext}

Rules:
- Each outfit must be wearable head-to-toe (top+bottom+shoes OR dress+shoes; add outerwear if cold or raining)
- Use ONLY item IDs from the candidate list below
- Do not repeat the same core pieces across all 3 outfits
- Prefer items not worn in the last 3 days
- Include at least one outfit featuring a least-worn item
- Match formality to the occasion

Candidate items (id | name | category | color | tags | seasons | fit):
${candidateList}

Respond with ONLY valid JSON, no markdown fences:
{
  "suggestions": [
    { "name": "Outfit name", "itemIds": ["uuid1", "uuid2"], "rationale": "Why this works", "highlights": ["Optional bullet"] }
  ]
}`;
}

function extractJson(content: string): string {
  const trimmed = content.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end !== -1) return trimmed.slice(start, end + 1);

  return trimmed;
}

function validateAndSanitize(
  parsed: ParsedResponse,
  validItemIds: Set<string>
): DressMeSuggestion[] {
  const suggestions: DressMeSuggestion[] = [];

  for (const raw of parsed.suggestions) {
    const itemIds = raw.itemIds.filter((id) => validItemIds.has(id));
    if (itemIds.length < MIN_OUTFIT_ITEMS) continue;

    suggestions.push({
      id: uuid(),
      name: raw.name || 'Suggested Outfit',
      itemIds,
      rationale: raw.rationale || '',
      highlights: raw.highlights,
    });
  }

  return suggestions;
}

async function callAndParse(
  systemPrompt: string,
  userMessage: string,
  validItemIds: Set<string>
): Promise<DressMeSuggestion[]> {
  const content = await sendChatMessage(
    [{ role: 'user', content: userMessage }],
    systemPrompt,
    { temperature: 0.8 }
  );

  const parsed = JSON.parse(extractJson(content)) as ParsedResponse;
  if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
    throw new Error('Invalid response structure');
  }

  return validateAndSanitize(parsed, validItemIds);
}

export async function generateDressMeSuggestions(
  request: DressMeRequest,
  items: WardrobeItem[],
  wearLogs: WearLogEntry[],
  events: PlannedEvent[]
): Promise<DressMeResponse> {
  if (items.length < MIN_WARDROBE_SIZE) {
    throw new Error(`Add at least ${MIN_WARDROBE_SIZE} items to your wardrobe before using Dress Me.`);
  }

  const candidates = filterCandidates(items, request.weather, request.occasion);
  const validItemIds = new Set(candidates.map((i) => i.id));
  const wearContext = buildWearContext(items, wearLogs);
  const systemPrompt = buildDressMePrompt(request, candidates, wearContext, events);

  let suggestions: DressMeSuggestion[];

  try {
    suggestions = await callAndParse(
      systemPrompt,
      'Generate exactly 3 outfits for today.',
      validItemIds
    );
  } catch {
    suggestions = await callAndParse(
      systemPrompt,
      'Your previous response was invalid JSON. Respond with ONLY the JSON object, no markdown.',
      validItemIds
    );
  }

  if (suggestions.length === 0) {
    throw new Error('Could not generate valid outfit suggestions. Please try again.');
  }

  return {
    suggestions: suggestions.slice(0, 3),
    generatedAt: new Date().toISOString(),
  };
}
