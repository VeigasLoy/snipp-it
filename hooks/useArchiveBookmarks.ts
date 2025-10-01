import { useState } from 'react';
import { Bookmark } from '../types';

interface UseArchiveBookmarksProps {
  updateBookmark: (id: string, data: Partial<Bookmark>) => Promise<void>;
  onShowToast: (message: string | null) => void;
}

export const useArchiveBookmarks = ({ updateBookmark, onShowToast }: UseArchiveBookmarksProps) => {
  const [archivingId, setArchivingId] = useState<string | null>(null);

  const handleArchiveBookmark = async (bookmark: Bookmark) => {
    if (!bookmark) return;

    setArchivingId(bookmark.id);
    onShowToast(`Archiving "${bookmark.title}"...`);
    updateBookmark(bookmark.id, { archiveFailed: false });

    try {
      const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(bookmark.url)}`);
      
      if (!response.ok) throw new Error(`Proxy service returned status ${response.status}.`);
      
      const html = await response.text();

      if (!html || html.includes("AllOrigins is down")) throw new Error("The archiving proxy service may be down.");
      if (/<title>.*(403 Forbidden|Access Denied|Just a moment|Login|Sign in|Attention Required).*<\/title>/i.test(html) || /Cloudflare|checking your browser|hCaptcha/i.test(html)) {
        throw new Error("Page is protected by a login, CAPTCHA, or other block.");
      }
      if (html.length < 1000) throw new Error("Archived content was incomplete, which may indicate a block.");
      
      updateBookmark(bookmark.id, { archivedHtml: html, archiveFailed: false });
      onShowToast('Page archived successfully!');
    } catch (error) {
      console.error("Failed to archive page:", error);
      updateBookmark(bookmark.id, { archivedHtml: undefined, archiveFailed: true });
      const errorMessage = error instanceof Error ? error.message : 'The site may have blocked the request.';
      onShowToast(`Archive failed: ${errorMessage}`);
    } finally {
      setArchivingId(null);
    }
  };

  return { archivingId, handleArchiveBookmark };
};
