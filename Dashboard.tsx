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
import PasswordPromptModal from './components/PasswordPromptModal';
import { PRIVATE_SETTINGS } from './constants';
import { useBookmarkFiltering } from './hooks/useBookmarkFiltering';
import { useArchiveBookmarks } from './hooks/useArchiveBookmarks';
import { useShareFolder } from './hooks/useShareFolder';
import { useCategoryFolderManagement } from './hooks/useCategoryFolderManagement';
import { useLabelManagement } from './hooks/useLabelManagement';
import { useBookmarkActions } from './hooks/useBookmarkActions';
import { usePrivateBookmarks } from './hooks/usePrivateBookmarks'; // Import the new hook
import DashboardHeader from './components/DashboardHeader';

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
    updateUserName: (newName: string) => Promise<void>;
    droppedUrl: string | null;
    setDroppedUrl: (url: string | null) => void;
    droppedHtmlContent: string | null;
    setDroppedHtmlContent: (html: string | null) => void;
}

function Dashboard({ user: loggedInUser, setUser, theme, setTheme, layout, setLayout, font, setFont, onLogout, onPrivateFolderClick, updateUserName, droppedUrl, setDroppedUrl, droppedHtmlContent, setDroppedHtmlContent }: DashboardProps) {
  const { data: bookmarks, add: addBookmark, update: updateBookmark, remove: removeBookmark, bulkUpdate: bulkUpdateBookmarks, bulkDelete: bulkDeleteBookmarks } = useFirestore<Bookmark>('bookmarks', loggedInUser.id);
  const { data: firestoreCategories, add: addCategory, update: updateCategory, remove: removeCategory } = useFirestore<Category>('categories', loggedInUser.id);
  const { data: folders, add: addFolder, update: updateFolder, remove: removeFolder } = useFirestore<Folder>('folders', loggedInUser.id);
  const { data: labels, add: addLabel, remove: removeLabel } = useFirestore<Label>('labels', loggedInUser.id);
  
  // Ensure Private Collections category is always present and at the end
  const categories = useMemo(() => {
    const privateCategory = firestoreCategories.find(cat => cat.id === PRIVATE_SETTINGS.CATEGORY_ID);
    const otherCategories = firestoreCategories.filter(cat => cat.id !== PRIVATE_SETTINGS.CATEGORY_ID);

    if (privateCategory) {
      return [...otherCategories, privateCategory];
    } else {
      // If private category doesn't exist, add it to the end
      return [...otherCategories, { id: PRIVATE_SETTINGS.CATEGORY_ID, name: PRIVATE_SETTINGS.FOLDER_NAME }];
    }
  }, [firestoreCategories]);

  const [isSidebarOpenOnMobile, setSidebarOpenOnMobile] = useState(false);

  const [view, setView] = useState<'dashboard' | 'settings'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>({ type: 'all', id: 'all', name: 'My bookmarks' });
  
  const [itemToDelete, setItemToDelete] = useState<DeletionObject | null>(null);
  const [settingsInitialTab, setSettingsInitialTab] = useState('profile');
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPasswordPromptOpen, setIsPasswordPromptOpen] = useState(false);
  const [activeMainMenuItem, setActiveMainMenuItem] = useState<'My bookmarks' | 'Collaboration'>('My bookmarks'); // Updated type and initial value


  const { archivingId, handleArchiveBookmark } = useArchiveBookmarks({ updateBookmark, onShowToast: setToastMessage });
  const { handleShareFolder } = useShareFolder({ bookmarks, onShowToast: setToastMessage });
  const { 
    handleAddCategorySubmit,
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddFolderSubmit,
    handleUpdateFolder,
    handleDeleteFolder,
  } = useCategoryFolderManagement({ 
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
  });
  const { handleAddLabelSubmit, handleDeleteLabel } = useLabelManagement({
    labels,
    bookmarks,
    addLabel,
    removeLabel,
    updateBookmark,
    setItemToDelete,
  });

  const [sortBy, setSortBy] = useState<SortByType>('newest');
  const filteredBookmarks = useBookmarkFiltering(bookmarks, folders, activeFilter, searchTerm, sortBy);

  const {
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
  } = useBookmarkActions({
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
  });

  // New private bookmarks hook
  const {
    privateBookmarks,
    selectedPrivateBookmarkIds,
    setSelectedPrivateBookmarkIds,
    handleToggleSelectPrivateBookmark,
    handleSelectAllPrivateBookmarks,
    handleRemovePrivateBookmark,
    handleBulkDeletePrivateBookmarks,
    handleBulkMovePrivate,
    handleBulkAddLabelsPrivate,
  } = usePrivateBookmarks({
    userId: loggedInUser.id,
    bookmarks,
    updateBookmark,
    removeBookmark,
    bulkUpdateBookmarks,
    bulkDeleteBookmarks,
    setToastMessage,
    labels,
    setBulkMoveModalOpen, // Pass setBulkMoveModalOpen
    setBulkAddLabelsModalOpen, // Pass setBulkAddLabelsModalOpen
  });

  // Determine if the current view is a private collection
  const isPrivateCollectionView = activeFilter.id === PRIVATE_SETTINGS.CATEGORY_ID && activeFilter.type === 'category';

  // Conditional filtered bookmarks and selection handlers
  const currentFilteredBookmarks = isPrivateCollectionView ? privateBookmarks : filteredBookmarks;
  const currentSelectedBookmarkIds = isPrivateCollectionView ? selectedPrivateBookmarkIds : selectedBookmarkIds;
  const handleCurrentToggleSelectBookmark = isPrivateCollectionView ? handleToggleSelectPrivateBookmark : handleToggleSelectBookmark;
  const handleCurrentSelectAll = isPrivateCollectionView ? handleSelectAllPrivateBookmarks : handleSelectAll;

  const handleCurrentBulkMoveWrapper = (categoryId: string, folderId: string | null) => {
    if (isPrivateCollectionView) {
      handleBulkMovePrivate(categoryId, folderId);
    } else {
      // Pass both categoryId and folderId explicitly
      handleBulkMove(categoryId, folderId);
    }
  };

  const handleCurrentBulkAddLabels = isPrivateCollectionView ? handleBulkAddLabelsPrivate : handleBulkAddLabels;

  // Handle dropped URL or HTML content
  useEffect(() => {
    if (droppedUrl) {
      handleAddBookmarkClick(droppedUrl); 
      setDroppedUrl(null); 
    } else if (droppedHtmlContent) {
      handleAddBookmarkClick(undefined, droppedHtmlContent); // Pass html content
      setDroppedHtmlContent(null); // Clear html content after processing
    }
  }, [droppedUrl, setDroppedUrl, droppedHtmlContent, setDroppedHtmlContent, handleAddBookmarkClick]);

  useEffect(() => {
    if (toastMessage) {
        const timer = setTimeout(() => setToastMessage(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    // Clear selection when filter changes, but only for non-private collections
    // Private collection selection is managed by its own state
    if (!isPrivateCollectionView) {
      setSelectedBookmarkIds([]);
    }
  }, [activeFilter, searchTerm, isPrivateCollectionView, setSelectedBookmarkIds]);
  
  const handleOpenSettings = (tab: string = 'profile') => {
    setSettingsInitialTab(tab);
    setView('settings');
  };

  const handlePrivateFolderClickWithPassword = () => {
    setIsPasswordPromptOpen(true);
  };

  const handlePasswordSuccess = () => {
    setIsPasswordPromptOpen(false);
    setActiveFilter({ type: 'category', id: PRIVATE_SETTINGS.CATEGORY_ID, name: 'Private Bookmarks' });
  };

  const frequentlyVisitedBookmarks = useMemo(() => {
    // Filter out private bookmarks from the frequently visited list.
    return [...bookmarks.filter(b => !b.isPrivate)]
      .sort((a, b) => b.visitCount - a.visitCount)
      .slice(0, 4);
  }, [bookmarks]);

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    
    if (type === 'category' && typeof id === 'string') {
        removeCategory(id);
        // Also clear categoryId from any bookmarks directly assigned to this category
        bookmarks.forEach(b => {
            if (b.categoryId === id) {
                updateBookmark(b.id, { categoryId: null });
            }
        });
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
        // Use private bulk delete if in private view, otherwise use general bulk delete
        if (isPrivateCollectionView) {
            handleBulkDeletePrivateBookmarks();
        } else {
            bulkDeleteBookmarks(id);
            setSelectedBookmarkIds([]);
        }
    }

    setItemToDelete(null);
  };

  
  const handleSetActiveFilter = (filter: ActiveFilter) => {
    setActiveFilter(filter);
    setView('dashboard');
    if (window.innerWidth < 768) {
        setSidebarOpenOnMobile(false);
    }
  };

  const handleTogglePinFolder = (id: string, name: string, isPinned: boolean) => {
    updateFolder(id, { isPinned: !isPinned });
    setToastMessage(`${name} ${isPinned ? 'unpinned from' : 'pinned to'} sidebar.`);
  };

  const readingListCategoryId = 'reading';
  const activeFolder = folders.find(f => f.id === activeFilter.id);
  const isReadingListView = (activeFilter.type === 'category' && activeFilter.id === readingListCategoryId) || 
                               ((activeFilter.type === 'folder') && !!activeFolder && activeFolder.categoryId === readingListCategoryId);

  const isAnyModalOpen = isFormModalOpen || !!itemToDelete || isBulkMoveModalOpen || isBulkAddLabelsModalOpen || isPasswordPromptOpen;

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
          onPrivateFolderClick={handlePrivateFolderClickWithPassword}
          onShareFolder={handleShareFolder}
          onTogglePinFolder={handleTogglePinFolder}
          onCloseSidebar={() => setSidebarOpenOnMobile(false)}
          onSelectMainMenuItem={setActiveMainMenuItem}  // Added missing prop
          activeMainMenuItem={activeMainMenuItem}      // Added missing prop
        />
      </div>

      {isSidebarOpenOnMobile && (
          <div 
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setSidebarOpenOnMobile(false)}
          ></div>
      )}

      <main className={`h-screen overflow-y-auto md:ml-72 ${isAnyModalOpen ? 'overflow-hidden' : ''}`}>
        <div className="sticky top-0 z-20">
          <Header
            user={loggedInUser}
            onOpenSettings={handleOpenSettings}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onLogout={onLogout}
            onAddBookmark={handleAddBookmarkClick}
            onToggleSidebar={() => setSidebarOpenOnMobile(prev => !prev)}
            onSelectMainMenuItem={setActiveMainMenuItem}
            activeMainMenuItem={activeMainMenuItem}
          />
          {view === 'dashboard' ? (
            <DashboardHeader
              activeFilter={activeFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              filteredBookmarks={currentFilteredBookmarks} // Use conditional bookmarks
              selectedBookmarkIds={currentSelectedBookmarkIds} // Use conditional selected IDs
              handleSelectAll={handleCurrentSelectAll} // Use conditional select all handler
            />
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
                     onArchive={(id) => handleArchiveBookmark(bookmarks.find(b => b.id === id)!)}
                     archivingId={archivingId}
                   />
                   <hr className="my-6 border-[var(--border-primary)]" />
                 </>
             )}
            <BookmarkList
              bookmarks={currentFilteredBookmarks} // Use conditional bookmarks
              layout={layout}
              onInfo={handleInfoBookmark}
              onDelete={(id) => {
                  if (isPrivateCollectionView) {
                      handleRemovePrivateBookmark(id);
                  } else {
                      removeBookmark(id);
                  }
              }}
              onToggleFavorite={handleToggleFavorite}
              onBookmarkVisit={handleBookmarkVisit}
              categories={categories}
              folders={folders}
              labels={labels}
              isReadingListView={isReadingListView}
              onMarkAsUnread={handleMarkAsUnread}
              selectedBookmarkIds={currentSelectedBookmarkIds} // Use conditional selected IDs
              onToggleSelect={handleCurrentToggleSelectBookmark} // Use conditional toggle select handler
              onShowToast={setToastMessage}
              onArchive={(id) => handleArchiveBookmark(bookmarks.find(b => b.id === id)!)}
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
             updateUserName={updateUserName}
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
        initialFolderId={initialBookmarkFolderId}
        initialCategoryId={initialBookmarkCategoryId}
        initialUrl={droppedUrl} 
        initialHtmlContent={droppedHtmlContent} // Pass droppedHtmlContent here
      />
      
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.name || ''}
        itemType={itemToDelete?.type === 'bookmark-bulk' ? 'items' : itemToDelete?.type || ''}
      />

      {currentSelectedBookmarkIds.length > 0 && (
        <div className="fixed bottom-0 left-0 md:left-72 right-0 z-30 flex justify-center">
            <BulkActionBar 
                count={currentSelectedBookmarkIds.length}
                onMove={() => setBulkMoveModalOpen(true)}
                onAddLabels={() => setBulkAddLabelsModalOpen(true)}
                onDelete={() => {
                    if (isPrivateCollectionView) {
                        handleBulkDeletePrivateBookmarks();
                    } else {
                        handleOpenBulkDeleteModal();
                    }
                }}
                onClear={() => {
                    if (isPrivateCollectionView) {
                        setSelectedPrivateBookmarkIds([]);
                    } else {
                        setSelectedBookmarkIds([]);
                    }
                }}
            />
        </div>
      )}
      <BulkMoveModal 
        isOpen={isBulkMoveModalOpen}
        onClose={() => setBulkMoveModalOpen(false)}
        onMove={(categoryId, folderId) => {
            handleCurrentBulkMoveWrapper(categoryId, folderId);
        }}
        categories={categories}
        folders={folders}
      />
      <BulkAddLabelsModal
        isOpen={isBulkAddLabelsModalOpen}
        onClose={() => setBulkAddLabelsModalOpen(false)}
        onSave={(labelIds) => {
            if (isPrivateCollectionView) {
                handleCurrentBulkAddLabels(labelIds);
            } else {
                handleBulkAddLabels(labelIds);
            }
        }}
        labels={labels}
        onAddLabel={handleAddLabelSubmit}
      />
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

      {isPasswordPromptOpen && (
        <PasswordPromptModal
          onClose={() => setIsPasswordPromptOpen(false)}
          onSuccess={handlePasswordSuccess}
        />
      )}
    </div>
  );
}

export default Dashboard;
