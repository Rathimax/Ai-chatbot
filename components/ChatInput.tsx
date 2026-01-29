import React, { useRef, useEffect } from 'react';
import type { ChatSettings } from '../types';

interface ChatInputProps {
  value: string;
  onChange: (newText: string) => void;
  onSend: (text: string) => void;
  isLoading: boolean;
  settings: ChatSettings;
  onStop?: () => void; // --- NEW: Optional stop handler ---
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, isLoading, settings, onStop }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSend(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="chat-input-area">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How can ThinkAI help you today?"
              className="flex-1 resize-none bg-transparent focus:ring-0"
              rows={1}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !value.trim()}
              className={`send-button ${isLoading ? 'opacity-0 pointer-events-none' : ''}`}
              aria-label="Send message"
            >
              →
            </button>
            {/* --- NEW: Stop Button --- */}
            {isLoading && onStop && (
              <button
                type="button"
                onClick={onStop}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                title="Stop generation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM9 8.25a.75.75 0 00-.75.75v6c0 .414.336.75.75.75h6a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.75H9z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </form>
        <div className="input-tags-container">
          {/* Static Brand Tag */}
          <button className="input-tag">ThinkAI</button>

          {/* --- NEW: Dynamic Model Tag --- */}
          {/* This displays the current Provider (e.g., Gemini, OpenAI) */}
          <button className="input-tag">
            {settings.provider}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;