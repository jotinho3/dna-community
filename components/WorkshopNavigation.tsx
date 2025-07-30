import React from 'react';
import { useRoles } from '../app/context/RoleContext';

interface WorkshopNavigationProps {
  currentView: 'browse' | 'my-workshops' | 'create' | 'analytics';
  onViewChange: (view: 'browse' | 'my-workshops' | 'create' | 'analytics') => void;
}

const WorkshopNavigation: React.FC<WorkshopNavigationProps> = ({
  currentView,
  onViewChange,
}) => {
  const { permissions } = useRoles();

  const navigationItems = [
    {
      id: 'browse',
      label: 'Browse Workshops',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      available: true,
    },
    {
      id: 'my-workshops',
      label: 'My Workshops',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      available: true,
    },
    {
      id: 'create',
      label: 'Create Workshop',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      available: permissions.canCreateWorkshops,
      badge: permissions.canCreateWorkshops ? undefined : 'Creator Only',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      available: permissions.canViewAnalytics,
      badge: permissions.canViewAnalytics ? undefined : 'Creator Only',
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.available && onViewChange(item.id as any)}
              disabled={!item.available}
              className={`
                flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors duration-200
                ${
                  currentView === item.id
                    ? 'border-blue-500 text-blue-600'
                    : item.available
                    ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    : 'border-transparent text-gray-300 cursor-not-allowed'
                }
              `}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
              {item.badge && (
                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default WorkshopNavigation;