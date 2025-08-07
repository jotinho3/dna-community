"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  Eye,
  Filter,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Award,
  MessageSquare,
  UserPlus,
  BookOpen,
  Star,
  Gift,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

interface Notification {
  id: string;
  userId: string;
  type: string;
  fromUserId: string;
  fromUserName: string;
  targetId: string;
  targetType: string;
  message: string;
  createdAt: string;
  read: boolean;
  metadata?: Record<string, any>;
  userDetails: {
    name: string;
    email: string;
    engagement_xp: number;
    profile?: {
      role: string;
      experience: string;
    };
  };
  fromUserDetails?: {
    name: string;
    email: string;
  } | null;
}

interface ActivityResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    type: string | null;
    userId: string | null;
    read: boolean | null;
    startDate: string | null;
    endDate: string | null;
  };
}

interface ActivityStats {
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  stats: {
    totalNotifications: number;
    readNotifications: number;
    unreadNotifications: number;
    systemNotifications: number;
    notificationsByType: Record<string, number>;
    notificationsByDay: Record<string, number>;
    // Remove mostActiveUsers since it doesn't exist in the API response
  };
}

export const UserActivity: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [userDetailsMap, setUserDetailsMap] = useState<
    Record<string, { name: string; email: string }>
  >({});
  const [calculatedMostActiveUsers, setCalculatedMostActiveUsers] = useState<
    Array<{
      userId: string;
      notificationCount: number;
      userName: string;
      userEmail: string;
    }>
  >([]);

  const calculateMostActiveUsers = () => {
    if (!activity?.notifications) return;

    const userCounts: Record<
      string,
      { count: number; name: string; email: string }
    > = {};

    activity.notifications.forEach((notification) => {
      const userId = notification.userId;
      const userName = notification.userDetails?.name || "Unknown User";
      const userEmail = notification.userDetails?.email || "";

      if (userCounts[userId]) {
        userCounts[userId].count++;
      } else {
        userCounts[userId] = {
          count: 1,
          name: userName,
          email: userEmail,
        };
      }
    });

    const sortedUsers = Object.entries(userCounts)
      .map(([userId, data]) => ({
        userId,
        notificationCount: data.count,
        userName: data.name,
        userEmail: data.email,
      }))
      .sort((a, b) => b.notificationCount - a.notificationCount);

    setCalculatedMostActiveUsers(sortedUsers);
  };

  // Fetch user details for each notification
  useEffect(() => {
    if (activity) {
      const userIds = activity.notifications.map((n) => n.userId);
      fetchUserDetails(userIds);
      calculateMostActiveUsers();
    }
  }, [activity]);

  const fetchUserDetails = async (userIds: string[]) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/admin/users?ids=${userIds.join(",")}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.uid}`,
          },
        }
      );

      const data = await response.json();
      const userMap = data.users.reduce(
        (acc: Record<string, { name: string; email: string }>, user: any) => {
          acc[user.id] = { name: user.name, email: user.email };
          return acc;
        },
        {}
      );
      setUserDetailsMap(userMap);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      toast.error("Failed to load user details");
    }
  };

  // Filters
  const [filters, setFilters] = useState({
    type: "",
    userId: "",
    read: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
  });

  const [statsPeriod, setStatsPeriod] = useState("30d");

  const fetchActivity = async (page = 1, newFilters = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      // Add filters to query params
      if (newFilters.type) queryParams.append("type", newFilters.type);
      if (newFilters.userId) queryParams.append("userId", newFilters.userId);
      if (newFilters.read) queryParams.append("read", newFilters.read);
      if (newFilters.startDate)
        queryParams.append("startDate", newFilters.startDate);
      if (newFilters.endDate) queryParams.append("endDate", newFilters.endDate);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/admin/activity?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.uid}`,
          },
        }
      );

      const data = await response.json();
      setActivity(data);
      setPagination((prev) => ({ ...prev, page }));

      // Extract and store user details from notifications
      if (data.notifications) {
        const newUserDetails = { ...userDetailsMap };
        data.notifications.forEach((notification: Notification) => {
          if (notification.userDetails && notification.userId) {
            newUserDetails[notification.userId] = {
              name: notification.userDetails.name,
              email: notification.userDetails.email,
            };
          }
          // Also store fromUserDetails if available
          if (notification.fromUserDetails && notification.fromUserId) {
            newUserDetails[notification.fromUserId] = {
              name: notification.fromUserDetails.name,
              email: notification.fromUserDetails.email,
            };
          }
        });
        setUserDetailsMap(newUserDetails);
      }
    } catch (error) {
      console.error("Failed to fetch activity:", error);
      toast.error("Failed to load activity data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (period = statsPeriod) => {
    setStatsLoading(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/admin/activity/stats?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.uid}`,
          },
        }
      );

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch activity stats:", error);
      toast.error("Failed to load activity statistics");
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchNotificationDetails = async (notificationId: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/admin/activity/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.uid}`,
          },
        }
      );

      const data = await response.json();
      setSelectedNotification(data.notification);
    } catch (error) {
      console.error("Failed to fetch notification details:", error);
      toast.error("Failed to load notification details");
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchActivity();
      fetchStats();
    }
  }, [currentUser]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (key !== "search") {
      fetchActivity(1, newFilters);
    }
  };

  const handleSearch = () => {
    fetchActivity(1, filters);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reward_token_earned":
        return <Gift className="w-4 h-4 text-yellow-500" />;
      case "workshop_enrollment":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "question_answered":
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case "user_followed":
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      case "workshop_completed":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "achievement_unlocked":
        return <Star className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      reward_token_earned: "Token Earned",
      workshop_enrollment: "Workshop Enrollment",
      question_answered: "Question Answered",
      user_followed: "New Follower",
      workshop_completed: "Workshop Completed",
      achievement_unlocked: "Achievement",
    };
    return labels[type] || type.replace("_", " ");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const NotificationDetailDialog = ({
    notification,
  }: {
    notification: Notification;
  }) => {
    const [open, setOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);

    const handleOpenChange = async (isOpen: boolean) => {
      setOpen(isOpen);
      if (
        isOpen &&
        (!selectedNotification || selectedNotification.id !== notification.id)
      ) {
        setDetailsLoading(true);
        await fetchNotificationDetails(notification.id);
        setDetailsLoading(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {getNotificationIcon(notification.type)}
              <span>Notification Details</span>
            </DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : selectedNotification &&
            selectedNotification.id === notification.id ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">
                    Basic Info
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">ID:</span>
                      <span className="font-mono text-xs">
                        {selectedNotification.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Type:</span>
                      <Badge variant="outline">
                        {getNotificationTypeLabel(selectedNotification.type)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <Badge
                        className={
                          selectedNotification.read
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }
                      >
                        {selectedNotification.read ? "Read" : "Unread"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Created:</span>
                      <span>{formatDate(selectedNotification.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-2">User Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {selectedNotification.userDetails.name
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {selectedNotification.userDetails.name}
                        </p>
                        <p className="text-slate-600">
                          {selectedNotification.userDetails.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">XP:</span>
                      <span>
                        {selectedNotification.userDetails.engagement_xp}
                      </span>
                    </div>
                    {selectedNotification.userDetails.profile && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Role:</span>
                          <Badge variant="secondary">
                            {selectedNotification.userDetails.profile.role}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Experience:</span>
                          <Badge variant="secondary">
                            {
                              selectedNotification.userDetails.profile
                                .experience
                            }
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Message</h4>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">
                  {selectedNotification.message}
                </p>
              </div>

              {selectedNotification.metadata &&
                Object.keys(selectedNotification.metadata).length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">
                      Metadata
                    </h4>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                        {JSON.stringify(selectedNotification.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              Failed to load notification details
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="feed">Activity Feed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search by user ID or message..."
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                      className="pl-10"
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                </div>

                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="reward_token_earned">
                      Token Earned
                    </SelectItem>
                    <SelectItem value="workshop_enrollment">
                      Workshop Enrollment
                    </SelectItem>
                    <SelectItem value="question_answered">
                      Question Answered
                    </SelectItem>
                    <SelectItem value="user_followed">New Follower</SelectItem>
                    <SelectItem value="workshop_completed">
                      Workshop Completed
                    </SelectItem>
                    <SelectItem value="achievement_unlocked">
                      Achievement
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.read}
                  onValueChange={(value) => handleFilterChange("read", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Read</SelectItem>
                    <SelectItem value="false">Unread</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  placeholder="Start Date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />

                <Input
                  type="date"
                  placeholder="End Date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <Button onClick={handleSearch} size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      type: "",
                      userId: "",
                      read: "",
                      startDate: "",
                      endDate: "",
                      search: "",
                    });
                    fetchActivity(1, {
                      type: "",
                      userId: "",
                      read: "",
                      startDate: "",
                      endDate: "",
                      search: "",
                    });
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchActivity(pagination.page, filters)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Activity Feed</span>
                  {activity && (
                    <Badge variant="outline">
                      {activity.pagination.total} total
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : activity?.notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">
                    No activity found
                  </h3>
                  <p className="text-slate-500">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activity?.notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`border rounded-lg p-4 ${
                        notification.read
                          ? "bg-white"
                          : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {getNotificationTypeLabel(notification.type)}
                              </Badge>
                              {!notification.read && (
                                <Badge className="bg-blue-100 text-blue-700 text-xs">
                                  New
                                </Badge>
                              )}
                              <span className="text-xs text-slate-500">
                                {formatDate(notification.createdAt)}
                              </span>
                            </div>

                            <p className="text-slate-900 mb-2">
                              {notification.message}
                            </p>

                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {notification.userDetails.name
                                      .charAt(0)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{notification.userDetails.name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Award className="w-3 h-3" />
                                <span>
                                  {notification.userDetails.engagement_xp} XP
                                </span>
                              </div>
                            </div>

                            {notification.metadata && (
                              <div className="mt-3 text-xs text-slate-500">
                                {Object.entries(notification.metadata)
                                  .slice(0, 3)
                                  .map(([key, value]) => (
                                    <span key={key} className="mr-4">
                                      {key}: {String(value)}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <NotificationDetailDialog
                            notification={notification}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Pagination */}
                  {activity && activity.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-slate-600">
                        Page {activity.pagination.page} of{" "}
                        {activity.pagination.totalPages}
                        <span className="ml-2">
                          ({activity.pagination.total} total notifications)
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            fetchActivity(activity.pagination.page - 1, filters)
                          }
                          disabled={!activity.pagination.hasPrevPage}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            fetchActivity(activity.pagination.page + 1, filters)
                          }
                          disabled={!activity.pagination.hasNextPage}
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Period Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Activity Analytics</span>
                </div>
                <Select
                  value={statsPeriod}
                  onValueChange={(value) => {
                    setStatsPeriod(value);
                    fetchStats(value);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
          </Card>

          {statsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Total Notifications
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {stats.stats.totalNotifications}
                        </p>
                      </div>
                      <Bell className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Read Rate
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {Math.round(
                            (stats.stats.readNotifications /
                              stats.stats.totalNotifications) *
                              100
                          )}
                          %
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Unread
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {stats.stats.unreadNotifications}
                        </p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          System Notifications
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {stats.stats.systemNotifications}
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notifications by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Notifications by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.stats.notificationsByType).map(
                      ([type, count]) => (
                        <div
                          key={type}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            {getNotificationIcon(type)}
                            <span className="font-medium">
                              {getNotificationTypeLabel(type)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (count / stats.stats.totalNotifications) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Most Active Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Most Active Users (from current data)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {calculatedMostActiveUsers.length === 0 ? (
                      <p className="text-center text-slate-500 py-8">
                        No user activity data available
                      </p>
                    ) : (
                      calculatedMostActiveUsers
                        .slice(0, 10)
                        .map((userStat, index) => (
                          <div
                            key={userStat.userId}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </span>
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {userStat.userName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {userStat.userName}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {userStat.userEmail || userStat.userId}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {userStat.notificationCount} notifications
                            </Badge>
                          </div>
                        ))
                    )}
                  </div>
                  <div className="mt-4 text-xs text-slate-500">
                    * Based on current page data (
                    {activity?.notifications.length || 0} notifications)
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  No analytics data available
                </h3>
                <p className="text-slate-500">
                  Analytics data will appear here once there's activity to
                  analyze.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
