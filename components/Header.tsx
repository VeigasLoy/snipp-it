import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { ICONS } from '../constants';
import Avatar from './Avatar';

interface HeaderProps {
  user: User;
  onOpenSettings: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onLogout: () => void;
  onAddBookmark: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  onOpenSettings,
  searchTerm,
  setSearchTerm,
  onLogout,
  onAddBookmark,
  onToggleSidebar,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleMenuClick = (tab: string) => {
    onOpenSettings(tab);
    setDropdownOpen(false);
  };

  return (
    <header className="flex items-center justify-between p-4 bg-[var(--bg-primary)] border-b border-[var(--border-primary)] gap-4">
      <div className="flex-1 flex items-center gap-4">
         <button
            onClick={onToggleSidebar}
            className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] md:hidden mr-2"
            aria-label="Open sidebar"
        >
            {ICONS.menu}
        </button>
        <div className="relative w-full max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-tertiary)]">
              {ICONS.search}
          </span>
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
          />
        </div>
        <button
            onClick={onAddBookmark}
            className="flex-shrink-0 flex items-center justify-center py-2 px-2 sm:px-4 text-sm font-semibold text-white bg-[var(--accent-primary)] rounded-lg hover:bg-[var(--accent-primary-hover)] transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-primary)] focus:ring-offset-[var(--bg-secondary)]"
        >
            {ICONS.add}
            <span className="ml-2 hidden sm:block">New Bookmark</span>
        </button>
      </div>
      <div className="flex items-center space-x-2">
         <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="rounded-full hover:opacity-90 transition-opacity"
                aria-label="Open user menu"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
            >
                <Avatar name={user.name} />
            </button>
            {dropdownOpen && (
               <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-primary)] rounded-md shadow-lg py-1 z-20 border border-[var(--border-primary)] ring-1 ring-black ring-opacity-5">
                   <a href="#" onClick={(e) => { e.preventDefault(); handleMenuClick('profile'); }} className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                       Profile
                   </a>
                   <a href="#" onClick={(e) => { e.preventDefault(); handleMenuClick('appearance'); }} className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                       Settings
                   </a>
                   <div className="border-t border-[var(--border-primary)] my-1"></div>
                   <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="block px-4 py-2 text-sm text-red-500 hover:bg-[var(--bg-tertiary)] transition-colors">
                       Logout
                   </a>
               </div>
           )}
         </div>
      </div>
    </header>
  );
};

export default Header;