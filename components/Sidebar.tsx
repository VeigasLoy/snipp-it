import React, { useState, useRef, useEffect } from 'react';
import { Category, Folder, Label, ActiveFilter } from '../types';
import { ICONS, PRIVATE_SETTINGS } from '../constants';

interface SidebarProps {
  categories: Category[];
  folders: Folder[];
  labels: Label[];
  activeFilter: ActiveFilter;
  setActiveFilter: (filter: ActiveFilter) => void;
  onAddCategory: (name: string) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string, name: string) => void;
  onAddFolder: (name: string, categoryId: string) => void;
  onUpdateFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string, name: string) => void;
  onDeleteLabel: (id: string, name: string) => void;
  onPrivateFolderClick: () => void;
  onShareFolder: (id: string, name: string) => void;
  onTogglePinFolder: (id: string, name: string, isPinned: boolean) => void;
  onCloseSidebar: () => void;
  onSelectMainMenuItem: (item: 'My bookmarks' | 'Collaboration' | 'Private collections') => void;
  activeMainMenuItem: 'My bookmarks' | 'Collaboration' | 'Private collections';
}

// FIX: Refactored EditableItemWrapper to be a React.FC to resolve a TypeScript type inference issue with the 'children' prop.
const EditableItemWrapper: React.FC<{children: React.ReactNode, onEdit?: () => void, onDelete?: () => void, onShare?: () => void, onPin?: () => void, isPinned?: boolean}> = ({ children, onEdit, onDelete, onShare, onPin, isPinned }) => (
  <div className="group flex items-center w-full">
      {children}
      <div className="flex-shrink-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onShare && <button onClick={onShare} className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"><span className="sr-only">Share</span>{React.cloneElement(ICONS.share, {className:"w-3.5 h-3.5"})}</button>}
          {onPin && (
            <button onClick={onPin} className={`p-1 ${isPinned ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}>
              <span className="sr-only">{isPinned ? 'Unpin' : 'Pin'}</span>{React.cloneElement(ICONS.pin, {className:"w-3.5 h-3.5"})}</button>
          )}
          {onEdit && <button onClick={onEdit} className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"><span className="sr-only">Edit</span>{React.cloneElement(ICONS.edit, {className:"w-3.5 h-3.5"})}</button>}
          {onDelete && <button onClick={onDelete} className="p-1 text-[var(--text-tertiary)] hover:text-red-500"><span className="sr-only">Delete</span>{React.cloneElement(ICONS.delete, {className:"w-3.5 h-3.5"})}</button>}
      </div>
  </div>
);

const SidebarItem: React.FC<{
  onClick: () => void,
  isActive: boolean,
  children: React.ReactNode,
  className?: string,
  icon?: React.ReactElement,
}> = ({ onClick, isActive, children, className, icon }) => (
  <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }}
    className={`flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors ${className} ${
      isActive ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
    }`}
  >
    {icon && <span className="w-6 mr-3 flex-shrink-0 flex items-center justify-center text-[var(--text-tertiary)]">{icon}</span>}
    {children}
  </a>
);

const Sidebar: React.FC<SidebarProps> = ({
    categories, folders, labels, activeFilter, setActiveFilter,
    onAddCategory, onUpdateCategory, onDeleteCategory,
    onAddFolder, onUpdateFolder, onDeleteFolder,
    onDeleteLabel,
    onPrivateFolderClick,
    onShareFolder,
    onTogglePinFolder,
    onCloseSidebar,
    onSelectMainMenuItem,
    activeMainMenuItem,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(categories.map(c => c.id));
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingFolderTo, setAddingFolderTo] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [mainDropdownOpen, setMainDropdownOpen] = useState(false);

  const [editingItem, setEditingItem] = useState<{type: 'category' | 'folder', id: string, name: string} | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const mainDropdownRef = useRef<HTMLDivElement>(null);
  const hasSelectedOnFocus = useRef(false);

  useEffect(() => {
    if (editingItem && editInputRef.current && !hasSelectedOnFocus.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
      hasSelectedOnFocus.current = true;
    } else if (!editingItem) {
      hasSelectedOnFocus.current = false;
    }
  }, [editingItem]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mainDropdownRef.current && !mainDropdownRef.current.contains(event.target as Node)) {
        setMainDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mainDropdownRef]);

  const handleLabelClick = (labelId: string) => {
      const currentFilter = activeFilter;
      let newIds: string[] = [];

      if (currentFilter.type === 'label' && Array.isArray(currentFilter.id)) {
          newIds = currentFilter.id.includes(labelId)
              ? currentFilter.id.filter(id => id !== labelId)
              : [...currentFilter.id, labelId];
      } else {
          newIds = [labelId];
      }

      if (newIds.length === 0) {
          setActiveFilter({ type: 'all', id: 'all', name: 'My bookmarks' });
      } else {
          const newNames = labels.filter(l => newIds.includes(l.id)).map(l => `#${l.name}`).join(', ');
          setActiveFilter({ type: 'label', id: newIds, name: newNames });
      }
  };

  const handleToggleCategory = (catId: string) => {
    setExpandedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCategory(newCategoryName);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleSaveFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (addingFolderTo) {
      onAddFolder(newFolderName, addingFolderTo);
    }
    setNewFolderName('');
    setAddingFolderTo(null);
  };

  const handleStartEdit = (type: 'category' | 'folder', item: Category | Folder) => {
    setEditingItem({ type, id: item.id, name: item.name });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleSaveEdit = () => {
    if (!editingItem || !editingItem.name.trim()) {
      handleCancelEdit();
      return;
    }
    if (editingItem.type === 'category') {
      onUpdateCategory(editingItem.id, editingItem.name);
    } else {
      onUpdateFolder(editingItem.id, editingItem.name);
    }
    setEditingItem(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') handleCancelEdit();
  };

  const handleMainDropdownClick = (option: 'My bookmarks' | 'Collaboration' | 'Private collections') => {
    onSelectMainMenuItem(option);
    setMainDropdownOpen(false);
  };

  const MISC_CATEGORY_ID = 'misc';

  const pinnedFolders = folders.filter(f => f.isPinned);

  return (
    <aside className="w-72 h-screen flex flex-col p-4 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)]">
      <div className="flex-grow overflow-y-auto -mr-2 pr-2">
        <div className="flex items-center mb-6 flex-shrink-0">
          <div className="flex items-center gap-2 relative" ref={mainDropdownRef}>
              {/* Updated to display activeMainMenuItem */}
              <span className="text-xl font-semibold">{activeMainMenuItem}</span>
              <button
                  onClick={() => setMainDropdownOpen(prev => !prev)}
                  className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  aria-label="Open main menu"
              >
                  {ICONS.chevronDown}
              </button>
              {mainDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-48 bg-[var(--bg-primary)] rounded-md shadow-lg py-1 z-20 border border-[var(--border-primary)] ring-1 ring-black ring-opacity-5">
                      <a href="#" onClick={(e) => { e.preventDefault(); handleMainDropdownClick('My bookmarks'); }} className={`block px-4 py-2 text-sm ${activeMainMenuItem === 'My bookmarks' ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'} transition-colors`}>
                          My bookmarks
                      </a>
                      <a href="#" onClick={(e) => { e.preventDefault(); handleMainDropdownClick('Collaboration'); }} className={`block px-4 py-2 text-sm ${activeMainMenuItem === 'Collaboration' ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'} transition-colors`}>
                          Collaboration
                      </a>
                      <a href="#" onClick={(e) => { e.preventDefault(); handleMainDropdownClick('Private collections'); }} className={`block px-4 py-2 text-sm ${activeMainMenuItem === 'Private collections' ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'} transition-colors`}>
                          Private collections
                      </a>
                  </div>
              )}
          </div>
        </div>

        <nav className="flex-1 space-y-4">
          <div className="space-y-1">
            <SidebarItem onClick={() => setActiveFilter({ type: 'all', id: 'all', name: 'My bookmarks' })} isActive={activeFilter.type === 'all'}>
              <span className="mr-3">{ICONS.grid}</span> My bookmarks
            </SidebarItem>
            <SidebarItem onClick={() => setActiveFilter({ type: 'favorites', id: 'favorites', name: 'Favorites' })} isActive={activeFilter.type === 'favorites'}>
              <span className="mr-3 text-yellow-500">{ICONS.star}</span> Favorites
            </SidebarItem>
            <SidebarItem onClick={() => setActiveFilter({ type: 'archived', id: 'archived', name: 'Archived' })} isActive={activeFilter.type === 'archived'}>
              <span className="mr-3">{React.cloneElement(ICONS.archive, { className: "w-5 h-5"})}</span> Archived
            </SidebarItem>
            <SidebarItem onClick={() => setActiveFilter({ type: 'abandoned', id: 'abandoned', name: 'Abandoned' })} isActive={activeFilter.type === 'abandoned'}>
              <span className="mr-3">{ICONS.brokenLink}</span> Abandoned
            </SidebarItem>
          </div>

          {/* Pinned Folders Section */}
          {pinnedFolders.length > 0 && (
            <div>
              <h2 className="px-2 mb-2 text-xs font-semibold tracking-wider text-[var(--text-tertiary)] uppercase">Pinned</h2>
              <div className="space-y-1">
                {pinnedFolders.map(folder => (
                  <div key={folder.id}>
                    <EditableItemWrapper
                      onEdit={() => handleStartEdit('folder', folder)}
                      onDelete={() => onDeleteFolder(folder.id, folder.name)}
                      onShare={() => onShareFolder(folder.id, folder.name)}
                      onPin={() => onTogglePinFolder(folder.id, folder.name, folder.isPinned)}
                      isPinned={folder.isPinned}
                    >
                      {editingItem?.type === 'folder' && editingItem.id === folder.id ? (
                          <>
                              <span className="w-6 mr-3 flex items-center justify-center">{React.cloneElement(ICONS.pin, {className:"w-4 h-4"})}</span>
                              <input type="text" ref={editInputRef} value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} onBlur={handleSaveEdit} onKeyDown={handleEditKeyDown} className="w-full text-sm mr-2 px-2 py-1.5 bg-transparent dark:bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"/>
                          </>
                      ) : (
                          <SidebarItem onClick={() => setActiveFilter({type: 'folder', id: folder.id, name: folder.name})} isActive={activeFilter.type === 'folder' && activeFilter.id === folder.id} className="flex-1" icon={React.cloneElement(ICONS.pin, {className:"w-4 h-4"})}>
                              {folder.name}
                          </SidebarItem>
                      )}
                    </EditableItemWrapper>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
              <div className="flex items-center justify-between px-2 mb-2">
                  <h2 className="text-xs font-semibold tracking-wider text-[var(--text-tertiary)] uppercase">Categories</h2>
                  <button onClick={() => setIsAddingCategory(c => !c)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">{ICONS.add}</button>
              </div>
              {isAddingCategory && (
                  <form onSubmit={handleSaveCategory} className="px-2 pb-2">
                      <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="New Category Name" autoFocus className="w-full text-sm px-2 py-1 bg-transparent dark:bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"/>
                  </form>
              )}
              <div className="space-y-1">
                  {categories.map(cat => (
                      <div key={cat.id}>
                          {cat.id === PRIVATE_SETTINGS.CATEGORY_ID ? (
                              <SidebarItem onClick={onPrivateFolderClick} isActive={activeFilter.type === 'category' && activeFilter.id === cat.id} icon={ICONS.lockClosed}>
                                {cat.name}
                              </SidebarItem>
                          ) : (
                            <EditableItemWrapper onEdit={() => handleStartEdit('category', cat)} onDelete={() => onDeleteCategory(cat.id, cat.name)}>
                              <>
                                <button onClick={() => handleToggleCategory(cat.id)} className="flex-shrink-0 p-1 text-[var(--text-tertiary)]">
                                    {expandedCategories.includes(cat.id) ? React.cloneElement(ICONS.chevronDown, {className:"w-4 h-4"}) : React.cloneElement(ICONS.chevronRight, {className:"w-4 h-4"})}</button>
                                {editingItem?.type === 'category' && editingItem.id === cat.id ? (
                                  <input type="text" ref={editInputRef} value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} onBlur={handleSaveEdit} onKeyDown={handleEditKeyDown} className="w-full text-sm mr-2 px-2 py-1.5 bg-transparent dark:bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"/>
                                ) : (
                                  <SidebarItem onClick={() => { setActiveFilter({type: 'category', id: cat.id, name: cat.name}); handleToggleCategory(cat.id); }} isActive={activeFilter.type==='category' && activeFilter.id === cat.id} className="flex-1" icon={ICONS.folder}>
                                      {cat.name}
                                  </SidebarItem>
                                )}
                                {cat.id !== MISC_CATEGORY_ID && (
                                  <button onClick={() => { setAddingFolderTo(cat.id); handleToggleCategory(cat.id); }} className="p-1 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100"><span className="sr-only">Add folder to {cat.name}</span>{ICONS.add}</button>
                                )}
                              </>
                            </EditableItemWrapper>
                          )}
                          
                          {expandedCategories.includes(cat.id) && (
                              <div className="pl-6 space-y-1 mt-1">
                                  {addingFolderTo === cat.id && (
                                      <form onSubmit={handleSaveFolder} className="px-2 pb-2">
                                          <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="New Folder" autoFocus className="w-full text-sm px-2 py-1 bg-transparent dark:bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"/>
                                      </form>
                                  )}
                                  {folders.filter(f => f.categoryId === cat.id).map(folder => (
                                      <div key={folder.id}>
                                          {folder.categoryId === PRIVATE_SETTINGS.CATEGORY_ID ? (
                                              <SidebarItem onClick={onPrivateFolderClick} isActive={activeFilter.type === 'folder' && activeFilter.id === folder.id} icon={ICONS.lockClosed}>
                                                  {folder.name}
                                              </SidebarItem>
                                          ) : (
                                          <EditableItemWrapper
                                            onEdit={() => handleStartEdit('folder', folder)}
                                            onDelete={() => onDeleteFolder(folder.id, folder.name)}
                                            onShare={() => onShareFolder(folder.id, folder.name)}
                                            onPin={() => onTogglePinFolder(folder.id, folder.name, folder.isPinned)}
                                            isPinned={folder.isPinned}
                                          >
                                              <>
                                                {editingItem?.type === 'folder' && editingItem.id === folder.id ? (
                                                    <input type="text" ref={editInputRef} value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} onBlur={handleSaveEdit} onKeyDown={handleEditKeyDown} className="w-full text-sm mr-2 px-2 py-1.5 bg-transparent dark:bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"/>
                                                ) : (
                                                    <SidebarItem onClick={() => setActiveFilter({type: 'folder', id: folder.id, name: folder.name})} isActive={activeFilter.type === 'folder' && activeFilter.id === folder.id} className="flex-1">
                                                        {folder.name}
                                                    </SidebarItem>
                                                )}
                                              </>
                                          </EditableItemWrapper>
                                          )}
                                      </div>
                                    )
                                  )}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>

          <div>
            <h2 className="px-2 mb-2 text-xs font-semibold tracking-wider text-[var(--text-tertiary)] uppercase">Labels</h2>
            <div className="flex flex-wrap gap-2 px-2">
              {labels.map(label => {
                const isActive = activeFilter.type === 'label' && Array.isArray(activeFilter.id) && activeFilter.id.includes(label.id);
                return (
                  <div key={label.id} className="group relative">
                    <button onClick={() => handleLabelClick(label.id)}
                      className={`pl-2.5 pr-2.5 py-1 text-xs rounded-full border transition-colors ${
                          isActive ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]' : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--text-primary)]'
                      }`}
                    >
                        #{label.name}
                    </button>
                    <button onClick={() => onDeleteLabel(label.id, label.name)} className="absolute -top-1 -right-1 p-0.5 bg-[var(--bg-tertiary)] rounded-full text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;