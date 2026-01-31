import React, { useState, Fragment } from 'react';
import CollapseIcon from './CollapseIcon';

interface ChatSession {
  id: string;
  title: string;
}

interface HistoryPanelProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isOpen: boolean;
  onNewChat: () => void;
  onSwitchChat: (sessionId: string) => void;
  onDeleteChat: (sessionId: string) => void;
  onToggle: () => void;
  onOpenSettings: () => void;
}

// Plus icon for New Chat
const PlusIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

// Icon to close the sidebar
const SidebarCloseIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

// Trash icon for deleting
const TrashIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.134H8.09c-1.18 0-2.09.954-2.09 2.134v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const SettingsIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const HistoryPanel: React.FC<HistoryPanelProps> = ({ sessions, activeSessionId, isOpen, onNewChat, onSwitchChat, onDeleteChat, onToggle, onOpenSettings }) => {
  const [deleteVisibleFor, setDeleteVisibleFor] = useState<string | null>(null);

  return (
    <Fragment>
      <aside className={`history-panel ${!isOpen ? 'closed' : ''}`}>
        <div className="history-header">
          {/* New Chat Button */}
          <button className="new-chat-button" onClick={onNewChat}>
            <PlusIcon />
            <span>New Chat</span>
          </button>

          {/* Close Sidebar Button */}
          <button className="close-history-button" onClick={onToggle} aria-label="Close sidebar">
            <SidebarCloseIcon />
          </button>
        </div>

        <nav className="history-list flex-1 overflow-y-auto">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`history-item-wrapper ${session.id === activeSessionId ? 'active' : ''}`}
              onDoubleClick={() => setDeleteVisibleFor(session.id)}
              onClick={() => {
                if (deleteVisibleFor && deleteVisibleFor !== session.id) {
                  setDeleteVisibleFor(null);
                }
              }}
            >
              <button className="history-item-button" onClick={() => onSwitchChat(session.id)}>
                {session.title || "New Chat"}
              </button>
              {deleteVisibleFor === session.id && (
                <button className="history-delete-button" onClick={() => onDeleteChat(session.id)}>
                  <TrashIcon />
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Settings Button (No Separator) */}
        <button
          className="flex items-center gap-3 pl-8 pr-5 py-4 text-white hover:opacity-100 transition-all font-semibold mt-auto rounded-xl mx-2"
          style={{
            width: 'calc(100% - 16px)',
            background: 'var(--accent-gradient)',
            opacity: 0.75,
            marginBottom: '0px',
            paddingLeft: '2rem'
          }}
          onClick={() => {
            onToggle(); // Close history
            onOpenSettings(); // Open settings
          }}
        >
          <SettingsIcon />
          <span style={{ fontSize: '1.125rem' }}>Settings</span>
        </button>
      </aside>

      {isOpen && <div onClick={onToggle} className="history-overlay" />}
    </Fragment>
  );
};

export default HistoryPanel;