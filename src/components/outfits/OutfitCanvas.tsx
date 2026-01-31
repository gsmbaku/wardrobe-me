import { useState, useRef, type MouseEvent, type TouchEvent } from 'react';
import { useThumbnailURL } from '../../hooks/useImageDB';
import { useWardrobe } from '../../hooks/useWardrobe';
import type { OutfitItemPosition, WardrobeItem } from '../../types';

interface OutfitCanvasProps {
  items: OutfitItemPosition[];
  onUpdateItem: (itemId: string, position: OutfitItemPosition['position']) => void;
  onRemoveItem: (itemId: string) => void;
}

function CanvasItem({
  itemPosition,
  wardrobeItem,
  onUpdate,
  onRemove,
  isSelected,
  onSelect,
}: {
  itemPosition: OutfitItemPosition;
  wardrobeItem: WardrobeItem | undefined;
  onUpdate: (position: OutfitItemPosition['position']) => void;
  onRemove: () => void;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const thumbnailUrl = useThumbnailURL(wardrobeItem?.imageId);
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startItemPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onSelect();
    startPos.current = { x: e.clientX, y: e.clientY };
    startItemPos.current = { x: itemPosition.position.x, y: itemPosition.position.y };
  };

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    onSelect();
    startPos.current = { x: touch.clientX, y: touch.clientY };
    startItemPos.current = { x: itemPosition.position.x, y: itemPosition.position.y };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const parent = (e.target as HTMLElement).closest('.canvas-container');
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const deltaX = ((e.clientX - startPos.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - startPos.current.y) / rect.height) * 100;

    const newX = Math.max(0, Math.min(100, startItemPos.current.x + deltaX));
    const newY = Math.max(0, Math.min(100, startItemPos.current.y + deltaY));

    onUpdate({ ...itemPosition.position, x: newX, y: newY });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const parent = (e.target as HTMLElement).closest('.canvas-container');
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const deltaX = ((touch.clientX - startPos.current.x) / rect.width) * 100;
    const deltaY = ((touch.clientY - startPos.current.y) / rect.height) * 100;

    const newX = Math.max(0, Math.min(100, startItemPos.current.x + deltaX));
    const newY = Math.max(0, Math.min(100, startItemPos.current.y + deltaY));

    onUpdate({ ...itemPosition.position, x: newX, y: newY });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const handleScale = (delta: number) => {
    const newScale = Math.max(0.5, Math.min(2, itemPosition.position.scale + delta));
    onUpdate({ ...itemPosition.position, scale: newScale });
  };

  const handleZIndex = (delta: number) => {
    const newZIndex = Math.max(1, itemPosition.position.zIndex + delta);
    onUpdate({ ...itemPosition.position, zIndex: newZIndex });
  };

  const size = 80 * itemPosition.position.scale;

  return (
    <div
      className={`absolute cursor-move touch-none ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
      style={{
        left: `${itemPosition.position.x}%`,
        top: `${itemPosition.position.y}%`,
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
        zIndex: itemPosition.position.zIndex,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
    >
      <div className="w-full h-full rounded-lg overflow-hidden bg-white shadow-lg">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}
      </div>

      {isSelected && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex gap-1 bg-white rounded-lg shadow-lg p-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleScale(-0.1); }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Smaller"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleScale(0.1); }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Larger"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleZIndex(-1); }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Send Back"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleZIndex(1); }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Bring Forward"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 hover:bg-red-100 rounded text-red-500"
            title="Remove"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default function OutfitCanvas({ items, onUpdateItem, onRemoveItem }: OutfitCanvasProps) {
  const { getItem } = useWardrobe();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div
      className="canvas-container relative w-full aspect-[3/4] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden"
      onClick={() => setSelectedId(null)}
    >
      {items.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <p className="text-sm">Select items from the picker to add them here</p>
          </div>
        </div>
      )}

      {items.map((itemPos) => (
        <CanvasItem
          key={itemPos.itemId}
          itemPosition={itemPos}
          wardrobeItem={getItem(itemPos.itemId)}
          onUpdate={(position) => onUpdateItem(itemPos.itemId, position)}
          onRemove={() => onRemoveItem(itemPos.itemId)}
          isSelected={selectedId === itemPos.itemId}
          onSelect={() => setSelectedId(itemPos.itemId)}
        />
      ))}
    </div>
  );
}
