import type { Category, Season, Fit, Occasion } from '../types';

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'shorts', label: 'Shorts' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'bags', label: 'Bags' },
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'] as const;

export const ITEM_TAGS = [
  { value: 'athletic', label: 'Athletic' },
  { value: 'casual', label: 'Casual' },
  { value: 'lounge', label: 'Lounge' },
  { value: 'formal', label: 'Formal' },
  { value: 'work', label: 'Work' },
  { value: 'date-night', label: 'Date Night' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'streetwear', label: 'Streetwear' },
] as const;

export const FITS: { value: Fit; label: string }[] = [
  { value: 'oversized', label: 'Oversized' },
  { value: 'baggy', label: 'Baggy' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'regular', label: 'Regular' },
  { value: 'slim', label: 'Slim' },
  { value: 'fitted', label: 'Fitted' },
  { value: 'tight', label: 'Tight' },
];

export const OCCASIONS: { value: Occasion; label: string }[] = [
  { value: 'casual', label: 'Casual' },
  { value: 'work', label: 'Work' },
  { value: 'formal', label: 'Formal' },
  { value: 'date', label: 'Date' },
  { value: 'party', label: 'Party' },
  { value: 'travel', label: 'Travel' },
  { value: 'workout', label: 'Workout' },
  { value: 'other', label: 'Other' },
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
  NOTES: 'wardrobe_notes',
  STORAGE_SPACES: 'wardrobe_storage_spaces',
  VERSION: 'wardrobe_version',
  CHAT_CONVERSATIONS: 'wardrobe_chat_conversations',
  EVENTS: 'wardrobe_events',
} as const;

export const STORAGE_SPACE_TYPES: { value: import('../types').StorageSpaceType; label: string; icon: string }[] = [
  { value: 'hanging', label: 'Hanging Rod', icon: '🪝' },
  { value: 'shelf', label: 'Shelf', icon: '📚' },
  { value: 'drawer', label: 'Drawer', icon: '🗄️' },
  { value: 'bin', label: 'Storage Bin', icon: '📦' },
  { value: 'rack', label: 'Rack', icon: '🧺' },
  { value: 'other', label: 'Other', icon: '📍' },
];

export const CURRENT_VERSION = 1;

export const IMAGE_DB_NAME = 'WardrobeImageDB';
export const IMAGE_STORE_NAME = 'images';
export const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
export const THUMBNAIL_SIZE = 200;

export const DEFAULT_SYSTEM_PROMPT = `You are a helpful fashion assistant for a personal wardrobe management app. You help users with:
- Outfit suggestions and styling advice
- Color coordination and fashion tips
- Seasonal wardrobe planning
- Analyzing clothing items from images
- Tracking wear frequency and suggesting underused items

Be friendly, concise, and practical. When making suggestions, reference specific items from the user's wardrobe when relevant.`;

export const SUGGESTED_PROMPTS = [
  { text: "What should I wear today?", icon: "sun" },
  { text: "Suggest an outfit for a date night", icon: "heart" },
  { text: "Which items haven't I worn recently?", icon: "clock" },
  { text: "What colors go well together in my wardrobe?", icon: "palette" },
] as const;
