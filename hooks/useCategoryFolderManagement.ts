import { useState } from 'react';
import { Bookmark, Category, Folder } from '../types';

interface UseCategoryFolderManagementProps {
  bookmarks: Bookmark[];
  folders: Folder[];
  addCategory: (category: Omit<Category, 'id'>) => Promise<string | void>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  addFolder: (folder: Omit<Folder, 'id'>) => Promise<string | void>;
  updateFolder: (id: string, data: Partial<Folder>) => Promise<void>;
  removeFolder: (id: string) => Promise<void>;
  updateBookmark: (id: string, data: Partial<Bookmark>) => Promise<void>;
  setItemToDelete: (item: { type: 'category' | 'folder' | 'label' | 'bookmark-bulk'; id: string | string[]; name: string; } | null) => void;
}

export const useCategoryFolderManagement = ({
  bookmarks,
  folders,
  addCategory,
  updateCategory,
  removeCategory,
  addFolder,
  updateFolder,
  removeFolder,
  updateBookmark,
  setItemToDelete
}: UseCategoryFolderManagementProps) => {

  const handleAddCategorySubmit = (name: string) => {
    if (!name.trim()) return;
    addCategory({ name: name.trim() });
  };

  const handleUpdateCategory = (id: string, name: string) => {
    if (!name.trim()) return;
    updateCategory(id, { name: name.trim() });
  };

  const handleDeleteCategory = (id: string, name: string) => {
    const hasFolders = folders.some(f => f.categoryId === id);
    const hasDirectBookmarks = bookmarks.some(b => b.categoryId === id);
    if(hasFolders) {
        alert(`Cannot delete "${name}". Please delete or move all folders from this category first.`);
        return;
    }
    if(hasDirectBookmarks) {
        alert(`Cannot delete "${name}". Please delete or move all bookmarks directly assigned to this category first.`);
        return;
    }
    setItemToDelete({ type: 'category', id, name });
  };
  
  const handleAddFolderSubmit = (name: string, categoryId: string) => {
    if (!name.trim() || !categoryId) return;
    addFolder({ name: name.trim(), categoryId, isPinned: false });
  };

  const handleUpdateFolder = (id: string, name: string) => {
    if (!name.trim()) return;
    updateFolder(id, { name: name.trim() });
  };
  
  const handleDeleteFolder = (id: string, name: string) => {
    if (folders.length <= 1) {
        alert(`Cannot delete "${name}" as it is your only folder.`);
        return;
    }
    setItemToDelete({ type: 'folder', id, name });
  };

  return {
    handleAddCategorySubmit,
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddFolderSubmit,
    handleUpdateFolder,
    handleDeleteFolder,
  };
};
