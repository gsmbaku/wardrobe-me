import { useState, useRef, useEffect, useCallback } from 'react';
import type { WardrobeItem } from '../types';
import { useChat } from '../hooks/useChat';
import { ChatMessage, ChatInput, ItemSelector, SuggestedPrompts } from '../components/assistant';

export default function AssistantPage() {
  const {
    conversations,
    activeConversation,
    isLoading,
    error,
    isConfigured,
    createConversation,
    deleteConversation,
    setActiveConversation,
    sendMessage,
    clearError
  } = useChat();

  const [showSidebar, setShowSidebar] = useState(false);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [selectedItems, setSelectedItems] = useState<WardrobeItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSend = useCallback(async (content: string, itemIds: string[]) => {
    if (!activeConversation) {
      createConversation();
    }
    await sendMessage(content, itemIds);
    setSelectedItems([]);
  }, [activeConversation, createConversation, sendMessage]);

  const handleSelectPrompt = useCallback((prompt: string) => {
    if (!activeConversation) {
      createConversation();
    }
    sendMessage(prompt, []);
  }, [activeConversation, createConversation, sendMessage]);

  const handleToggleItem = useCallback((item: WardrobeItem) => {
    setSelectedItems(prev =>
      prev.find(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    );
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setSelectedItems(prev => prev.filter(i => i.id !== id));
  }, []);

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] md:h-[calc(100vh-57px)] px-4">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">API Key Required</h2>
        <p className="text-gray-500 text-center max-w-md mb-4">
          To use the AI Fashion Assistant, you need to configure your API key in the environment variables.
        </p>
        <div className="bg-gray-100 rounded-lg p-4 text-sm font-mono text-gray-700 max-w-md">
          <p>VITE_AI_BASE_URL=https://api.moonshot.cn/v1</p>
          <p>VITE_AI_API_KEY=your-api-key</p>
          <p>VITE_AI_MODEL=moonshot-v1-8k-vision-preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-140px)] md:h-[calc(100vh-57px)]">
      {/* Mobile sidebar toggle */}
      <button
        type="button"
        onClick={() => setShowSidebar(true)}
        className="md:hidden fixed left-4 top-20 z-30 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar overlay for mobile */}
      {showSidebar && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 md:z-auto w-72 bg-white border-r border-gray-200 transform transition-transform md:transform-none ${
          showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Conversations</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                createConversation();
                setShowSidebar(false);
              }}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
              title="New conversation"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setShowSidebar(false)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-65px)]">
          {conversations.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No conversations yet
            </p>
          ) : (
            <ul className="p-2 space-y-1">
              {conversations.map(conv => (
                <li key={conv.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveConversation(conv.id);
                      setShowSidebar(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors group ${
                      activeConversation?.id === conv.id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="flex-1 truncate text-sm">{conv.title}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col bg-gray-50 min-w-0">
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <SuggestedPrompts onSelectPrompt={handleSelectPrompt} />
          ) : (
            <div className="max-w-3xl mx-auto py-4 px-4 space-y-4">
              {activeConversation.messages.map(message => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <ChatInput
          onSend={handleSend}
          onOpenItemSelector={() => setShowItemSelector(true)}
          selectedItems={selectedItems}
          onRemoveItem={handleRemoveItem}
          disabled={isLoading}
        />
      </main>

      {/* Item selector modal */}
      <ItemSelector
        isOpen={showItemSelector}
        onClose={() => setShowItemSelector(false)}
        selectedIds={selectedItems.map(i => i.id)}
        onToggleItem={handleToggleItem}
      />
    </div>
  );
}
