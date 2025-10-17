      import React, { useState } from 'react';
      import { ICONS } from '../constants';
      import { auth } from '../firebase'; // Assuming firebase.ts exports 'auth'
      import { signInWithEmailAndPassword } from 'firebase/auth';
      
      interface PasswordModalProps {
        isOpen: boolean;
        onClose: () => void;
        onUnlock: () => void;
        userEmail: string | null; // Add userEmail prop
        onError: (message: string) => void; // Add onError prop for toast messages
      }
      
      const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onUnlock, userEmail, onError }) => {
        const [password, setPassword] = useState('');
        const [loading, setLoading] = useState(false);
      
        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!userEmail) {
            onError('User email not available.');
            return;
          }
          setLoading(true);
          try {
            await signInWithEmailAndPassword(auth, userEmail, password);
            onUnlock();
            onClose();
          } catch (error: any) {
            console.error('Error signing in:', error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
              onError('Incorrect password or email.');
            } else {
              onError('Failed to unlock. Please try again.');
            }
          } finally {
            setLoading(false);
            setPassword(''); // Clear password field
          }
        };
      
        if (!isOpen) {
          return null;
        }
      
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
              <h2 className="text-xl font-semibold mb-4">Enter Password to Unlock Locker</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="password"
                  className="w-full p-2 border border-gray-300 rounded mb-4"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Unlocking...' : 'Unlock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      };
      
      export default PasswordModal;
      