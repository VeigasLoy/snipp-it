import React, { useEffect } from 'react';
import { ICONS } from '../constants';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="fixed top-20 right-5 z-50 bg-[var(--bg-secondary)] text-[var(--text-primary)] px-5 py-3 rounded-lg shadow-lg border border-[var(--border-primary)] animate-fade-in-down flex items-center">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
        {React.cloneElement(ICONS.close, { className: 'h-5 w-5' })}
      </button>
    </div>
  );
};
export default Toast;