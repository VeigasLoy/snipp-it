import { Label, Bookmark } from '../types';

interface UseLabelManagementProps {
  labels: Label[];
  bookmarks: Bookmark[];
  addLabel: (label: Omit<Label, 'id'>) => Promise<string | void>;
  removeLabel: (id: string) => Promise<void>;
  updateBookmark: (id: string, data: Partial<Bookmark>) => Promise<void>;
  setItemToDelete: (item: { type: 'category' | 'folder' | 'label' | 'bookmark-bulk'; id: string | string[]; name: string; } | null) => void;
}

export const useLabelManagement = ({
  labels,
  bookmarks,
  addLabel,
  removeLabel,
  updateBookmark,
  setItemToDelete,
}: UseLabelManagementProps) => {
  const handleAddLabelSubmit = (name: string): Promise<Label> => {
    if (!name.trim()) throw new Error("Label name cannot be empty");
    const existingLabel = labels.find(l => l.name.toLowerCase() === name.trim().toLowerCase());
    if (existingLabel) return Promise.resolve(existingLabel);

    const newLabel = { name: name.trim() };
    return addLabel(newLabel).then(id => ({ id: id as string, ...newLabel }));
  };

  const handleDeleteLabel = (id: string, name: string) => {
    setItemToDelete({ type: 'label', id, name });
  };

  return { handleAddLabelSubmit, handleDeleteLabel };
};
