import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  onToggleSettings: () => void;
  onToggleHistory: () => void;
}

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <rect x="3" y="4" width="18" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4v16" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ onToggleSettings, onToggleHistory }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      // --- FIX: Added 'app-header' class and removed inline styles ---
      className="app-header flex items-center justify-between px-6 py-4 flex-shrink-0"
    >
      <div className="flex items-center gap-4">
        <div className="relative" ref={menuRef}>
          <button onClick={() => setIsMenuOpen(prev => !prev)} className="main-menu-button">
            <MenuIcon className="w-6 h-6" />
          </button>

          {isMenuOpen && (
            <div className="dropdown-menu">
              <button
                className="dropdown-item"
                onClick={() => {
                  onToggleHistory();
                  setIsMenuOpen(false);
                }}
              >
                Chat History
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  onToggleSettings();
                  setIsMenuOpen(false);
                }}
              >
                Settings
              </button>
            </div>
          )}
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