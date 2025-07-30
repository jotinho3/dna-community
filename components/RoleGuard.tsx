import React, { ReactNode } from 'react';
import { UserRole } from '../api/roleApiLayer';
import { useRoles } from '../app/context/RoleContext';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  fallback?: ReactNode;
  requireAll?: boolean; // If true, user must have ALL roles; if false, user needs ANY role
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requiredRoles = [],
  fallback = null,
  requireAll = false,
}) => {
  const { userRoles, loading } = useRoles();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Build array of required roles
  const rolesToCheck: UserRole[] = requiredRole ? [requiredRole] : requiredRoles;

  if (rolesToCheck.length === 0) {
    return <>{children}</>;
  }

  // Check permissions
  const hasPermission = requireAll
    ? rolesToCheck.every(role => userRoles.includes(role))
    : rolesToCheck.some(role => userRoles.includes(role));

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;