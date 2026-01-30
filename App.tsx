import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SettingsPanel from './components/SettingsPanel';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import useChat from './hooks/useChat';
import type { ChatSettings } from './types';
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

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

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
  const handleSend = (message: string) => { sendMessage(message); setCurrentInput(''); };
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
    <div className="flex w-full flex-col font-sans text-text-primary bg-primary overflow-hidden" style={{ height: '100dvh' }}>
      <Header
        onToggleSettings={handleToggleSettings}
        onToggleHistory={handleToggleHistory}
      />

      <div className="flex flex-1 overflow-hidden min-h-0 relative">
        <HistoryPanel
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewChat={startNewChat}
          onSwitchChat={switchChat}
          onDeleteChat={deleteChat}
          isOpen={isHistoryPanelOpen}
          onToggle={handleToggleHistory}
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
          onDeleteAllChats={deleteAllSessions} // <-- Pass it here
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
            onStop={stopGeneration}
            isEmptyState={messages.length === 0} // --- NEW: Pass empty state ---
          />
        </main>
      </div>
    </div>
  );
};

export default App;