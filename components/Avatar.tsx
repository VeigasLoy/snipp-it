import React from 'react';

interface AvatarProps {
  name: string;
  className?: string;
}

// Simple hash function to get a color from a string
const stringToColor = (str: string) => {
  let hash = 0;
  if (str.length === 0) return '#000000';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xCC; // Using 0xCC to get softer colors
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

// Function to get initials from a name
const getInitials = (name: string) => {
  if (!name) return '?';
  const names = name.trim().split(' ');
  const initials = names.map(n => n[0]).join('');
  return initials.slice(0, 2).toUpperCase();
};

const Avatar: React.FC<AvatarProps> = ({ name, className = 'w-9 h-9' }) => {
  const initials = getInitials(name);
  const backgroundColor = stringToColor(name);

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-bold select-none ${className}`}
      style={{ backgroundColor }}
      aria-label={`Avatar for ${name}`}
    >
      <span className="text-sm tracking-tighter">{initials}</span>
    </div>
  );
};

export default Avatar;
