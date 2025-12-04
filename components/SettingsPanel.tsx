import React, { useState, useEffect } from 'react';
import type { ChatSettings, Message } from '../types';
import { ChatProvider } from '../types';
import { AVAILABLE_MODELS } from '../constants';

interface SettingsPanelProps {
  isOpen: boolean;
  settings: ChatSettings;
  messages: Message[];
  currentTheme: string;
  onUpdateSettings: (newSettings: Partial<ChatSettings>) => void;
  onClose: () => void;
  onToggleTheme: () => void;
  onClearChat: () => void;
  onSummarizeChat: () => void;
  onDeleteAllChats: () => void; // --- NEW PROP ---
}

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
  currentTheme,
  onToggleTheme,
  onDeleteAllChats, // Destructure new prop
}) => {
  const [localSettings, setLocalSettings] = useState<ChatSettings>(settings);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as ChatProvider;
    setLocalSettings(prev => ({
      ...prev,
      provider: newProvider,
      model: AVAILABLE_MODELS[newProvider][0],
    }));
  };
  
  const handleApply = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  return (
    <>
      <aside className={`settings-panel ${!isOpen ? 'closed' : ''}`}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button onClick={onClose} className="settings-close-button md:hidden">
             <CloseIcon className="w-6 h-6"/>
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <label className="settings-label">Theme</label>
            <div className="theme-toggle-container">
              <button 
                onClick={onToggleTheme} 
                className={`theme-toggle-button ${currentTheme === 'light' ? 'active' : ''}`}
              >
                Light
              </button>
              <button 
                onClick={onToggleTheme}
                className={`theme-toggle-button ${currentTheme === 'dark' ? 'active' : ''}`}
              >
                Dark
              </button>
            </div>
          </div>

          <div className="settings-section">
            <label htmlFor="provider" className="settings-label">
              AI Provider
            </label>
            <select
              id="provider"
              value={localSettings.provider}
              onChange={handleProviderChange}
              className="settings-select"
            >
              {Object.values(ChatProvider).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="settings-section">
            <label htmlFor="model" className="settings-label">
              Model
            </label>
            <select
              id="model"
              value={localSettings.model}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, model: e.target.value }))}
              className="settings-select"
            >
              {AVAILABLE_MODELS[localSettings.provider].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="settings-section">
            <label className="settings-label">Temperature</label>
            <div className="temperature-button-group">
              <button 
                onClick={() => setLocalSettings(prev => ({ ...prev, temperature: 0.5 }))}
                className={`temperature-button ${localSettings.temperature === 0.5 ? 'active' : ''}`}
              >
                Balanced
              </button>
              <button 
                onClick={() => setLocalSettings(prev => ({ ...prev, temperature: 0.7 }))}
                className={`temperature-button ${localSettings.temperature === 0.7 ? 'active' : ''}`}
              >
                Creative
              </button>
              <button 
                onClick={() => setLocalSettings(prev => ({ ...prev, temperature: 1.0 }))}
                className={`temperature-button ${localSettings.temperature === 1.0 ? 'active' : ''}`}
              >
                Precise
              </button>
            </div>
          </div>
          
          <div className="settings-section">
            <label htmlFor="system-prompt" className="settings-label">
              System Prompt
            </label>
            <textarea
              id="system-prompt"
              rows={4}
              value={localSettings.systemPrompt}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
              className="settings-textarea"
              placeholder="e.g., You are a helpful assistant."
            />
          </div>

          <div className="settings-actions">
            <button onClick={handleApply} className="settings-button apply">
              Apply Changes
            </button>
            
            {/* --- NEW: Danger Zone for Deletion --- */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <label className="settings-label" style={{ marginBottom: '0.5rem', display: 'block', color: 'var(--danger)' }}>Danger Zone</label>
              <button onClick={onDeleteAllChats} className="settings-button danger">
                Delete All Chat History
              </button>
            </div>
          </div>
        </div>
      </aside>
      {isOpen && <div onClick={onClose} className="settings-overlay md:hidden" />}
    </>
  );
};

export default SettingsPanel;