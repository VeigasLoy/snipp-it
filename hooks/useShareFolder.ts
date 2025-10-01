import { Bookmark } from '../types';

interface UseShareFolderProps {
  bookmarks: Bookmark[];
  onShowToast: (message: string | null) => void;
}

export const useShareFolder = ({ bookmarks, onShowToast }: UseShareFolderProps) => {
  const handleShareFolder = (folderId: string, folderName: string) => {
    const folderBookmarks = bookmarks.filter(b => b.folderId === folderId);
    if (folderBookmarks.length === 0) {
      onShowToast("This folder is empty.");
      return;
    }
    const textToCopy = `Bookmarks from "${folderName}":\n\n` + folderBookmarks.map(b => `${b.title}\n${b.url}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
      onShowToast("Folder content copied to clipboard!");
    }).catch(err => {
      onShowToast("Failed to copy to clipboard.");
      console.error('Failed to copy text: ', err);
    });
  };

  return { handleShareFolder };
};
