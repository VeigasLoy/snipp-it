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
}) => {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    notes: '',
    imageUrl: '',
    folderId: folders[0]?.id || '',
    labels: [] as string[],
  });
  const [newLabelName, setNewLabelName] = useState('');
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  
  const populateForm = (bm: Bookmark | null) => {
      setFormData({
        url: bm?.url || '',
        title: bm?.title || '',
        description: bm?.description || '',
        notes: bm?.notes || '',
        imageUrl: bm?.imageUrl || '',
        folderId: bm?.folderId || folders[0]?.id || '',
        labels: bm?.labels || [],
      });
  }

  useEffect(() => {
    setIsEditing(mode === 'edit');
    populateForm(bookmark);
  }, [bookmark, isOpen, folders, mode]);
  
  const handleCancelEdit = () => {
    if (mode === 'view') {
        setIsEditing(false);
        populateForm(bookmark); // Reset any changes
    } else {
        onClose();
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    if (!formData.url || !formData.title) return;
    onSave(formData, bookmark?.id);
  };

  if (!isOpen) return null;
  
  const getFolderName = (folderId: string) => {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) return 'N/A';
      const category = categories.find(c => c.id === folder.categoryId);
      return `${category?.name || 'Uncategorized'} / ${folder.name}`;
  }

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
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">URL</label>
                <input type="url" name="url" value={formData.url} onChange={handleChange} required className="w-full px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"/>
              </div>
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
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]" placeholder="Add personal notes here..."/>
              </div>
              <div>
                <label htmlFor="folderId" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Folder</label>
                <select name="folderId" value={formData.folderId} onChange={handleChange} className="w-full px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]">
                  {categories.map(cat => (
                    <optgroup key={cat.id} label={cat.name}>
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
                    className="flex-grow px-3 py-1 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
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
            <a href={bookmark?.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--accent-primary)] hover:underline break-all">{bookmark?.url}</a>
            
            {bookmark?.imageUrl && (
                <img src={bookmark.imageUrl} alt="Bookmark preview" className="mt-4 rounded-lg max-h-48 w-full object-contain bg-[var(--bg-tertiary)]" />
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
                    <h4 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Folder</h4>
                    <p className="text-[var(--text-primary)]">{getFolderName(bookmark?.folderId || '')}</p>
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
