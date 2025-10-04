import { useState, useMemo } from 'react';
import { Bookmark, Label } from '../types';
import { useFirestore } from './useFirestore';
import { PRIVATE_SETTINGS } from '../constants';

interface UsePrivateBookmarksProps {
  userId: string;
  bookmarks: Bookmark[];
  updateBookmark: (id: string, data: Partial<Bookmark>) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  bulkUpdateBookmarks: (ids: string[], data: Partial<Bookmark>) => Promise<void>;
  bulkDeleteBookmarks: (ids: string[]) => Promise<void>;
  setToastMessage: (message: string | null) => void;
  labels: Label[];
  setBulkMoveModalOpen: (isOpen: boolean) => void; // Added
  setBulkAddLabelsModalOpen: (isOpen: boolean) => void; // Added
}

export const usePrivateBookmarks = ({
  userId,
  bookmarks,
  updateBookmark,
  removeBookmark,
  bulkUpdateBookmarks,
  bulkDeleteBookmarks,
  setToastMessage,
  labels,
  setBulkMoveModalOpen, // Destructure
  setBulkAddLabelsModalOpen, // Destructure
}: UsePrivateBookmarksProps) => {
  const privateBookmarks = useMemo(() => {
    return bookmarks.filter(b => b.categoryId === PRIVATE_SETTINGS.CATEGORY_ID);
  }, [bookmarks]);

  const [selectedPrivateBookmarkIds, setSelectedPrivateBookmarkIds] = useState<string[]>([]);

  const handleToggleSelectPrivateBookmark = (id: string) => {
    setSelectedPrivateBookmarkIds(prev =>
      prev.includes(id) ? prev.filter(bid => bid !== id) : [...prev, id]
    );
  };

  const handleSelectAllPrivateBookmarks = () => {
    if (selectedPrivateBookmarkIds.length === privateBookmarks.length) {
      setSelectedPrivateBookmarkIds([]);
    } else {
      setSelectedPrivateBookmarkIds(privateBookmarks.map(b => b.id));
    }
  };

  const handleRemovePrivateBookmark = async (id: string) => {
    await removeBookmark(id);
    setToastMessage('Private bookmark deleted successfully!');
  };

  const handleBulkDeletePrivateBookmarks = async () => {
    await bulkDeleteBookmarks(selectedPrivateBookmarkIds);
    setSelectedPrivateBookmarkIds([]);
    setToastMessage(`${selectedPrivateBookmarkIds.length} private bookmarks deleted successfully!`);
  };

  const handleBulkMovePrivate = async (targetCategoryId: string, targetFolderId: string | null) => {
    const isPrivate = targetCategoryId === PRIVATE_SETTINGS.CATEGORY_ID;
    
    await bulkUpdateBookmarks(selectedPrivateBookmarkIds, {
      categoryId: targetCategoryId,
      folderId: isPrivate ? null : targetFolderId, // Set folderId to null if it's a private category
      isPrivate: isPrivate,
    });
    setToastMessage(`${selectedPrivateBookmarkIds.length} private bookmarks moved successfully!`);
    setSelectedPrivateBookmarkIds([]);
    setBulkMoveModalOpen(false); // Close the modal
  };

  const handleBulkAddLabelsPrivate = async (labelIdsToAdd: string[]) => {
    const bookmarksToUpdate = bookmarks.filter(b => selectedPrivateBookmarkIds.includes(b.id));
    for (const b of bookmarksToUpdate) {
      const newLabels = [...new Set([...b.labels, ...labelIdsToAdd])];
      await updateBookmark(b.id, { labels: newLabels });
    }
    setToastMessage(`${selectedPrivateBookmarkIds.length} labels added to private bookmarks!`);
    setSelectedPrivateBookmarkIds([]);
    setBulkAddLabelsModalOpen(false); // Close the modal
  };

  return {
    privateBookmarks,
    selectedPrivateBookmarkIds,
    setSelectedPrivateBookmarkIds,
    handleToggleSelectPrivateBookmark,
    handleSelectAllPrivateBookmarks,
    handleRemovePrivateBookmark,
    handleBulkDeletePrivateBookmarks,
    handleBulkMovePrivate,
    handleBulkAddLabelsPrivate,
  };
};
