import type { Category, Season } from '../types';

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'bags', label: 'Bags' },
];

export const SEASONS: { value: Season; label: string }[] = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' },
  { value: 'all-season', label: 'All Season' },
];

export const COLORS = [
  { value: 'black', label: 'Black', hex: '#000000' },
  { value: 'white', label: 'White', hex: '#FFFFFF' },
  { value: 'gray', label: 'Gray', hex: '#6B7280' },
  { value: 'red', label: 'Red', hex: '#EF4444' },
  { value: 'orange', label: 'Orange', hex: '#F97316' },
  { value: 'yellow', label: 'Yellow', hex: '#EAB308' },
  { value: 'green', label: 'Green', hex: '#22C55E' },
  { value: 'blue', label: 'Blue', hex: '#3B82F6' },
  { value: 'purple', label: 'Purple', hex: '#A855F7' },
  { value: 'pink', label: 'Pink', hex: '#EC4899' },
  { value: 'brown', label: 'Brown', hex: '#92400E' },
  { value: 'beige', label: 'Beige', hex: '#D4B896' },
  { value: 'navy', label: 'Navy', hex: '#1E3A5F' },
  { value: 'camo', label: 'Camo', hex: 'linear-gradient(45deg, #556B2F, #8B7355, #3D4F2F, #6B5B3F)' },
  { value: 'multi', label: 'Multi', hex: 'linear-gradient(45deg, red, orange, yellow, green, blue, purple)' },
];

export const STORAGE_KEYS = {
  ITEMS: 'wardrobe_items',
  OUTFITS: 'wardrobe_outfits',
  WEAR_LOGS: 'wardrobe_wear_logs',
  VERSION: 'wardrobe_version',
} as const;

export const CURRENT_VERSION = 1;

export const IMAGE_DB_NAME = 'WardrobeImageDB';
export const IMAGE_STORE_NAME = 'images';
export const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
export const THUMBNAIL_SIZE = 200;
