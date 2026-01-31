# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost only)
npm run dev:mobile   # Start dev server exposed to network (for phone testing)
npm run build        # Type-check and build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

## Architecture

This is a local-first React wardrobe management app. All data is stored in the browser - no backend.

### Storage Strategy

- **localStorage**: Item metadata, outfits, wear logs (JSON)
- **IndexedDB**: Images and thumbnails (binary blobs)

The `imageId` field in items links to IndexedDB records. Images are compressed to max 1MB with 200px thumbnails generated on upload.

### State Management

Three React Contexts manage app state, each wrapping localStorage/IndexedDB operations:

- `WardrobeContext` - clothing items CRUD
- `OutfitContext` - outfit combinations CRUD
- `WearLogContext` - wear history tracking

Contexts are provided in `App.tsx` and consumed via hooks (`useWardrobe`, `useOutfits`, `useWearLog`).

### Key Services

- `services/imageService.ts` - Image compression and thumbnail generation
- `services/exportService.ts` - JSON backup with base64-encoded images
- `services/storage/localStorage.ts` - Versioned localStorage wrapper
- `services/storage/indexedDB.ts` - IndexedDB for image blobs

### Outfit Canvas Positioning

Outfits store item positions as percentages (0-100%) for responsive display:
```typescript
position: { x: number, y: number, scale: number, zIndex: number }
```

### Type Imports

TypeScript is configured with `verbatimModuleSyntax`. Use `type` keyword for type-only imports:
```typescript
import { useState, type ReactNode } from 'react';
import type { WardrobeItem } from '../types';
```
