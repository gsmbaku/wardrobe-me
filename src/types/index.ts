export type Category = 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories' | 'bags';

export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'all-season';

export interface WardrobeItem {
  id: string;
  name: string;
  category: Category;
  color: string;
  seasons: Season[];
  imageId: string;
  brand?: string;
  purchaseDate?: string;
  price?: number;
  notes?: string;
  storageSpaceId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutfitItemPosition {
  itemId: string;
  position: {
    x: number;
    y: number;
    scale: number;
    zIndex: number;
  };
}

export interface Outfit {
  id: string;
  name: string;
  description?: string;
  items: OutfitItemPosition[];
  createdAt: string;
  updatedAt: string;
}

export interface WearLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  outfitId?: string;
  itemIds: string[];
  notes?: string;
  createdAt: string;
}

export interface ImageRecord {
  id: string;
  data: Blob;
  thumbnail: Blob;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type StorageSpaceType = 'hanging' | 'shelf' | 'drawer' | 'bin' | 'rack' | 'other';

export interface StorageSpace {
  id: string;
  name: string;
  type: StorageSpaceType;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorageData {
  version: number;
  items: WardrobeItem[];
  outfits: Outfit[];
  wearLogs: WearLogEntry[];
  notes: Note[];
  storageSpaces: StorageSpace[];
}

// Chat types
export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  referencedItemIds?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface OpenAIMessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

export interface OpenAIMessage {
  role: ChatRole;
  content: string | OpenAIMessageContent[];
}

export interface OpenAIChatRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenAIChatResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
