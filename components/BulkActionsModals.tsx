import React, { useState } from 'react';
import { Category, Folder, Label } from '../types';
import { ICONS } from '../constants';

// --- Bulk Move Modal ---
interface BulkMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (folderId: string) => void;
  categories: Category[];
  folders: Folder[];
}

export const BulkMoveModal: React.FC<BulkMoveModalProps> = ({ isOpen, onClose, onMove, categories, folders }) => {
  const [selectedFolderId, setSelectedFolderId] = useState(folders[0]?.id || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFolderId) {
      onMove(selectedFolderId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="relative bg-[var(--bg-primary)] w-full max-w-sm rounded-xl shadow-2xl p-8 m-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Move Bookmarks</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="folderId" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Select a destination folder:</label>
          <select 
            id="folderId" 
            value={selectedFolderId} 
            onChange={e => setSelectedFolderId(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
          >
            {categories.map(cat => (
              <optgroup key={cat.id} label={cat.name}>
                {folders.filter(f => f.categoryId === cat.id).map(folder => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="flex justify-end pt-6 space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border-primary)] transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent-primary)] rounded-lg hover:bg-[var(--accent-primary-hover)] transition-colors">Move Items</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Bulk Add Labels Modal ---
interface BulkAddLabelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (labelIds: string[]) => void;
  labels: Label[];
  onAddLabel: (name: string) => Promise<Label>;
}

export const BulkAddLabelsModal: React.FC<BulkAddLabelsModalProps> = ({ isOpen, onClose, onSave, labels, onAddLabel }) => {
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [newLabelName, setNewLabelName] = useState('');

  if (!isOpen) return null;

  const handleLabelToggle = (labelId: string) => {
    setSelectedLabelIds(prev =>
      prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
    );
  };

  const handleAddNewLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
        const newLabel = await onAddLabel(newLabelName);
        if (!selectedLabelIds.includes(newLabel.id)) {
            handleLabelToggle(newLabel.id);
        }
        setNewLabelName('');
    } catch (error) {
        console.error(error);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(selectedLabelIds);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="relative bg-[var(--bg-primary)] w-full max-w-md rounded-xl shadow-2xl p-8 m-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4">Add Labels to Bookmarks</h2>
        <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Select or create labels to add:</label>
            <div className="flex flex-wrap gap-2 p-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-secondary)] min-h-[4rem]">
                {labels.map(label => (
                    <button type="button" key={label.id} onClick={() => handleLabelToggle(label.id)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        selectedLabelIds.includes(label.id) ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]' : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--text-primary)]'
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
                className="flex-grow px-3 py-1 text-sm bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
              <button type="button" onClick={handleAddNewLabel} className="px-3 py-1 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border-primary)] transition-colors">Add</button>
            </div>
          <div className="flex justify-end pt-6 space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border-primary)] transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent-primary)] rounded-lg hover:bg-[var(--accent-primary-hover)] transition-colors">Add Labels</button>
          </div>
        </form>
      </div>
    </div>
  );
};