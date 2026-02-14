import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import type { WardrobeItem } from '../../types';
import { useThumbnailURL } from '../../hooks/useImageDB';

interface ChatInputProps {
  onSend: (content: string, itemIds: string[]) => void;
  onOpenItemSelector: () => void;
  selectedItems: WardrobeItem[];
  onRemoveItem: (id: string) => void;
  disabled?: boolean;
}

function SelectedItemChip({
  item,
  onRemove
}: {
  item: WardrobeItem;
  onRemove: () => void;
}) {
  const thumbnailUrl = useThumbnailURL(item.imageId);

  return (
    <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-lg px-2 py-1">
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={item.name}
          className="w-5 h-5 rounded object-cover"
        />
      )}
      <span className="text-xs text-indigo-700">{item.name}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-indigo-400 hover:text-indigo-600 ml-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ChatInput({
  onSend,
  onOpenItemSelector,
  selectedItems,
  onRemoveItem,
  disabled
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() && selectedItems.length === 0) return;
    if (disabled) return;

    onSend(input.trim(), selectedItems.map(i => i.id));
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedItems.map(item => (
            <SelectedItemChip
              key={item.id}
              item={item}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={onOpenItemSelector}
          disabled={disabled}
          className="flex-shrink-0 p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Attach wardrobe items"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Ask about your wardrobe..."
          className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-gray-50"
          rows={1}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || (!input.trim() && selectedItems.length === 0)}
          className="flex-shrink-0 p-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
