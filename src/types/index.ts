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

export interface StorageData {
  version: number;
  items: WardrobeItem[];
  outfits: Outfit[];
  wearLogs: WearLogEntry[];
  notes: Note[];
}
