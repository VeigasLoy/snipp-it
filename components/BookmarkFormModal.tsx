import React from 'react';
import { useState, useEffect } from 'react';
import { Bookmark, Category, Label, Folder } from '../types';
import { ICONS } from '../constants';

interface BookmarkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'isFavorite' | 'visitCount' | 'lastVisitedAt'>, id?: string) => void;
  bookmark: Bookmark | null;
  categories: Category[];
  folders: Folder[];
  labels: Label[];
  onAddLabel: (name: string) => Promise<Label>;
  mode: 'view' | 'edit';
  initialFolderId?: string | null; // New prop
  initialCategoryId?: string | null; // New prop
  initialUrl?: string | null; // New prop for dropped URL
  initialHtmlContent?: string | null; // New prop for dropped HTML
}

const BookmarkFormModal: React.FC<BookmarkFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  bookmark,
  categories,
  folders,
  labels,
  onAddLabel,
  mode,
  initialFolderId,
  initialCategoryId,
  initialUrl,
  initialHtmlContent, // Destructure new prop
}) => {
  const [formData, setFormData] = useState({
    url: '',
    html: '', // New state for HTML content
    title: '',
    description: '',
    notes: '',
    imageUrl: '',
    folderId: null as string | null,
    categoryId: null as string | null,
    labels: [] as string[],
    selectedLocation: '', // New state to manage the select input value
  });
  const [newLabelName, setNewLabelName] = useState('');
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [contentType, setContentType] = useState<'url' | 'html'>(bookmark?.archivedHtml ? 'html' : 'url'); // New state for content type
  
  const populateForm = (bm: Bookmark | null) => {
      const determinedContentType = initialHtmlContent || bm?.archivedHtml ? 'html' : 'url';
      
      const initialSelectedLocation = initialFolderId || initialCategoryId || bm?.folderId || bm?.categoryId || '';
      
      setFormData({
        url: determinedContentType === 'url' ? String(initialUrl || bm?.url || '') : '', // Explicitly cast to String
        html: determinedContentType === 'html' ? (initialHtmlContent || bm?.archivedHtml || '') : '', // Set HTML only if content type is HTML
        title: bm?.title || '',
        description: bm?.description || '',
        notes: bm?.notes || '',
        imageUrl: bm?.imageUrl || '',
        folderId: initialFolderId || bm?.folderId || null,
        categoryId: initialCategoryId || bm?.categoryId || null,
        labels: bm?.labels || [],
        selectedLocation: initialSelectedLocation,
      });
      // Set content type based on initialHtmlContent or bookmark data
      setContentType(determinedContentType);
  }

  useEffect(() => {
    setIsEditing(mode === 'edit');
    populateForm(bookmark);
  }, [bookmark, isOpen, folders, categories, mode, initialFolderId, initialCategoryId, initialUrl, initialHtmlContent]); // Add initialHtmlContent to dependencies
  
  const handleCancelEdit = () => {
    if (mode === 'view') {
        setIsEditing(false);
        populateForm(bookmark); // Reset any changes
    } else {
        onClose();
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    let newFolderId: string | null = null;
    let newCategoryId: string | null = null;

    if (value === '') { // 'No Category/Folder' selected
        newFolderId = null;
        newCategoryId = null;
    } else {
        const foundFolder = folders.find(f => f.id === value);
        if (foundFolder) {
            newFolderId = value;
            newCategoryId = null;
        } else {
            const foundCategory = categories.find(cat => cat.id === value);
            if (foundCategory) {
                newCategoryId = value;
                newFolderId = null;
            }
        }
    }

    setFormData(prev => ({
      ...prev,
      selectedLocation: value,
      folderId: newFolderId,
      categoryId: newCategoryId,
    }));
  };
  
  const handleLabelToggle = (labelId: string) => {
    setFormData(prev => {
        const newLabels = prev.labels.includes(labelId)
            ? prev.labels.filter(id => id !== labelId)
            : [...prev.labels, labelId];
        return { ...prev, labels: newLabels };
    });
  };

  const handleAddNewLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
        const newLabel = await onAddLabel(newLabelName);
        if (!formData.labels.includes(newLabel.id)) {
            handleLabelToggle(newLabel.id);
        }
        setNewLabelName('');
    } catch (error) {
        console.error(error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const dataToSave: Omit<Bookmark, 'id' | 'createdAt' | 'isFavorite' | 'visitCount' | 'lastVisitedAt'> = {
        ...formData,
        url: contentType === 'url' ? formData.url : '',
        archivedHtml: contentType === 'html' ? formData.html : '',
    };
    delete (dataToSave as any).selectedLocation;

    if (dataToSave.folderId === '') dataToSave.folderId = null;
    if (dataToSave.categoryId === '') dataToSave.categoryId = null;

    onSave(dataToSave, bookmark?.id);
  };

  if (!isOpen) return null;
  
  const getLocationName = (folderId: string | null = null, categoryId: string | null = null) => {
      if (folderId) {
          const folder = folders.find(f => f.id === folderId);
          if (folder) {
              const category = categories.find(c => c.id === folder.categoryId);
              return `${category?.name ? `${category.name} / ` : ''}${folder.name}`;
          }
      } else if (categoryId) {
          const category = categories.find(c => c.id === categoryId);
          if (category) {
              return category.name;
          }
      }
      return 'No Location';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="relative bg-[var(--bg-primary)] w-full max-w-lg rounded-xl shadow-2xl p-8 m-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
          {ICONS.close}
        </button>

        {isEditing ? (
        <>
            <h2 className="text-2xl font-bold mb-6">{bookmark ? 'Edit Bookmark' : 'New Bookmark'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Content Type Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Content Type</label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="contentType"
                      value="url"
                      checked={contentType === 'url'}
                      onChange={() => setContentType('url')}
                    />
                    <span className="ml-2 text-[var(--text-primary)]">URL</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name="contentType"
                      value="html"
                      checked={contentType === 'html'}
                      onChange={() => setContentType('html')}
                    />
                    <span className="ml-2 text-[var(--text-primary)]">HTML</span>
                  </label>
                </div>
              </div>

              {contentType === 'url' ? (
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">URL</label>
                  <input type="url" name="url" value={formData.url} onChange={handleChange} required={contentType === 'url'} className="w-full px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"/>
                </div>
              ) : (
                <div>
                  <label htmlFor="html" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">HTML Content</label>
                  <textarea name="html" value={formData.html} onChange={handleChange} required={contentType === 'html'} rows={10} className="w-full px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]" placeholder="Paste your HTML content here..."></textarea>
                </div>
              )}

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"/>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"/>
              </div>
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Image URL <span className="text-xs">(Optional)</span></label>
                <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/image.png" className="w-full px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"/>
              </div>
               <div>
                <label htmlFor="notes" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]" placeholder="Add personal notes here..."></textarea>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category/Folder</label>
                <select name="selectedLocation" value={formData.selectedLocation} onChange={handleLocationChange} className="w-full px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]">
                  <option value="">No Category/Folder</option>
                  {categories.map(cat => (
                    <optgroup key={cat.id} label={cat.name}>
                      <option value={cat.id}>{cat.name} (Direct)</option>
                      {folders.filter(f => f.categoryId === cat.id).map(folder => (
                        <option key={folder.id} value={folder.id}>{folder.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Labels</label>
                <div className="flex flex-wrap gap-2">
                    {labels.map(label => (
                        <button type="button" key={label.id} onClick={() => handleLabelToggle(label.id)}
                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                            formData.labels.includes(label.id) ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]' : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--text-primary)]'
                        }`}
                        >{label.name}</button>
                    ))}
                </div>
                <div className="flex items-center mt-3 space-x-2">
                  <input 
                    type="text" 
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddNewLabel(); }}}
                    placeholder="Add new label..."
                    className="flex-grow px-3 py-1 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-1 focus-ring-[var(--accent-primary)]"
                  />
                  <button type="button" onClick={handleAddNewLabel} className="px-3 py-1 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border-primary)] transition-colors">Add</button>
                </div>
              </div>
              <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={handleCancelEdit} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border-primary)] transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent-primary)] rounded-lg hover:bg-[var(--accent-primary-hover)] transition-colors">{bookmark ? 'Save Changes' : 'Create Bookmark'}</button>
              </div>
            </form>
        </>
        ) : (
        <>
            <h2 className="text-2xl font-bold mb-2">{bookmark?.title}</h2>
            {bookmark?.url && (
                <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent-primary)] hover:underline break-all">{bookmark.url}</a>
            )}
            {bookmark?.archivedHtml && (
                <div className="text-sm text-[var(--text-primary)] mt-2"><i>Archived HTML Content</i></div>
            )}
            
            {bookmark?.imageUrl && (
                <img src={bookmark.imageUrl} alt="Bookmark preview" className="mt-4 rounded-lg max-h-48 w-full object-contain bg-[var(--bg-tertiary)]" />
            )}
            {bookmark?.archivedHtml && !bookmark?.imageUrl && ( // Display iframe only if archivedHtml exists and no imageUrl
                <div className="mt-4 rounded-lg max-h-64 h-64 w-full bg-[var(--bg-tertiary)] overflow-hidden border border-[var(--border-primary)]">
                    <iframe 
                        srcDoc={bookmark.archivedHtml} 
                        title="HTML Content Preview" 
                        className="w-full h-full border-none"
                        sandbox="allow-same-origin allow-scripts" // Basic sandboxing for safety
                    ></iframe>
                </div>
            )}

            <div className="mt-6 space-y-4">
                <div>
                    <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Description</h4>
                    <p className="text-[var(--text-primary)] whitespace-pre-wrap">{bookmark?.description || <i className="text-[var(--text-tertiary)]">No description</i>}</p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Notes</h4>
                    <p className="text-[var(--text-primary)] whitespace-pre-wrap">{bookmark?.notes || <i className="text-[var(--text-tertiary)]">No notes</i>}</p>
                </div>
                 <div>
                    <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Location</h4>
                    <p className="text-[var(--text-primary)]">{getLocationName(formData.folderId, formData.categoryId)}</p>
                </div>
                <div>
                    <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Labels</h4>
                    <div className="flex flex-wrap gap-2">
                        {bookmark?.labels.length ? labels.filter(l => bookmark.labels.includes(l.id)).map(label => (
                           <span key={label.id} className="px-3 py-1 text-sm rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-primary)]">{label.name}</span>
                        )) : <i className="text-[var(--text-tertiary)]">No labels</i>}
                    </div>
                </div>
            </div>
             <div className="flex justify-end pt-6 space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border-primary)] transition-colors">Close</button>
                <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent-primary)] rounded-lg hover:bg-[var(--accent-primary-hover)] transition-colors">Edit</button>
            </div>
        </>
        )}
      </div>
    </div>
  );
};

export default BookmarkFormModal;