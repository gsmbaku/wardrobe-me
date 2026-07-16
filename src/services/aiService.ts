import type {
  WardrobeItem,
  Outfit,
  WearLogEntry,
  OpenAIMessage,
  OpenAIChatRequest,
  OpenAIChatResponse,
  OpenAIMessageContent,
  AIConfig,
} from '../types';
import { DEFAULT_AI_CONFIG, DEFAULT_SYSTEM_PROMPT, STORAGE_KEYS } from '../utils/constants';
import { getImage } from './storage/indexedDB';

const ENV_AI_CONFIG: AIConfig = {
  baseUrl: import.meta.env.VITE_AI_BASE_URL || DEFAULT_AI_CONFIG.baseUrl,
  apiKey: import.meta.env.VITE_AI_API_KEY || DEFAULT_AI_CONFIG.apiKey,
  model: import.meta.env.VITE_AI_MODEL || DEFAULT_AI_CONFIG.model,
};

export function getAIConfig(): AIConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
    if (!stored) return ENV_AI_CONFIG;

    const parsed = JSON.parse(stored) as Partial<AIConfig>;
    return {
      baseUrl: parsed.baseUrl?.trim() || ENV_AI_CONFIG.baseUrl,
      apiKey: parsed.apiKey?.trim() || ENV_AI_CONFIG.apiKey,
      model: parsed.model?.trim() || ENV_AI_CONFIG.model,
    };
  } catch {
    return ENV_AI_CONFIG;
  }
}

export function saveAIConfig(config: AIConfig): void {
  localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify({
    baseUrl: config.baseUrl.trim(),
    apiKey: config.apiKey.trim(),
    model: config.model.trim(),
  }));
  window.dispatchEvent(new Event('wardrobe-ai-config-change'));
}

export function clearAIConfig(): void {
  localStorage.removeItem(STORAGE_KEYS.AI_CONFIG);
  window.dispatchEvent(new Event('wardrobe-ai-config-change'));
}

export function isAIConfigured(): boolean {
  return Boolean(getAIConfig().apiKey);
}

export function buildSystemPrompt(
  items: WardrobeItem[],
  outfits: Outfit[],
  wearLogs: WearLogEntry[]
): string {
  const itemsSummary = items.map(item =>
    `- ${item.name} (${item.category}, ${item.color}, seasons: ${item.seasons.join(', ')}${item.brand ? `, brand: ${item.brand}` : ''})`
  ).join('\n');

  const outfitsSummary = outfits.map(outfit => {
    const outfitItems = outfit.items.map(oi => {
      const item = items.find(i => i.id === oi.itemId);
      return item ? item.name : 'Unknown item';
    }).join(', ');
    return `- ${outfit.name}: ${outfitItems}`;
  }).join('\n');

  const recentWears = wearLogs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .map(log => {
      const wornItems = log.itemIds.map(id => {
        const item = items.find(i => i.id === id);
        return item ? item.name : 'Unknown';
      }).join(', ');
      return `- ${log.date}: ${wornItems}`;
    }).join('\n');

  const itemWearCounts = new Map<string, number>();
  wearLogs.forEach(log => {
    log.itemIds.forEach(id => {
      itemWearCounts.set(id, (itemWearCounts.get(id) || 0) + 1);
    });
  });

  const leastWorn = items
    .map(item => ({ item, count: itemWearCounts.get(item.id) || 0 }))
    .sort((a, b) => a.count - b.count)
    .slice(0, 5)
    .map(({ item, count }) => `- ${item.name}: worn ${count} times`)
    .join('\n');

  return `${DEFAULT_SYSTEM_PROMPT}

## User's Wardrobe (${items.length} items)
${itemsSummary || 'No items yet'}

## Saved Outfits (${outfits.length})
${outfitsSummary || 'No outfits saved yet'}

## Recent Wear History
${recentWears || 'No wear history yet'}

## Least Worn Items
${leastWorn || 'No data yet'}

Current date: ${new Date().toLocaleDateString()}`;
}

export async function createMessageWithImages(
  content: string,
  itemIds: string[],
  items: WardrobeItem[]
): Promise<OpenAIMessage> {
  if (itemIds.length === 0) {
    return { role: 'user', content };
  }

  const contentParts: OpenAIMessageContent[] = [{ type: 'text', text: content }];

  for (const itemId of itemIds) {
    const item = items.find(i => i.id === itemId);
    if (!item) continue;

    const imageRecord = await getImage(item.imageId);
    if (!imageRecord) continue;

    const base64 = await blobToBase64(imageRecord.data);
    contentParts.push({
      type: 'image_url',
      image_url: { url: base64 }
    });
  }

  return { role: 'user', content: contentParts };
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function sendChatMessage(
  messages: OpenAIMessage[],
  systemPrompt: string,
  options?: { temperature?: number }
): Promise<string> {
  const config = getAIConfig();

  if (!config.apiKey) {
    throw new Error('AI API key not configured');
  }

  const requestBody: OpenAIChatRequest = {
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    temperature: options?.temperature ?? 0.7,
    max_tokens: 2048
  };

  const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error: ${response.status} - ${errorText}`);
  }

  const data: OpenAIChatResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from AI');
  }

  return data.choices[0].message.content;
}
