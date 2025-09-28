import React, { useState } from 'react';
import { ICONS } from '../constants';
import { auth } from '../firebase';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

interface PasswordPromptModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PasswordPromptModal: React.FC<PasswordPromptModalProps> = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
        setError("Please enter a password.");
        return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
        setError("Could not verify user. Please try logging out and back in.");
        return;
    }
    
    setIsVerifying(true);
    setError(null);

    try {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        onSuccess();
    } catch (error: any) {
        console.error("Re-authentication failed", error);
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            setError("Incorrect password. Please try again.");
        } else {
            setError("An unexpected error occurred. Please try again.");
        }
    } finally {
        setIsVerifying(false);
        setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="relative bg-[var(--bg-primary)] w-full max-w-sm rounded-xl shadow-2xl p-8 m-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className='mr-2 text-[var(--text-tertiary)]'>{ICONS.lockClosed}</span>
            Private Access
        </h2>
        <p className="text-[var(--text-secondary)] mb-6">
          Please enter your account password to access this private folder.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="private-access-password" className="sr-only">Password</label>
              <input
                id="private-access-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 bg-white dark:bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <div className="flex justify-end pt-6 space-x-3">
            <button type="button" onClick={onClose} disabled={isVerifying} className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--border-primary)] transition-colors disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={isVerifying} className="px-4 py-2 text-sm font-medium text-white bg-[var(--accent-primary)] rounded-lg hover:bg-[var(--accent-primary-hover)] transition-colors flex items-center justify-center min-w-[6rem] disabled:bg-[var(--accent-primary-hover)]">
                {isVerifying ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordPromptModal;
