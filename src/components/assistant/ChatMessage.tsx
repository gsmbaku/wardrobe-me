import type { ChatMessage as ChatMessageType } from '../../types';
import { useThumbnailURL } from '../../hooks/useImageDB';
import { useWardrobe } from '../../hooks/useWardrobe';

interface ChatMessageProps {
  message: ChatMessageType;
}

function ReferencedItem({ itemId }: { itemId: string }) {
  const { getItem } = useWardrobe();
  const item = getItem(itemId);
  const thumbnailUrl = useThumbnailURL(item?.imageId || '');

  if (!item) return null;

  return (
    <div className="inline-flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1 text-xs">
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt={item.name}
          className="w-5 h-5 rounded object-cover"
        />
      )}
      <span className="text-gray-700">{item.name}</span>
    </div>
  );
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {message.referencedItemIds && message.referencedItemIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {message.referencedItemIds.map(itemId => (
              <ReferencedItem key={itemId} itemId={itemId} />
            ))}
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isUser ? 'text-indigo-200' : 'text-gray-400'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}
