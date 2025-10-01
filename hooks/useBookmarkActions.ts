import { useState } from 'react';
import { Bookmark, Category, Folder, Label, ActiveFilter } from '../types';
import { PRIVATE_SETTINGS } from '../constants';

interface UseBookmarkActionsProps {
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'id'>) => Promise<string | void>;
  updateBookmark: (id: string, data: Partial<Bookmark>) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  bulkUpdateBookmarks: (ids: string[], data: Partial<Bookmark>) => Promise<void>;
  bulkDeleteBookmarks: (ids: string[]) => Promise<void>;
  setToastMessage: (message: string | null) => void;
  activeFilter: ActiveFilter;
  labels: Label[];
  filteredBookmarks: Bookmark[];
  setItemToDelete: (item: { type: 'category' | 'folder' | 'label' | 'bookmark-bulk'; id: string | string[]; name: string; } | null) => void;
}

export const useBookmarkActions = ({
  bookmarks,
  addBookmark,
  updateBookmark,
  removeBookmark,
  bulkUpdateBookmarks,
  bulkDeleteBookmarks,
  setToastMessage,
  activeFilter,
  labels,
  filteredBookmarks,
  setItemToDelete
}: UseBookmarkActionsProps) => {
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('edit');
  const [initialBookmarkFolderId, setInitialBookmarkFolderId] = useState<string | null>(null);
  const [initialBookmarkCategoryId, setInitialBookmarkCategoryId] = useState<string | null>(null);

  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<string[]>([]);
  const [isBulkMoveModalOpen, setBulkMoveModalOpen] = useState(false);
  const [isBulkAddLabelsModalOpen, setBulkAddLabelsModalOpen] = useState(false);

  const handleAddBookmarkClick = () => {
    setEditingBookmark(null);
    setModalMode('edit');

    if (activeFilter.type === 'folder') {
      setInitialBookmarkFolderId(activeFilter.id as string);
      setInitialBookmarkCategoryId(null);
    } else if (activeFilter.type === 'category') {
      setInitialBookmarkCategoryId(activeFilter.id as string);
      setInitialBookmarkFolderId(null);
    } else {
      setInitialBookmarkFolderId(null);
      setInitialBookmarkCategoryId(null);
    }
    setFormModalOpen(true);
  };

  const handleInfoBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setModalMode('view');
    setFormModalOpen(true);
  };
  
  const handleSaveBookmark = (bookmarkData: Omit<Bookmark, 'id' | 'createdAt' | 'isFavorite' | 'visitCount' | 'lastVisitedAt'>, id?: string) => {
    const dataToSave = {
      ...bookmarkData,
      isPrivate: bookmarkData.folderId === PRIVATE_SETTINGS.FOLDER_ID,
      folderId: bookmarkData.folderId || null,
      categoryId: bookmarkData.categoryId || null,
    };

    if (id) {
      updateBookmark(id, dataToSave);
      setToastMessage('Bookmark updated successfully!');
    } else {
      const newBookmark: Omit<Bookmark, 'id'> = {
        ...dataToSave,
        createdAt: new Date().toISOString(),
        isFavorite: false,
        visitCount: 0,
      };
      addBookmark(newBookmark);
      setToastMessage('Bookmark created successfully!');
    }
    setFormModalOpen(false);
    setEditingBookmark(null);
    setInitialBookmarkFolderId(null);
    setInitialBookmarkCategoryId(null);
  };

  const handleBookmarkVisit = (id: string) => {
    const bookmark = bookmarks.find(b => b.id === id);
    if(bookmark) {
      updateBookmark(id, { visitCount: bookmark.visitCount + 1, lastVisitedAt: new Date().toISOString() });
    }
  };
  
  const handleMarkAsUnread = (id: string) => {
    updateBookmark(id, { visitCount: 0 });
  };

  const handleToggleFavorite = (id: string) => {
    const bookmark = bookmarks.find(b => b.id === id);
    if(bookmark) {
      updateBookmark(id, { isFavorite: !bookmark.isFavorite });
    }
  };

  const handleToggleSelectBookmark = (id: string) => {
    setSelectedBookmarkIds(prev =>
      prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedBookmarkIds.length === filteredBookmarks.length) {
      setSelectedBookmarkIds([]);
    } else {
      setSelectedBookmarkIds(filteredBookmarks.map(b => b.id));
    }
  };

  const handleBulkMove = (folderId: string) => {
    const isPrivate = folderId === PRIVATE_SETTINGS.FOLDER_ID;
    bulkUpdateBookmarks(selectedBookmarkIds, { folderId, isPrivate, categoryId: null }); 
    setBulkMoveModalOpen(false);
    setSelectedBookmarkIds([]);
  };

  const handleBulkAddLabels = (labelIdsToAdd: string[]) => {
    const bookmarksToUpdate = bookmarks.filter(b => selectedBookmarkIds.includes(b.id));
    bookmarksToUpdate.forEach(b => {
      const newLabels = [...new Set([...b.labels, ...labelIdsToAdd])];
      updateBookmark(b.id, { labels: newLabels });
    });
    setBulkAddLabelsModalOpen(false);
    setSelectedBookmarkIds([]);
  };
  
  const handleOpenBulkDeleteModal = () => {
      setItemToDelete({
          type: 'bookmark-bulk',
          id: selectedBookmarkIds,
          name: `${selectedBookmarkIds.length} bookmarks`
      })
  };

  return {
    isFormModalOpen, setFormModalOpen,
    editingBookmark, setEditingBookmark,
    modalMode,
    initialBookmarkFolderId,
    initialBookmarkCategoryId,
    selectedBookmarkIds, setSelectedBookmarkIds,
    isBulkMoveModalOpen, setBulkMoveModalOpen,
    isBulkAddLabelsModalOpen, setBulkAddLabelsModalOpen,
    handleAddBookmarkClick,
    handleInfoBookmark,
    handleSaveBookmark,
    handleBookmarkVisit,
    handleMarkAsUnread,
    handleToggleFavorite,
    handleToggleSelectBookmark,
    handleSelectAll,
    handleBulkMove,
    handleBulkAddLabels,
    handleOpenBulkDeleteModal,
  };
};
