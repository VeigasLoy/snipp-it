import React from 'react';
import { Bookmark, Category, Folder, Label, Layout } from '../types';
import BookmarkItem from './BookmarkItem';

interface FrequentlyVisitedProps {
  bookmarks: Bookmark[];
  onBookmarkVisit: (id: string) => void;
  onInfo: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onArchive: (id: string) => void;
  onBulkArchive: (ids: string[]) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkTag: (ids: string[], tags: string[]) => void;
  onBulkCategorize: (ids: string[], category: string) => void;
  onBulkMarkAsRead: (ids: string[]) => void;
  onBulkToggleFavorite: (ids: string[]) => void;
  // These props are not directly used by FrequentlyVisited but might be passed down to BookmarkItem
  categories?: Category[]; 
  folders?: Folder[];
  labels?: Label[];
  onShowToast?: (message: string) => void; 
  archivingId?: string | null;
}

const FrequentlyVisited: React.FC<FrequentlyVisitedProps> = ({
  bookmarks,
  onBookmarkVisit,
  onInfo,
  onDelete,
  onToggleFavorite,
  onArchive,
  onBulkArchive,
  onBulkDelete,
  onBulkTag,
  onBulkCategorize,
  onBulkMarkAsRead,
  onBulkToggleFavorite,
  categories = [],
  folders = [],
  labels = [],
  onShowToast = () => {},
  archivingId = null,
}) => {
  if (bookmarks.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Frequently Visited</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {bookmarks.map(bookmark => {
            const folder = folders.find(f => f.id === bookmark.folderId);
            const category = bookmark.categoryId 
                ? categories.find(c => c.id === bookmark.categoryId)
                : folder 
                    ? categories.find(c => c.id === folder.categoryId) 
                    : undefined;
            return (
                <BookmarkItem
                    key={bookmark.id}
                    bookmark={bookmark}
                    layout={Layout.GRID}
                    onInfo={onInfo}
                    onDelete={onDelete}
                    onToggleFavorite={onToggleFavorite}
                    onBookmarkVisit={onBookmarkVisit}
                    category={category}
                    folder={folder}
                    labels={labels.filter(l => bookmark.labels.includes(l.id))}
                    onShowToast={onShowToast}
                    onArchive={onArchive}
                    archivingId={archivingId}
                />
            );
        })}
      </div>
    </div>
  );
};

export default FrequentlyVisited;