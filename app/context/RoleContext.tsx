import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserRole, UserRoles, RolePermissions, roleService } from '../../api/roleApiLayer';

interface RoleContextType {
  userRoles: UserRole[];
  permissions: RolePermissions;
  loading: boolean;
  error: string | null;
  refreshRoles: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
  userId: string | null; // Current user ID from your auth system
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children, userId }) => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<RolePermissions>({
    canCreateWorkshops: false,
    canManageAllWorkshops: false,
    canModerateContent: false,
    canManageUsers: false,
    canViewAnalytics: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRoles = async () => {
    if (!userId) {
      setUserRoles([]);
      setPermissions(roleService.getPermissions([]));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rolesData = await roleService.getUserRoles(userId);
      setUserRoles(rolesData.roles);
      setPermissions(roleService.getPermissions(rolesData.roles));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user roles');
      // Set default permissions on error
      setUserRoles([]);
      setPermissions(roleService.getPermissions([]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRoles();
  }, [userId]);

  const refreshRoles = async () => {
    await fetchUserRoles();
  };

  const value: RoleContextType = {
    userRoles,
    permissions,
    loading,
    error,
    refreshRoles,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRoles = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRoles must be used within a RoleProvider');
  }
  return context;
};