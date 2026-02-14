import type { WardrobeItem, Outfit, WearLogEntry, OpenAIMessage, OpenAIChatRequest, OpenAIChatResponse, OpenAIMessageContent } from '../types';
import { DEFAULT_SYSTEM_PROMPT } from '../utils/constants';
import { getImage } from './storage/indexedDB';

const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || 'https://api.moonshot.cn/v1';
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY || '';
const AI_MODEL = import.meta.env.VITE_AI_MODEL || 'moonshot-v1-8k-vision-preview';

export function isAIConfigured(): boolean {
  return Boolean(AI_API_KEY);
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
  systemPrompt: string
): Promise<string> {
  if (!isAIConfigured()) {
    throw new Error('AI API key not configured');
  }

  const requestBody: OpenAIChatRequest = {
    model: AI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 2048
  };

  const response = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`
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
