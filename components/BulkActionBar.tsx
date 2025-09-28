import React from 'react';
import { ICONS } from '../constants';

interface BulkActionBarProps {
  count: number;
  onMove: () => void;
  onAddLabels: () => void;
  onDelete: () => void;
  onClear: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({ count, onMove, onAddLabels, onDelete, onClear }) => {
  return (
    <div className="flex items-center justify-between m-4 px-6 py-3 bg-[var(--bg-secondary)] rounded-xl shadow-2xl border border-[var(--border-primary)] w-full max-w-xl animate-fade-in-up">
        <p className="text-sm font-medium text-[var(--text-primary)]">{count} item{count > 1 ? 's' : ''} selected</p>
        <div className="flex items-center space-x-2">
            <button onClick={onMove} className="px-3 py-2 text-sm font-semibold flex items-center gap-2 text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border-primary)] hover:text-[var(--text-primary)] transition-colors">Move</button>
            <button onClick={onAddLabels} className="px-3 py-2 text-sm font-semibold flex items-center gap-2 text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border-primary)] hover:text-[var(--text-primary)] transition-colors">Labels</button>
            <button onClick={onDelete} className="px-3 py-2 text-sm font-semibold flex items-center gap-2 text-red-500 bg-[var(--bg-tertiary)] rounded-lg hover:bg-red-500/10 transition-colors">Delete</button>
            <div className="w-px h-6 bg-[var(--border-primary)] mx-2"></div>
            <button onClick={onClear} className="p-2 rounded-full text-[var(--text-tertiary)] hover:bg-[var(--border-primary)] hover:text-[var(--text-primary)] transition-colors" aria-label="Clear selection">
                {React.cloneElement(ICONS.close, { className: 'h-5 w-5' })}
            </button>
        </div>
    </div>
  );
};
export default BulkActionBar;