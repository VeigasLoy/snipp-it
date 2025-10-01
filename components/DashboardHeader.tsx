import React from 'react';
import { ActiveFilter, Bookmark, SortByType } from '../types';

interface DashboardHeaderProps {
  activeFilter: ActiveFilter;
  sortBy: SortByType;
  setSortBy: (sortBy: SortByType) => void;
  filteredBookmarks: Bookmark[];
  selectedBookmarkIds: string[];
  handleSelectAll: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeFilter,
  sortBy,
  setSortBy,
  filteredBookmarks,
  selectedBookmarkIds,
  handleSelectAll,
}) => {
  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between bg-[var(--bg-primary)] py-4 px-6 border-b border-[var(--border-primary)]">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{activeFilter.name}</h1>
      <div className="flex items-end space-x-4">
        <div>
          <label htmlFor="sort-by" className="block text-xs font-medium text-[var(--text-tertiary)] mb-1">Sort by:</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortByType)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md text-sm py-1 pl-2 pr-8 focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] focus:outline-none appearance-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most-visited">Most Visited</option>
            <option value="title">Title</option>
          </select>
        </div>
        {filteredBookmarks.length > 0 && (
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
              checked={filteredBookmarks.length > 0 && selectedBookmarkIds.length === filteredBookmarks.length}
              onChange={handleSelectAll}
              aria-label="Select all bookmarks"
            />
            <label className="text-sm text-[var(--text-secondary)]">Select All</label>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
