# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # localhost only
npm run dev:mobile   # dev server exposed to network (for phone testing)
npm run tunnel       # expose dev server via Cloudflare (run alongside dev:mobile)
npm run build        # type-check and build for production
npm run lint         # run ESLint
npm run preview      # preview production build
```

### Phone testing from cloud dev environment

`localhost` and `172.30.x.x` URLs are not reachable from your phone. Use a tunnel:

1. Terminal 1: `npm run dev:mobile` (must stay on port 5173)
2. Terminal 2: `npm run tunnel` — open the `trycloudflare.com` URL on your phone

If port 5173 is in use, stop the other Vite process first (`strictPort` prevents silent port changes).

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
