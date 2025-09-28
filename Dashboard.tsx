import React, { useState, useMemo, useEffect } from 'react';
import { Bookmark, Category, Label, Layout, Theme, Folder, ActiveFilter, User, Font } from './types';
import { useFirestore } from './hooks/useFirestore';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BookmarkList from './components/BookmarkList';
import BookmarkFormModal from './components/BookmarkFormModal';
import FrequentlyVisited from './components/FrequentlyVisited';
import SettingsPage from './pages/SettingsPage';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import BulkActionBar from './components/BulkActionBar';
import { BulkMoveModal, BulkAddLabelsModal } from './components/BulkActionsModals';
import Toast from './components/Toast';

type DeletionObject = {
  type: 'category' | 'folder' | 'label' | 'bookmark-bulk';
  id: string | string[];
  name: string;
}

type SortByType = 'newest' | 'oldest' | 'most-visited' | 'title';

interface DashboardProps {
    user: User;
    setUser: (user: Partial<User>) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    layout: Layout;
    setLayout: (layout: Layout) => void;
    font: Font;
    setFont: (font: Font) => void;
    onLogout: () => void;
    onPrivateFolderClick: () => void;
}

function Dashboard({ user: loggedInUser, setUser, theme, setTheme, layout, setLayout, font, setFont, onLogout, onPrivateFolderClick }: DashboardProps) {
  const { data: bookmarks, add: addBookmark, update: updateBookmark, remove: removeBookmark, bulkUpdate: bulkUpdateBookmarks, bulkDelete: bulkDeleteBookmarks } = useFirestore<Bookmark>('bookmarks', loggedInUser.id);
  const { data: categories, add: addCategory, update: updateCategory, remove: removeCategory } = useFirestore<Category>('categories', loggedInUser.id);
  const { data: folders, add: addFolder, update: updateFolder, remove: removeFolder } = useFirestore<Folder>('folders', loggedInUser.id);
  const { data: labels, add: addLabel, remove: removeLabel } = useFirestore<Label>('labels', loggedInUser.id);
  
  const [isSidebarOpenOnMobile, setSidebarOpenOnMobile] = useState(false);

  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>({ type: 'all', id: 'all', name: 'All Bookmarks' });
  
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('edit');
  
  const [itemToDelete, setItemToDelete] = useState<DeletionObject | null>(null);
  const [settingsInitialTab, setSettingsInitialTab] = useState('profile');
  
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<string[]>([]);
  const [isBulkMoveModalOpen, setBulkMoveModalOpen] = useState(false);
  const [isBulkAddLabelsModalOpen, setBulkAddLabelsModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  useEffect(() => {
    if (toastMessage) {
        const timer = setTimeout(() => setToastMessage(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    setSelectedBookmarkIds([]);
  }, [activeFilter, searchTerm]);
  
  const [sortBy, setSortBy] = useState<SortByType>('newest');

  const handleOpenSettings = (tab: string = 'profile') => {
    setSettingsInitialTab(tab);
    setView('settings');
  };

  const frequentlyVisitedBookmarks = useMemo(() => {
    return [...bookmarks]
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 4);
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    const viewFiltered = bookmarks.filter(bookmark => {
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
          const folderIdsInCategory = folders.filter(f => f.categoryId === activeFilter.id).map(f => f.id);
          return folderIdsInCategory.includes(bookmark.folderId);
        }
        case 'folder':
        case 'pinned':
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

  const handleAddBookmarkClick = () => {
    setEditingBookmark(null);
    setModalMode('edit');
    setFormModalOpen(true);
  };

  const handleInfoBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setModalMode('view');
    setFormModalOpen(true);
  };
  
  const handleSaveBookmark = (bookmarkData: Omit<Bookmark, 'id' | 'createdAt' | 'isFavorite' | 'visitCount' | 'lastVisitedAt'>, id?: string) => {
    if (id) {
      updateBookmark(id, bookmarkData);
      setToastMessage('Bookmark updated successfully!');
    } else {
      const newBookmark: Omit<Bookmark, 'id'> = {
        ...bookmarkData,
        createdAt: new Date().toISOString(),
        isFavorite: false,
        visitCount: 0,
      };
      addBookmark(newBookmark);
      setToastMessage('Bookmark created successfully!');
    }
    setFormModalOpen(false);
    setEditingBookmark(null);
  };

  const handleBookmarkVisit = (id: string) => {
    const bookmark = bookmarks.find(b => b.id === id);
    if(bookmark) {
      updateBookmark(id, { visitCount: bookmark.visitCount + 1, lastVisitedAt: new Date().toISOString() });
    }
  };

  const handleArchiveBookmark = async (id: string) => {
    const bookmark = bookmarks.find(b => b.id === id);
    if (!bookmark) return;

    setArchivingId(id);
    setToastMessage(`Archiving \"${bookmark.title}\"...`);
    updateBookmark(id, { archiveFailed: false });

    try {
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(bookmark.url)}`);
      
      if (!response.ok) throw new Error(`Proxy service returned status ${response.status}.`);
      
      const html = await response.text();

      if (!html || html.includes("AllOrigins is down")) throw new Error("The archiving proxy service may be down.");
      if (/<title>.*(403 Forbidden|Access Denied|Just a moment|Login|Sign in|Attention Required).*<\/title>/i.test(html) || /Cloudflare|checking your browser|hCaptcha/i.test(html)) {
        throw new Error("Page is protected by a login, CAPTCHA, or other block.");
      }
      if (html.length < 1000) throw new Error("Archived content was incomplete, which may indicate a block.");
      
      updateBookmark(id, { archivedHtml: html, archiveFailed: false });
      setToastMessage('Page archived successfully!');
    } catch (error) {
      console.error("Failed to archive page:", error);
      updateBookmark(id, { archivedHtml: undefined, archiveFailed: true });
      const errorMessage = error instanceof Error ? error.message : 'The site may have blocked the request.';
      setToastMessage(`Archive failed: ${errorMessage}`);
    } finally {
      setArchivingId(null);
    }
  };
  
  const handleMarkAsUnread = (id: string) => {
    updateBookmark(id, { visitCount: 0 });
  };

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
    if(hasFolders) {
        alert(`Cannot delete \"${name}\". Please delete or move all folders from this category first.`);
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
        alert(`Cannot delete \"${name}\" as it is your only folder.`);
        return;
    }
    setItemToDelete({ type: 'folder', id, name });
  };
  
  const handleAddLabelSubmit = (name: string): Promise<Label> => {
    if (!name.trim()) throw new Error("Label name cannot be empty");
    const existingLabel = labels.find(l => l.name.toLowerCase() === name.trim().toLowerCase());
    if (existingLabel) return Promise.resolve(existingLabel);

    const newLabel = { name: name.trim() };
    return addLabel(newLabel).then(id => ({ id: id!, ...newLabel }));
  };

  const handleDeleteLabel = (id: string, name: string) => {
    setItemToDelete({ type: 'label', id, name });
  };
  
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    
    if (type === 'category' && typeof id === 'string') {
        removeCategory(id);
    } else if (type === 'folder' && typeof id === 'string') {
        const fallbackFolderId = folders.find(f => f.id !== id)?.id;
        if (fallbackFolderId) {
            bookmarks.forEach(b => {
                if(b.folderId === id) {
                    updateBookmark(b.id, { folderId: fallbackFolderId })
                }
            })
        }
        removeFolder(id);
    } else if (type === 'label' && typeof id === 'string') {
        bookmarks.forEach(b => {
            if (b.labels.includes(id)) {
                updateBookmark(b.id, { labels: b.labels.filter(lId => lId !== id) })
            }
        });
        removeLabel(id);
    } else if (type === 'bookmark-bulk' && Array.isArray(id)) {
        bulkDeleteBookmarks(id);
        setSelectedBookmarkIds([]);
    }

    setItemToDelete(null);
  };

  const handleToggleFavorite = (id: string) => {
    const bookmark = bookmarks.find(b => b.id === id);
    if(bookmark) {
      updateBookmark(id, { isFavorite: !bookmark.isFavorite });
    }
  };
  
  const handleTogglePin = (id: string) => {
    const folder = folders.find(f => f.id === id);
    if (folder) {
      updateFolder(id, { isPinned: !folder.isPinned });
    }
  };

  const handleSetActiveFilter = (filter: ActiveFilter) => {
    setActiveFilter(filter);
    setView('dashboard');
    if (window.innerWidth < 768) {
        setSidebarOpenOnMobile(false);
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
    bulkUpdateBookmarks(selectedBookmarkIds, { folderId });
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
  }

  const handleShareFolder = (folderId: string, folderName: string) => {
    const folderBookmarks = bookmarks.filter(b => b.folderId === folderId);
    if (folderBookmarks.length === 0) {
      setToastMessage("This folder is empty.");
      return;
    }
    const textToCopy = `Bookmarks from \"${folderName}\":\\n\\n` + folderBookmarks.map(b => `${b.title}\\n${b.url}`).join('\\n\\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setToastMessage("Folder content copied to clipboard!");
    }).catch(err => {
      setToastMessage("Failed to copy to clipboard.");
      console.error('Failed to copy text: ', err);
    });
  };

  const readingListCategoryId = 'reading';
  const activeFolder = folders.find(f => f.id === activeFilter.id);
  const isReadingListView = (activeFilter.type === 'category' && activeFilter.id === readingListCategoryId) || 
                            ((activeFilter.type === 'folder' || activeFilter.type === 'pinned') && !!activeFolder && activeFolder.categoryId === readingListCategoryId);

  const isAnyModalOpen = isFormModalOpen || !!itemToDelete || isBulkMoveModalOpen || isBulkAddLabelsModalOpen;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      <div className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out ${isSidebarOpenOnMobile ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <Sidebar
          categories={categories}
          folders={folders}
          labels={labels}
          activeFilter={activeFilter}
          setActiveFilter={handleSetActiveFilter}
          onAddCategory={handleAddCategorySubmit}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
          onAddFolder={handleAddFolderSubmit}
          onUpdateFolder={handleUpdateFolder}
          onDeleteFolder={handleDeleteFolder}
          onDeleteLabel={handleDeleteLabel}
          onTogglePin={handleTogglePin}
          onPrivateFolderClick={onPrivateFolderClick}
          onShareFolder={handleShareFolder}
        />
      </div>

      {isSidebarOpenOnMobile && (
          <div 
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setSidebarOpenOnMobile(false)}
          ></div>
      )}

      <main className={`h-screen overflow-y-auto md:ml-72 ${isAnyModalOpen ? 'overflow-hidden' : ''}`}>\n        <div className="sticky top-0 z-20">
          <Header
            user={loggedInUser}
            onOpenSettings={handleOpenSettings}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onLogout={onLogout}
            onAddBookmark={handleAddBookmarkClick}
            onToggleSidebar={() => setSidebarOpenOnMobile(prev => !prev)}
          />
          {view === 'dashboard' ? (
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between bg-[var(--bg-primary)] py-4 px-6 border-b border-[var(--border-primary)]">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{activeFilter.name}</h1>
                <div className="flex items-end space-x-4">
                    <div>
                        <label htmlFor="sort-by" className="block text-xs font-medium text-[var(--text-tertiary)] mb-1">Sort by:</label>
                        <select
                            id="sort-by"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortByType)}
                            className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md text-sm py-1 pl-2 pr-8 focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none appearance-none"
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
          ) : null}
        </div>
        
        {view === 'dashboard' ? (
           <div className="p-6">
              {activeFilter.type === 'all' && frequentlyVisitedBookmarks.length > 0 && (
                 <>
                    <FrequentlyVisited 
                      bookmarks={frequentlyVisitedBookmarks} 
                      onBookmarkVisit={handleBookmarkVisit}
                      onInfo={handleInfoBookmark}
                      onDelete={(id) => removeBookmark(id)}
                      onToggleFavorite={handleToggleFavorite}
                      categories={categories}
                      folders={folders}
                      labels={labels}
                      onShowToast={setToastMessage}
                      onArchive={handleArchiveBookmark}
                      archivingId={archivingId}
                    />
                    <hr className="my-6 border-[var(--border-primary)]" />
                 </>
              )}
            <BookmarkList
              bookmarks={filteredBookmarks}
              layout={layout}
              onInfo={handleInfoBookmark}
              onDelete={(id) => removeBookmark(id)}
              onToggleFavorite={handleToggleFavorite}
              onBookmarkVisit={handleBookmarkVisit}
              categories={categories}
              folders={folders}
              labels={labels}
              isReadingListView={isReadingListView}
              onMarkAsUnread={handleMarkAsUnread}
              selectedBookmarkIds={selectedBookmarkIds}
              onToggleSelect={handleToggleSelectBookmark}
              onShowToast={setToastMessage}
              onArchive={handleArchiveBookmark}
              archivingId={archivingId}
            />
          </div>
        ) : (
           <SettingsPage 
              onClose={() => setView('dashboard')}
              initialTab={settingsInitialTab}
              user={loggedInUser}
              setUser={setUser}
              theme={theme}
              setTheme={setTheme}
              layout={layout}
              setLayout={setLayout}
              font={font}
              setFont={setFont}
              onImportData={(data) => {}}
              onExportData={() => ({bookmarks, categories, folders, labels, user: loggedInUser})}
              onClearData={() => {}}
          />
        )}
      </main>

      <BookmarkFormModal
        isOpen={isFormModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSave={handleSaveBookmark}
        bookmark={editingBookmark}
        categories={categories}
        folders={folders}
        labels={labels}
        onAddLabel={handleAddLabelSubmit}
        mode={modalMode}
      />
      
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ''}
        itemType={itemToDelete?.type === 'bookmark-bulk' ? 'items' : itemToDelete?.type || ''}
      />

      {selectedBookmarkIds.length > 0 && (
        <div className="fixed bottom-0 left-0 md:left-72 right-0 z-30 flex justify-center">
            <BulkActionBar 
                count={selectedBookmarkIds.length}
                onMove={() => setBulkMoveModalOpen(true)}
                onAddLabels={() => setBulkAddLabelsModalOpen(true)}
                onDelete={handleOpenBulkDeleteModal}
                onClear={() => setSelectedBookmarkIds([])}
            />
        </div>
      )}
      <BulkMoveModal 
        isOpen={isBulkMoveModalOpen}
        onClose={() => setBulkMoveModalOpen(false)}
        onMove={handleBulkMove}
        categories={categories}
        folders={folders}
      />
      <BulkAddLabelsModal
        isOpen={isBulkAddLabelsModalOpen}
        onClose={() => setBulkAddLabelsModalOpen(false)}
        onSave={handleBulkAddLabels}
        labels={labels}
        onAddLabel={handleAddLabelSubmit}
      />
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}

export default Dashboard;
