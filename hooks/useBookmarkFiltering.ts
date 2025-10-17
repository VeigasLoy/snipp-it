import { useMemo } from 'react';
import { Bookmark, Folder, ActiveFilter, SortByType } from '../types';

export const useBookmarkFiltering = (
  bookmarks: Bookmark[],
  folders: Folder[],
  activeFilter: ActiveFilter,
  searchTerm: string,
  sortBy: SortByType
) => {
  const filteredBookmarks = useMemo(() => {
    let currentBookmarks = bookmarks;

    // Removed the special handling for 'Private Collections'.
    // Private bookmarks will now be treated like any other bookmark
    // and will be included in the general view.

    // 2. Apply view-specific filters
    const viewFiltered = currentBookmarks.filter(bookmark => {
      switch (activeFilter.type) {
        case 'all':
          return true;
        case 'favorites':
          return bookmark.isFavorite;
        case 'archived':
          return !!bookmark.archivedHtml;
        case 'abandoned': {
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const lastVisited = bookmark.lastVisitedAt ? new Date(bookmark.lastVisitedAt) : null;
          const created = new Date(bookmark.createdAt);
          if (lastVisited) {
            return lastVisited < thirtyDaysAgo;
          }
          return created < thirtyDaysAgo;
        }
        case 'category': {
          // Filter by categoryId or folderId within that category.
          const folderIdsInCategory = folders.filter(f => f.categoryId === activeFilter.id).map(f => f.id);
          return bookmark.categoryId === activeFilter.id || (bookmark.folderId && folderIdsInCategory.includes(bookmark.folderId));
        }
        case 'folder':
          return bookmark.folderId === activeFilter.id;
        case 'label':
          if (Array.isArray(activeFilter.id)) {
            return activeFilter.id.some(labelId => bookmark.labels.includes(labelId));
          }
          return false;
        default:
          return true;
      }
    });

    const searchFiltered = viewFiltered.filter(bookmark => {
      const searchLower = searchTerm.toLowerCase();
      return (
        bookmark.title.toLowerCase().includes(searchLower) ||
        bookmark.description.toLowerCase().includes(searchLower) ||
        bookmark.url.toLowerCase().includes(searchLower)
      );
    });

    return [...searchFiltered].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-visited':
          return b.visitCount - a.visitCount;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [bookmarks, folders, activeFilter, searchTerm, sortBy]);

  return filteredBookmarks;
};
