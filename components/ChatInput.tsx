import React, { useRef, useEffect } from 'react';
import type { ChatSettings } from '../types';

interface ChatInputProps {
  value: string;
  onChange: (newText: string) => void;
  onSend: (text: string) => void;
  isLoading: boolean;
  settings: ChatSettings; // --- NEW: Added settings prop ---
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, isLoading, settings }) => {
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
              className="send-button"
              aria-label="Send message"
            >
              →
            </button>
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