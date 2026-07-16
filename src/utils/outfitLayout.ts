import type { OutfitItemPosition } from '../types';

const GRID_POSITIONS = [
  { x: 25, y: 30 },
  { x: 75, y: 30 },
  { x: 25, y: 70 },
  { x: 75, y: 70 },
  { x: 50, y: 50 },
  { x: 15, y: 50 },
  { x: 85, y: 50 },
  { x: 50, y: 15 },
];

export function buildDefaultPositions(itemIds: string[]): OutfitItemPosition[] {
  return itemIds.map((itemId, index) => {
    const grid = GRID_POSITIONS[index % GRID_POSITIONS.length];
    return {
      itemId,
      position: {
        x: grid.x,
        y: grid.y,
        scale: 1,
        zIndex: index + 1,
      },
    };
  });
}
