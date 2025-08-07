"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Award,
  Shield,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  MapPin,
  Globe,
  Calendar,
  Code,
  Wrench,
  Heart,
  Star,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

interface UserProfile {
  role: string | null;
  experience: string | null;
  interests: string[];
  languages: string[];
  tools: string[];
  bio?: string;
  location?: string;
  website?: string;
  skills?: string[];
  socialLinks?: Record<string, string>;
  createdAt?: any;
  updatedAt?: any;
}

interface User {
  uid: string;
  name: string;
  email: string;
  password?: string; // Hashed password
  created_at: any; // Firestore timestamp
  updated_at?: any; // Firestore timestamp
  onboardingCompletedAt?: any;
  hasCompletedOnboarding: boolean;
  profile: UserProfile;
  engagement_xp: number;
  role?: 'user' | 'workshop_creator' | 'admin';
  isActive?: boolean;
}

export const UsersManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) queryParams.append('search', searchTerm);
      if (roleFilter) queryParams.append('role', roleFilter);
      if (statusFilter) queryParams.append('status', statusFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/users?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${currentUser?.uid}`,
          },
        }
      );
      
      const data = await response.json();
      setUsers(data.users || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0 });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, searchTerm, roleFilter, statusFilter]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/users/${userId}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser?.uid}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (response.ok) {
        toast.success(`User role updated to ${newRole}`);
        fetchUsers(pagination.page);
      } else {
        throw new Error('Failed to update role');
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/users/${userId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser?.uid}`,
          },
          body: JSON.stringify({ isActive: !isActive }),
        }
      );

      if (response.ok) {
        toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
        fetchUsers(pagination.page);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'workshop_creator': return 'bg-emerald-100 text-emerald-700';
      case 'data_scientist': return 'bg-purple-100 text-purple-700';
      case 'data_analyst': return 'bg-blue-100 text-blue-700';
      case 'ml_engineer': return 'bg-orange-100 text-orange-700';
      case 'data_engineer': return 'bg-teal-100 text-teal-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getExperienceBadgeColor = (experience: string | null) => {
    switch (experience) {
      case 'senior': return 'bg-green-100 text-green-700';
      case 'mid': return 'bg-yellow-100 text-yellow-700';
      case 'junior': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const parseFirestoreTimestamp = (timestamp: any): Date => {
    if (timestamp && timestamp._seconds) {
      return new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
    }
    return new Date();
  };

  const formatDate = (timestamp: any) => {
    return parseFirestoreTimestamp(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const UserDetailDialog = ({ user }: { user: User }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{user.name || 'Unnamed User'}</h3>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Account Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">User ID:</span>
                  <span className="font-mono text-xs">{user.uid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Created:</span>
                  <span>{formatDate(user.created_at)}</span>
                </div>
                {user.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Updated:</span>
                    <span>{formatDate(user.updated_at)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Onboarding:</span>
                  <Badge variant={user.hasCompletedOnboarding ? "default" : "secondary"}>
                    {user.hasCompletedOnboarding ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
                {user.onboardingCompletedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Completed At:</span>
                    <span>{formatDate(user.onboardingCompletedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-900 mb-2">Engagement</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">XP:</span>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold">{user.engagement_xp || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          {user.profile && (
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Profile Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-slate-700 mb-2">Professional</h5>
                  <div className="space-y-2">
                    {user.profile.role && (
                      <div className="flex items-center space-x-2">
                        <Badge className={getRoleBadgeColor(user.profile.role)}>
                          {user.profile.role.replace('_', ' ')}
                        </Badge>
                      </div>
                    )}
                    {user.profile.experience && (
                      <div className="flex items-center space-x-2">
                        <Badge className={getExperienceBadgeColor(user.profile.experience)}>
                          {user.profile.experience} level
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-slate-700 mb-2">Contact</h5>
                  <div className="space-y-1 text-sm text-slate-600">
                    {user.profile.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{user.profile.location}</span>
                      </div>
                    )}
                    {user.profile.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4" />
                        <span>{user.profile.website}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {user.profile.bio && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-slate-700 mb-2">Bio</h5>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    {user.profile.bio}
                  </p>
                </div>
              )}

              {/* Skills & Tools */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {/* Languages */}
                {user.profile.languages && user.profile.languages.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                      <Code className="w-4 h-4 mr-1" />
                      Languages
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {user.profile.languages.map((lang) => (
                        <Badge key={lang} variant="outline" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tools */}
                {user.profile.tools && user.profile.tools.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                      <Wrench className="w-4 h-4 mr-1" />
                      Tools
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {user.profile.tools.map((tool) => (
                        <Badge key={tool} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interests */}
                {user.profile.interests && user.profile.interests.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      Interests
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {user.profile.interests.map((interest) => (
                        <Badge key={interest} variant="outline" className="text-xs">
                          {interest.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills */}
              {user.profile.skills && user.profile.skills.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-slate-700 mb-2 flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Skills
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {user.profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Links */}
              {user.profile.socialLinks && Object.keys(user.profile.socialLinks).length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-slate-700 mb-2">Social Links</h5>
                  <div className="space-y-1">
                    {Object.entries(user.profile.socialLinks).map(([platform, url]) => (
                      <div key={platform} className="flex items-center space-x-2 text-sm">
                        <span className="text-slate-600 capitalize">{platform}:</span>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {url}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6" />
            <span>Users Management ({pagination.total})</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'compact' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('compact')}
            >
              Compact
            </Button>
            <Button
              variant={viewMode === 'detailed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('detailed')}
            >
              Detailed
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="workshop_creator">Workshop Creator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="data_scientist">Data Scientist</SelectItem>
              <SelectItem value="data_analyst">Data Analyst</SelectItem>
              <SelectItem value="ml_engineer">ML Engineer</SelectItem>
              <SelectItem value="data_engineer">Data Engineer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="completed">Onboarding Complete</SelectItem>
              <SelectItem value="pending">Onboarding Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.uid} className={`border border-slate-200 rounded-lg hover:bg-slate-50 ${
                viewMode === 'detailed' ? 'p-6' : 'p-4'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="font-semibold text-slate-900">{user.name || 'Unnamed User'}</h3>
                        {user.profile?.role && (
                          <Badge className={getRoleBadgeColor(user.profile.role)}>
                            {user.profile.role.replace('_', ' ')}
                          </Badge>
                        )}
                        {user.profile?.experience && (
                          <Badge className={getExperienceBadgeColor(user.profile.experience)}>
                            {user.profile.experience}
                          </Badge>
                        )}
                        {!user.hasCompletedOnboarding && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            Onboarding Pending
                          </Badge>
                        )}
                        {user.isActive === false && (
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{user.email}</p>
                      
                      {viewMode === 'detailed' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                          {/* Basic Stats */}
                          <div>
                            <h5 className="text-xs font-medium text-slate-700 mb-1">Account Info</h5>
                            <div className="space-y-1 text-xs text-slate-600">
                              <div className="flex items-center space-x-2">
                                <Zap className="w-3 h-3 text-yellow-500" />
                                <span>{user.engagement_xp || 0} XP</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-3 h-3" />
                                <span>Joined {formatDate(user.created_at)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Skills */}
                          {user.profile && (
                            <div>
                              <h5 className="text-xs font-medium text-slate-700 mb-1">Languages</h5>
                              <div className="flex flex-wrap gap-1">
                                {user.profile.languages?.slice(0, 3).map((lang) => (
                                  <Badge key={lang} variant="outline" className="text-xs">
                                    {lang}
                                  </Badge>
                                ))}
                                {user.profile.languages && user.profile.languages.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{user.profile.languages.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Interests */}
                          {user.profile && (
                            <div>
                              <h5 className="text-xs font-medium text-slate-700 mb-1">Interests</h5>
                              <div className="flex flex-wrap gap-1">
                                {user.profile.interests?.slice(0, 2).map((interest) => (
                                  <Badge key={interest} variant="outline" className="text-xs">
                                    {interest.replace('_', ' ')}
                                  </Badge>
                                ))}
                                {user.profile.interests && user.profile.interests.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{user.profile.interests.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {viewMode === 'compact' && (
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span className="flex items-center space-x-1">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            <span>{user.engagement_xp || 0} XP</span>
                          </span>
                          <span>Joined {formatDate(user.created_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <UserDetailDialog user={user} />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.role !== 'workshop_creator' && (
                          <DropdownMenuItem onClick={() => handleRoleChange(user.uid, 'workshop_creator')}>
                            <Award className="w-4 h-4 mr-2" />
                            Make Workshop Creator
                          </DropdownMenuItem>
                        )}
                        {user.role !== 'admin' && (
                          <DropdownMenuItem onClick={() => handleRoleChange(user.uid, 'admin')}>
                            <Shield className="w-4 h-4 mr-2" />
                            Make Admin
                          </DropdownMenuItem>
                        )}
                        {user.role !== 'user' && (
                          <DropdownMenuItem onClick={() => handleRoleChange(user.uid, 'user')}>
                            <Users className="w-4 h-4 mr-2" />
                            Make Regular User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleStatusToggle(user.uid, user.isActive !== false)}
                          className={(user.isActive !== false) ? 'text-red-600' : 'text-emerald-600'}
                        >
                          {(user.isActive !== false) ? (
                            <>
                              <UserX className="w-4 h-4 mr-2" />
                              Deactivate User
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate User
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  No users found
                </h3>
                <p className="text-slate-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-slate-600">
                  Page {pagination.page} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUsers(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUsers(pagination.page + 1)}
                    disabled={pagination.page >= totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};