export type UserRole = 'workshop_creator' | 'admin' | 'moderator' | 'member';

export interface UserRoles {
  roles: UserRole[];
  primaryRole: UserRole;
}

export interface RolePermissions {
  canCreateWorkshops: boolean;
  canManageAllWorkshops: boolean;
  canModerateContent: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
}

class RoleService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/users') {
    this.baseUrl = baseUrl;
  }

  // Get user roles from your existing user system
  async getUserRoles(uid: string): Promise<UserRoles> {
    const response = await fetch(`${this.baseUrl}/${uid}/roles`);

    if (!response.ok) {
      throw new Error(`Failed to fetch user roles: ${response.statusText}`);
    }

    return response.json();
  }

  // Check if user has specific role
  hasRole(userRoles: UserRole[], requiredRole: UserRole): boolean {
    return userRoles.includes(requiredRole);
  }

  // Check if user has any of the specified roles
  hasAnyRole(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role));
  }

  // Get permissions based on user roles
  getPermissions(userRoles: UserRole[]): RolePermissions {
    return {
      canCreateWorkshops: this.hasAnyRole(userRoles, ['workshop_creator', 'admin']),
      canManageAllWorkshops: this.hasRole(userRoles, 'admin'),
      canModerateContent: this.hasAnyRole(userRoles, ['moderator', 'admin']),
      canManageUsers: this.hasRole(userRoles, 'admin'),
      canViewAnalytics: this.hasAnyRole(userRoles, ['workshop_creator', 'admin']),
    };
  }

  // Request workshop creator role (if your system supports role requests)
  async requestWorkshopCreatorRole(uid: string, justification: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${uid}/request-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'workshop_creator',
        justification,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to request role: ${response.statusText}`);
    }
  }
}

export const roleService = new RoleService();
export default roleService;