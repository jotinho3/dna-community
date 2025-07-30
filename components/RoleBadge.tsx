import React from 'react';
import { UserRole } from '../api/roleApiLayer';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin',
          color: 'bg-red-100 text-red-800',
          icon: '👑',
        };
      case 'workshop_creator':
        return {
          label: 'Workshop Creator',
          color: 'bg-blue-100 text-blue-800',
          icon: '🎓',
        };
      case 'moderator':
        return {
          label: 'Moderator',
          color: 'bg-green-100 text-green-800',
          icon: '🛡️',
        };
      case 'member':
        return {
          label: 'Member',
          color: 'bg-gray-100 text-gray-800',
          icon: '👤',
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800',
          icon: '❓',
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const config = getRoleConfig(role);
  const sizeClasses = getSizeClasses(size);

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.color}
        ${sizeClasses}
      `}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

export default RoleBadge;