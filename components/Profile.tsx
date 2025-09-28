import React from 'react';
import { User } from '../types';
import { ICONS } from '../constants';

interface ProfileProps {
  user: User;
  onOpenSettings: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onOpenSettings }) => {
  return (
    <div className="border-t border-[var(--border-primary)] pt-4 mt-4">
      <div className="group flex items-center justify-between w-full p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer" onClick={onOpenSettings}>
        <div className="flex items-center">
            <img src={user.avatar} alt="User Avatar" className="w-9 h-9 rounded-full mr-3" />
            <div>
                <p className="font-semibold text-sm text-[var(--text-primary)]">{user.name}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Settings</p>
            </div>
        </div>
        <button className="text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity">
            {ICONS.settings}
        </button>
      </div>
    </div>
  );
};

export default Profile;
