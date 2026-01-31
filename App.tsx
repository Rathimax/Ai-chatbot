import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import useChat from './hooks/useChat';
import type { ChatSettings, Attachment } from './types';
import HistoryPanel from './components/HistoryPanel';

const App: React.FC = () => {
  const {
    sessions, activeSessionId, messages, isLoading, error, settings,
    sendMessage, clearChat, summarizeChat, updateSettings, retryLastMessage,
    startNewChat, switchChat, deleteChat, deleteAllSessions, stopGeneration, // <-- Destructure new function
  } = useChat();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(window.innerWidth > 768);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // --- Global accent color (not per-session) ---
  const [accentColor, setAccentColor] = useState(localStorage.getItem('accentColor') || '#4ade80');
  const [accentGradient, setAccentGradient] = useState(localStorage.getItem('accentGradient') || 'linear-gradient(135deg, #a3e635 0%, #4ade80 100%)');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- NEW: Apply Accent Color ---
  useEffect(() => {
    const root = document.documentElement;
    const color = accentColor;

    root.style.setProperty('--accent', color);
    root.style.setProperty('--accent-gradient', accentGradient);

    // Persist to localStorage
    localStorage.setItem('accentColor', color);
    localStorage.setItem('accentGradient', accentGradient);

    // Extract all hex colors from the gradient string
    const hexColors = accentGradient.match(/#[a-fA-F0-9]{6}/g) || [color];

    // For hex to rgba conversions
    const hexToRgb = (hex: string) => {
      // Robust check - if not valid hex, return Blue fallback
      if (!hex || typeof hex !== 'string') return { r: 59, g: 130, b: 246 };
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 59, g: 130, b: 246 }; // Default Blue
    };

    const rgb = hexToRgb(color);
    root.style.setProperty('--accent-light', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`);
    root.style.setProperty('--accent-glow', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);
    root.style.setProperty('--border-light', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);
    root.style.setProperty('--accent-hover', color);

    // Create background gradient using ALL colors from the gradient
    // Position them across the top of the screen as subtle radial glows
    const positions = ['25% 0%', '50% 0%', '75% 0%', '90% 80%'];
    const bgParts = hexColors.slice(0, 4).map((hexColor, i) => {
      const c = hexToRgb(hexColor);
      const opacity = i === 0 ? 0.25 : 0.15; // Increased opacity
      const pos = positions[i] || positions[0];
      return `radial-gradient(circle at ${pos}, rgba(${c.r}, ${c.g}, ${c.b}, ${opacity}) 0%, transparent 60%)`;
    });

    root.style.setProperty('--accent-bg-gradient', bgParts.join(', '));

  }, [accentColor, accentGradient]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsHistoryPanelOpen(false);
        setIsSettingsOpen(false);
      } else if (!isSettingsOpen) {
        setIsHistoryPanelOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSettingsOpen]);

  const [currentInput, setCurrentInput] = useState('');

  const handlePromptClick = (promptText: string) => { setCurrentInput(promptText); };
  const handleSend = (message: string, attachments?: Attachment[]) => { sendMessage(message, attachments); setCurrentInput(''); };
  const handleUpdateSettings = (newSettings: Partial<ChatSettings>) => { updateSettings(newSettings); };

  const handleToggleHistory = () => {
    const newState = !isHistoryPanelOpen;
    setIsHistoryPanelOpen(newState);
    if (newState) setIsSettingsOpen(false);
  };

  const handleToggleSettings = () => {
    const newState = !isSettingsOpen;
    setIsSettingsOpen(newState);
    if (newState) setIsHistoryPanelOpen(false);
  };

  const getMainContentClass = () => {
    if (isHistoryPanelOpen) return 'history-open';
    if (isSettingsOpen) return 'settings-open';
    return '';
  };

  return (
    <div className="flex w-full flex-col font-sans text-text-primary overflow-hidden" style={{ height: '100dvh' }}>
      <Header
        onToggleSettings={handleToggleSettings}
        onToggleHistory={handleToggleHistory}
        isSettingsOpen={isSettingsOpen}
        isHistoryOpen={isHistoryPanelOpen}
      />

      <div className="flex flex-1 overflow-hidden min-h-0 relative" style={{ paddingTop: '73px' }}>
        <HistoryPanel
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewChat={startNewChat}
          onSwitchChat={switchChat}
          onDeleteChat={deleteChat}
          isOpen={isHistoryPanelOpen}
          onToggle={handleToggleHistory}
          onOpenSettings={handleToggleSettings}
        />

        <SettingsPanel
          isOpen={isSettingsOpen}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClearChat={clearChat}
          onSummarizeChat={summarizeChat}
          onClose={() => setIsSettingsOpen(false)}
          messages={messages}
          currentTheme={theme}
          onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          onDeleteAllChats={deleteAllSessions}
          accentColor={accentColor}
          accentGradient={accentGradient}
          onAccentChange={(color, gradient) => {
            setAccentColor(color);
            setAccentGradient(gradient);
          }}
        />

        <main
          className={`main-content ${getMainContentClass()}`}
        >
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            error={error}
            onRetry={retryLastMessage}
            onPromptClick={handlePromptClick}
          />
          <ChatInput
            value={currentInput}
            onChange={setCurrentInput}
            onSend={handleSend}
            isLoading={isLoading}
            settings={settings}
            onUpdateSettings={handleUpdateSettings} // --- Pass update handler ---
            onStop={stopGeneration}
            isEmptyState={messages.length === 0} // --- NEW: Pass empty state ---
          />
        </main>
      </div>
    </div>
  );
};

export default App;