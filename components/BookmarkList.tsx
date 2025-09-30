import React from 'react';
import { Bookmark, Layout, Category, Label, Folder } from '../types';
import BookmarkItem from './BookmarkItem';

interface BookmarkListProps {
  bookmarks: Bookmark[];
  layout: Layout;
  onInfo: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onBookmarkVisit: (id: string) => void;
  categories: Category[];
  folders: Folder[];
  labels: Label[];
  isReadingListView?: boolean;
  onMarkAsUnread?: (id: string) => void;
  selectedBookmarkIds: string[];
  onToggleSelect: (id: string) => void;
  onShowToast: (message: string) => void;
  onArchive: (id: string) => void;
  archivingId: string | null;
}

const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, layout, onInfo, onDelete, onToggleFavorite, onBookmarkVisit, categories, folders, labels, isReadingListView, onMarkAsUnread, selectedBookmarkIds, onToggleSelect, onShowToast, onArchive, archivingId }) => {
  if (bookmarks.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-280px)] text-center text-[var(--text-tertiary)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">No Bookmarks Found</h2>
            <p className="mt-2 max-w-sm">It looks like there are no bookmarks matching your current filters. Try adding a new one or adjusting your search!</p>
        </div>
    );
  }

  const renderBookmarks = (bookmarkList: Bookmark[], isReadingListItem: boolean) => (
     <div
      className={`transition-all duration-300 ${
        layout === Layout.GRID
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : layout === Layout.CARD
          ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
          : 'flex flex-col gap-3'
      }`}
    >
      {bookmarkList.map((bookmark) => {
        let bookmarkFolder: Folder | undefined;
        let bookmarkCategory: Category | undefined;

        if (bookmark.folderId) {
          bookmarkFolder = folders.find(f => f.id === bookmark.folderId);
          bookmarkCategory = bookmarkFolder ? categories.find(c => c.id === bookmarkFolder.categoryId) : undefined;
        } else if (bookmark.categoryId) {
          bookmarkCategory = categories.find(c => c.id === bookmark.categoryId);
        }

        return (
            <BookmarkItem
              key={bookmark.id}
              bookmark={bookmark}
              layout={layout}
              onInfo={onInfo}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onBookmarkVisit={onBookmarkVisit}
              category={bookmarkCategory}
              folder={bookmarkFolder}
              labels={labels.filter(l => bookmark.labels.includes(l.id))}
              isReadingListItem={isReadingListItem}
              onMarkAsUnread={onMarkAsUnread}
              isSelected={selectedBookmarkIds.includes(bookmark.id)}
              onToggleSelect={onToggleSelect}
              onShowToast={onShowToast}
              onArchive={onArchive}
              archivingId={archivingId}
            />
        );
      })}
    </div>
  );

  if (isReadingListView) {
    const unreadBookmarks = bookmarks.filter(b => b.visitCount === 0);
    const readBookmarks = bookmarks.filter(b => b.visitCount > 0);
    return (
      <div>
        {unreadBookmarks.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Unread</h2>
            {renderBookmarks(unreadBookmarks, true)}
          </>
        )}
        {readBookmarks.length > 0 && (
           <>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-8 mb-4">Read</h2>
            {renderBookmarks(readBookmarks, true)}
           </>
        )}
      </div>
    );
  }

  return renderBookmarks(bookmarks, false);
};

export default BookmarkList;