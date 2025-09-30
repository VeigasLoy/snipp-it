export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
  folderId?: string;
  categoryId?: string;
  labels: string[];
  createdAt: string;
  isFavorite: boolean;
  visitCount: number;
  notes: string;
  lastVisitedAt?: string;
  archivedHtml?: string;
  archiveFailed?: boolean;
  isPrivate?: boolean;
}

export interface Folder {
  id:string;
  name: string;
  categoryId: string | null;
  isPinned: boolean;
  isPrivate?: boolean;
}

export interface Category {
  id: string;
  name: string;
}

export interface Label {
    id: string;
    name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export enum Layout {
  GRID = 'grid',
  LIST = 'list',
  CARD = 'card',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SOLARIZED = 'solarized',
  NORD = 'nord',
  MONOKAI = 'monokai',
}

export enum Font {
  INTER = 'Inter',
  ROBOTO = 'Roboto',
  LATO = 'Lato',
  SOURCE_SANS_PRO = 'Source Sans Pro',
  PLAYFAIR_DISPLAY = 'Playfair Display',
  MERRIWEATHER = 'Merriweather',
}

export type ActiveFilter = {
    type: 'all' | 'favorites' | 'category' | 'folder' | 'label' | 'pinned' | 'abandoned' | 'archived';
    id: string | string[];
    name: string;
}
