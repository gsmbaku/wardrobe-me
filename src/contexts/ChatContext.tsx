import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import type { Conversation, ChatMessage, OpenAIMessage } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { useWardrobeContext } from './WardrobeContext';
import { useOutfitContext } from './OutfitContext';
import { useWearLogContext } from './WearLogContext';
import {
  isAIConfigured,
  buildSystemPrompt,
  createMessageWithImages,
  sendChatMessage
} from '../services/aiService';

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  sendMessage: (content: string, referencedItemIds?: string[]) => Promise<void>;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

function getStoredConversations(): Conversation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CHAT_CONVERSATIONS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredConversations(conversations: Conversation[]): void {
  localStorage.setItem(STORAGE_KEYS.CHAT_CONVERSATIONS, JSON.stringify(conversations));
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { items } = useWardrobeContext();
  const { outfits } = useOutfitContext();
  const { wearLogs } = useWearLogContext();

  useEffect(() => {
    const stored = getStoredConversations();
    setConversations(stored);
    if (stored.length > 0) {
      setActiveConversationId(stored[0].id);
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      setStoredConversations(conversations);
    }
  }, [conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  const createConversation = useCallback((): string => {
    const now = new Date().toISOString();
    const newConversation: Conversation = {
      id: uuid(),
      title: 'New Chat',
      messages: [],
      createdAt: now,
      updatedAt: now
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation.id;
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      if (updated.length === 0) {
        localStorage.removeItem(STORAGE_KEYS.CHAT_CONVERSATIONS);
      }
      return updated;
    });
    if (activeConversationId === id) {
      setConversations(prev => {
        const remaining = prev.filter(c => c.id !== id);
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
        return remaining;
      });
    }
  }, [activeConversationId]);

  const setActiveConversation = useCallback((id: string | null) => {
    setActiveConversationId(id);
    setError(null);
  }, []);

  const sendMessage = useCallback(async (content: string, referencedItemIds: string[] = []) => {
    if (!activeConversationId) {
      throw new Error('No active conversation');
    }

    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: uuid(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      referencedItemIds: referencedItemIds.length > 0 ? referencedItemIds : undefined
    };

    setConversations(prev =>
      prev.map(conv =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              updatedAt: new Date().toISOString(),
              title: conv.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : conv.title
            }
          : conv
      )
    );

    try {
      const conversation = conversations.find(c => c.id === activeConversationId);
      if (!conversation) throw new Error('Conversation not found');

      const systemPrompt = buildSystemPrompt(items, outfits, wearLogs);

      const openAIMessages: OpenAIMessage[] = [];
      for (const msg of conversation.messages) {
        if (msg.role === 'user' && msg.referencedItemIds && msg.referencedItemIds.length > 0) {
          openAIMessages.push(await createMessageWithImages(msg.content, msg.referencedItemIds, items));
        } else {
          openAIMessages.push({ role: msg.role, content: msg.content });
        }
      }

      const newUserMessage = await createMessageWithImages(content, referencedItemIds, items);
      openAIMessages.push(newUserMessage);

      const response = await sendChatMessage(openAIMessages, systemPrompt);

      const assistantMessage: ChatMessage = {
        id: uuid(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversationId
            ? {
                ...conv,
                messages: [...conv.messages, assistantMessage],
                updatedAt: new Date().toISOString()
              }
            : conv
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, conversations, items, outfits, wearLogs]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        activeConversation,
        isLoading,
        error,
        isConfigured: isAIConfigured(),
        createConversation,
        deleteConversation,
        setActiveConversation,
        sendMessage,
        clearError
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within ChatProvider');
  return context;
}
