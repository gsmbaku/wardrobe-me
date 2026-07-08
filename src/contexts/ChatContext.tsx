import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import type { Conversation, ChatMessage, OpenAIMessage } from '../types';
import * as storage from '../services/storage/localStorage';
import { subscribeStorageChange } from '../services/storageSync';
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

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiConfigVersion, setAiConfigVersion] = useState(0);

  const { items } = useWardrobeContext();
  const { outfits } = useOutfitContext();
  const { wearLogs } = useWearLogContext();

  const persistConversations = useCallback((updated: Conversation[]) => {
    storage.setConversations(updated);
    setConversations(updated);
  }, []);

  useEffect(() => {
    const stored = storage.getConversations();
    setConversations(stored);
    if (stored.length > 0) {
      setActiveConversationId(stored[0].id);
    }
  }, []);

  useEffect(() => {
    return subscribeStorageChange((collections) => {
      if (collections.includes('conversations')) {
        const stored = storage.getConversations();
        setConversations(stored);
        setActiveConversationId((current) => {
          if (current && stored.some(c => c.id === current)) return current;
          return stored.length > 0 ? stored[0].id : null;
        });
      }
    });
  }, []);

  useEffect(() => {
    const handleConfigChange = () => {
      setAiConfigVersion((version) => version + 1);
    };
    window.addEventListener('wardrobe-ai-config-change', handleConfigChange);
    return () => window.removeEventListener('wardrobe-ai-config-change', handleConfigChange);
  }, []);

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
    const updated = [newConversation, ...storage.getConversations()];
    persistConversations(updated);
    setActiveConversationId(newConversation.id);
    return newConversation.id;
  }, [persistConversations]);

  const deleteConversation = useCallback((id: string) => {
    const updated = storage.getConversations().filter(c => c.id !== id);
    persistConversations(updated);
    if (activeConversationId === id) {
      setActiveConversationId(updated.length > 0 ? updated[0].id : null);
    }
  }, [activeConversationId, persistConversations]);

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

    const currentConversations = storage.getConversations();
    const conversation = currentConversations.find(c => c.id === activeConversationId);
    if (!conversation) {
      setIsLoading(false);
      throw new Error('Conversation not found');
    }

    const withUserMessage = currentConversations.map(conv =>
      conv.id === activeConversationId
        ? {
            ...conv,
            messages: [...conv.messages, userMessage],
            updatedAt: new Date().toISOString(),
            title: conv.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : conv.title
          }
        : conv
    );
    persistConversations(withUserMessage);

    try {
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

      const latestConversations = storage.getConversations();
      const withAssistant = latestConversations.map(conv =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...conv.messages, assistantMessage],
              updatedAt: new Date().toISOString()
            }
          : conv
      );
      persistConversations(withAssistant);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, items, outfits, wearLogs, persistConversations]);

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
        isConfigured: aiConfigVersion >= 0 && isAIConfigured(),
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
