import React from 'react';
import { Bookmark, Category, Label, Layout, Folder } from '../types';
import { ICONS, PRIVATE_SETTINGS } from '../constants';

interface BookmarkItemProps {
  bookmark: Bookmark;
  layout: Layout;
  onInfo: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onBookmarkVisit: (id: string) => void;
  category?: Category;
  folder?: Folder;
  labels: Label[];
  isReadingListItem?: boolean;
  onMarkAsUnread?: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onShowToast: (message: string) => void;
  onArchive: (id: string) => void;
  archivingId: string | null;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ bookmark, layout, onInfo, onDelete, onToggleFavorite, onBookmarkVisit, category, folder, labels, isReadingListItem, onMarkAsUnread, isSelected = false, onToggleSelect, onShowToast, onArchive, archivingId }) => {
  const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${bookmark.url}`;
  
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isSelected && onToggleSelect) {
      e.preventDefault();
      onToggleSelect(bookmark.id);
    } else {
      onBookmarkVisit(bookmark.id);
    }
  }

  const handleViewArchive = () => {
    if (bookmark.archivedHtml) {
      const blob = new Blob([bookmark.archivedHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  };
  
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(bookmark.url).then(() => {
        onShowToast('URL copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy URL: ', err);
        onShowToast('Failed to copy URL.');
    });
  };

  const isPrivateCollectionItem = bookmark.folderId === PRIVATE_SETTINGS.FOLDER_ID;
  const isArchiving = archivingId === bookmark.id;

  const ArchiveButton = () => {
    if (isArchiving) {
      return (
        <div className="p-1.5 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] flex items-center justify-center" title="Archiving...">
          {ICONS.spinner}
        </div>
      );
    }
    if (bookmark.archiveFailed) {
      return (
        <button onClick={() => onArchive(bookmark.id)} className="p-1.5 bg-red-500/10 rounded-md text-red-500 hover:bg-red-500/20 transition-colors" title="Archiving failed. Click to retry.">
          <span className="sr-only">Retry archiving page</span>{ICONS.warning}
        </button>
      );
    }
    if (bookmark.archivedHtml) {
      return (
        <button onClick={handleViewArchive} className="p-1.5 bg-green-500/10 rounded-md text-green-600 hover:bg-green-500/20 transition-colors" title="View archived page">
          <span className="sr-only">View Archive</span>{ICONS.archive}
        </button>
      );
    }
    return (
      <button onClick={() => onArchive(bookmark.id)} className="p-1.5 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors" title="Archive this page">
        <span className="sr-only">Archive page</span>{ICONS.archive}
      </button>
    );
  };
  
  const ActionButtons = () => (
    <>
      <ArchiveButton />
      {isReadingListItem && bookmark.visitCount > 0 && onMarkAsUnread && (
        <button onClick={() => onMarkAsUnread(bookmark.id)} className="p-1.5 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors" title="Mark as unread"><span className="sr-only">Mark as unread</span>{ICONS.markUnread}</button>
      )}
      {!isPrivateCollectionItem && (
         <button onClick={() => onToggleFavorite(bookmark.id)} className={`p-1.5 bg-[var(--bg-tertiary)] rounded-md transition-colors ${bookmark.isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-[var(--text-secondary)] hover:text-yellow-400'}`}><span className="sr-only">Favorite</span>{ICONS.star}</button>
      )}
       <button onClick={handleCopyUrl} className="p-1.5 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors" title="Copy URL">
          <span className="sr-only">Copy URL</span>{ICONS.copy}
      </button>
      <button onClick={() => onInfo(bookmark)} className="p-1.5 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"><span className="sr-only">Info</span>{ICONS.info}</button>
      <button onClick={() => onDelete(bookmark.id)} className="p-1.5 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-red-500 transition-colors"><span className="sr-only">Delete</span>{ICONS.delete}</button>
    </>
  );

  const selectionClasses = isSelected ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-primary)] ring-[var(--accent-primary)]' : '';
  const selectionWrapperClasses = isSelected ? 'bg-[var(--accent-primary)]/5' : ''

  if (layout === Layout.CARD) {
    const imageSrc = bookmark.imageUrl || `https://s.wordpress.com/mshots/v1/${encodeURIComponent(bookmark.url)}?w=400&h=300`;
    return (
      <div className={`group aspect-[4/3] relative rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${selectionClasses} ${selectionWrapperClasses}`}>
        {onToggleSelect && !isPrivateCollectionItem && (
            <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={isSelected ? {opacity: 1} : {}}>
              <input 
                  type="checkbox" 
                  checked={isSelected} 
                  onChange={() => onToggleSelect(bookmark.id)}
                  className="h-5 w-5 rounded border-[var(--border-primary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] bg-[var(--bg-secondary)]"
                  onClick={(e) => e.stopPropagation()}
              />
            </div>
        )}
        <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full" onClick={handleLinkClick}>
          <img src={imageSrc} alt={bookmark.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <h3 className="absolute bottom-0 left-0 p-3 text-white font-bold leading-tight drop-shadow-md">{bookmark.title}</h3>
        </a>
         <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
           <ActionButtons/>
        </div>
      </div>
    );
  }


  if (layout === Layout.GRID) {
    const imageSrc = bookmark.imageUrl || `https://s.wordpress.com/mshots/v1/${encodeURIComponent(bookmark.url)}?w=400&h=200`;
    return (
      <div className={`group relative flex flex-col bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:border-[var(--accent-primary)] transition-all duration-300 transform hover:-translate-y-1 ${selectionClasses} ${selectionWrapperClasses}`}>
        {onToggleSelect && !isPrivateCollectionItem && (
            <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity" style={isSelected ? {opacity: 1} : {}}>
              <input 
                  type="checkbox" 
                  checked={isSelected} 
                  onChange={() => onToggleSelect(bookmark.id)}
                  className="h-5 w-5 rounded border-[var(--border-primary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] bg-[var(--bg-secondary)]"
                  onClick={(e) => e.stopPropagation()}
              />
            </div>
        )}
        <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="block" onClick={handleLinkClick}>
          <img
            src={imageSrc}
            alt={bookmark.title}
            className="w-full h-32 object-cover"
          />
        </a>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex items-start mb-2">
            <img src={faviconUrl} alt="favicon" className="w-5 h-5 mr-2 mt-0.5 rounded-sm" />
            <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={handleLinkClick}>
              <h3 className="font-semibold text-[var(--text-primary)] leading-tight truncate hover:text-[var(--accent-primary)] transition-colors">{bookmark.title}</h3>
            </a>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-3 flex-grow">{bookmark.description}</p>
          <div className="text-xs text-[var(--text-tertiary)] mb-3">
              {category?.name} / {folder?.name}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {labels.map(label => (
                <span key={label.id} className="text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full">{label.name}</span>
            ))}
          </div>
        </div>
        <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionButtons />
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex items-center p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-tertiary)] hover:border-[var(--accent-primary)]/50 transition-all duration-200 ${selectionClasses} ${selectionWrapperClasses}`}>
      {onToggleSelect && !isPrivateCollectionItem && (
          <div className="mr-3 flex-shrink-0">
            <input 
                type="checkbox" 
                checked={isSelected} 
                onChange={() => onToggleSelect(bookmark.id)}
                className="h-5 w-5 rounded border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                onClick={(e) => e.stopPropagation()}
            />
          </div>
      )}
      <img src={faviconUrl} alt="favicon" className="w-6 h-6 mr-4 rounded-sm flex-shrink-0" />
      <div className="flex-1 truncate">
        <a href={bookmark.url} target="_blank" rel="noopener noreferrer" onClick={handleLinkClick}>
          <h3 className="font-medium text-[var(--text-primary)] truncate hover:text-[var(--accent-primary)] transition-colors">{bookmark.title}</h3>
          <p className="text-sm text-[var(--text-tertiary)] truncate">{bookmark.url}</p>
        </a>
      </div>
       <div className="flex flex-wrap gap-1.5 mx-4">
            {labels.map(label => (
                <span key={label.id} className="text-xs bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full">{label.name}</span>
            ))}
        </div>
      <div className="flex items-center space-x-2 ml-auto pl-4">
        {!isPrivateCollectionItem && (
            <button onClick={() => onToggleFavorite(bookmark.id)} className={`p-1.5 rounded-md transition-colors ${bookmark.isFavorite ? 'text-yellow-400 hover:text-yellow-500' : 'text-[var(--text-tertiary)]/50 group-hover:text-yellow-400/80'}`}><span className="sr-only">Favorite</span>{ICONS.star}</button>
        )}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {isReadingListItem && bookmark.visitCount > 0 && onMarkAsUnread && (
              <button onClick={() => onMarkAsUnread(bookmark.id)} className="p-1.5 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors" title="Mark as unread"><span className="sr-only">Mark as unread</span>{ICONS.markUnread}</button>
            )}
            <ArchiveButton />
             <button onClick={handleCopyUrl} className="p-1.5 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors" title="Copy URL">
                <span className="sr-only">Copy URL</span>{ICONS.copy}
            </button>
            <button onClick={() => onInfo(bookmark)} className="p-1.5 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"><span className="sr-only">Edit</span>{ICONS.info}</button>
            <button onClick={() => onDelete(bookmark.id)} className="p-1.5 bg-[var(--bg-tertiary)] rounded-md text-[var(--text-secondary)] hover:text-red-500 transition-colors"><span className="sr-only">Delete</span>{ICONS.delete}</button>
        </div>
      </div>
    </div>
  );
};

export default BookmarkItem;