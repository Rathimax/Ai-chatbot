import React, { useRef, useEffect } from 'react';
import type { ChatSettings } from '../types';

interface ChatInputProps {
  value: string;
  onChange: (newText: string) => void;
  onSend: (text: string) => void;
  isLoading: boolean;
  settings: ChatSettings;
  onStop?: () => void;
  isEmptyState?: boolean; // --- NEW: Optional prop ---
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend, isLoading, settings, onStop, isEmptyState }) => {
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

  /* --- INTERACTIVE STATES --- */
  const [tone, setTone] = React.useState<'Formal' | 'Friendly' | 'Professional'>('Formal');
  const [showToneMenu, setShowToneMenu] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToneSelect = (selected: 'Formal' | 'Friendly' | 'Professional') => {
    setTone(selected);
    setShowToneMenu(false);
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="chat-input-area">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className={`input-wrapper ${isEmptyState ? 'large' : ''}`}>
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

            <div className={`input-controls ${isEmptyState ? 'large-controls' : ''}`}>
              {isEmptyState ? (
                <>
                  {/* LARGE MODE CONTROLS */}
                  <div className="flex items-center justify-between w-full mt-4 relative">
                    {/* Left: Tone Selector */}
                    <div className="relative">
                      <button
                        type="button"
                        className="input-tag flex items-center gap-1 cursor-pointer hover:bg-black/5 transition-colors"
                        onClick={() => setShowToneMenu(!showToneMenu)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                        {tone}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 text-current opacity-70">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>

                      {/* Tone Dropdown */}
                      {showToneMenu && (
                        <div className="tone-dropdown-menu">
                          {['Formal', 'Friendly', 'Professional'].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleToneSelect(option as any)}
                              className={`tone-option ${tone === option ? 'active' : ''}`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }} // Force hide
                        onChange={(e) => alert(`Selected file: ${e.target.files?.[0]?.name}`)}
                      />

                      <button type="button" className="icon-btn" aria-label="Camera" onClick={handleAttachClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                        </svg>
                      </button>
                      <button type="button" className="icon-btn" aria-label="Attach" onClick={handleAttachClick}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                        </svg>
                      </button>
                      {/* Only show Send button if there is input */}
                      {value.trim() && (
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="send-button-large"
                          aria-label="Send message"
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* STANDARD CONTROLS */
                <>
                  <button
                    type="submit"
                    disabled={isLoading || !value.trim()}
                    className={`send-button ${isLoading ? 'opacity-0 pointer-events-none' : ''}`}
                    aria-label="Send message"
                  >
                    →
                  </button>
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
                </>
              )}
            </div>

          </div>
        </form>

        {/* Footer/Tags */}
        {!isEmptyState ? (
          <div className="input-tags-container">
            <button className="input-tag">ThinkAI</button>
            <button className="input-tag">{settings.provider}</button>
          </div>
        ) : (
          <p className="text-center text-xs text-text-muted mt-3">
            Please double-check responses.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInput;