import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  onToggleSettings: () => void;
  onToggleHistory: () => void;
  isSettingsOpen: boolean;
  isHistoryOpen: boolean;
}

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <rect x="3" y="4" width="18" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4v16" />
  </svg>
);

const BackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ onToggleSettings, onToggleHistory, isSettingsOpen, isHistoryOpen }) => {
  // Removed local menu state as we now toggle History directly

  const handleMenuClick = () => {
    if (isSettingsOpen) {
      onToggleSettings();
    } else if (isHistoryOpen) {
      onToggleHistory(); // Close history
    } else {
      onToggleHistory(); // Open history directly
    }
  };

  return (
    <header
      // --- FIX: Added 'app-header' class and removed inline styles ---
      className="app-header flex items-center justify-between px-6 py-4 flex-shrink-0"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <button onClick={handleMenuClick} className="main-menu-button">
            {isSettingsOpen || isHistoryOpen ? (
              <BackIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>

          {/* Dropdown removed by user request ("no floating elements") */}
        </div>

        <img
          src="/Logo.png"
          alt="ThinkAI Logo"
          className="logo-image"
        />
      </div>

      <div
        className="w-10 h-10 rounded-full flex items-center justify-center avatar-header"
      >
        🤖
      </div>
    </header>
  );
};

export default Header;