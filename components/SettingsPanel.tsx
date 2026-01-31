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
  onDeleteAllChats: () => void;
  accentColor: string;
  accentGradient: string;
  onAccentChange: (color: string, gradient: string) => void;
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
  onDeleteAllChats,
  accentColor,
  accentGradient,
  onAccentChange,
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
            <CloseIcon className="w-6 h-6" />
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
            <label className="settings-label">Accent Color</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
              {[
                { name: 'Default', value: '#4ade80', gradient: 'linear-gradient(135deg, #a3e635 0%, #4ade80 100%)' },
                { name: 'Moon Purple', value: '#4e54c8', gradient: 'linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)' },
                { name: 'Red Sunset', value: '#355c7d', gradient: 'linear-gradient(135deg, #355c7d 0%, #6c5b7b 50%, #c06c84 100%)' },
                { name: 'Horizon Dust', value: '#003973', gradient: 'linear-gradient(135deg, #003973 0%, #e5e5be 100%)' },
                { name: 'Velvet Sun', value: '#e1eec3', gradient: 'linear-gradient(135deg, #e1eec3 0%, #f05053 100%)' },
                { name: 'Broken Hearts', value: '#d9a7c7', gradient: 'linear-gradient(135deg, #d9a7c7 0%, #fffcdc 100%)' },
                { name: 'Relay', value: '#3a1c71', gradient: 'linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)' },
                { name: 'Compare Now', value: '#ef3b36', gradient: 'linear-gradient(135deg, #ef3b36 0%, #ffffff 100%)' },
                { name: 'Cinnamint', value: '#4ac29a', gradient: 'linear-gradient(135deg, #bdfff3 0%, #4ac29a 100%)' },
                { name: 'Burnt Coffee', value: '#785944', gradient: 'linear-gradient(135deg, #fcd9c2 0%, #785944 50%, #261b00 100%)' },
              ].map((preset) => (
                <div
                  key={preset.name}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}
                >
                  <button
                    onClick={() => onAccentChange(preset.value, preset.gradient)}
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      borderRadius: '50%',
                      border: '3px solid rgba(255,255,255,0.95)',
                      background: preset.gradient,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: (accentColor === preset.value && accentGradient === preset.gradient)
                        ? '0 0 0 2px var(--primary), 0 0 0 4px var(--text-primary)'
                        : 'none',
                      transform: (accentColor === preset.value && accentGradient === preset.gradient) ? 'scale(1.1)' : 'scale(1)',
                    }}
                    title={preset.name}
                  />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.2 }}>{preset.name}</span>
                </div>
              ))}

              {/* Custom Color Picker wrapper */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div style={{ position: 'relative', width: '2.5rem', height: '2.5rem' }}>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => onAccentChange(e.target.value, `linear-gradient(135deg, ${e.target.value} 0%, ${e.target.value} 100%)`)}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      border: 'none',
                      padding: 0,
                    }}
                  />
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #9ca3af, #6b7280)',
                  }}>
                    <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>+</span>
                  </div>
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Custom</span>
              </div>
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
        </div >
      </aside >
      {isOpen && <div onClick={onClose} className="settings-overlay md:hidden" />
      }
    </>
  );
};

export default SettingsPanel;