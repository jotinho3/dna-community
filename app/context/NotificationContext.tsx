"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'answer' | 'reaction' | 'accepted' | 'workshop';
  subType?: 'workshop_enrollment_confirmation' | 'workshop_reminder_24h' | 'workshop_reminder_1h' | 'workshop_starting_now' | 'workshop_cancelled' | 'workshop_updated' | 'workshop_completed' | 'certificate_issued' | 'waitlist_promoted' | 'workshop_creator_approved' | 'enrollment_deadline_reminder';
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  targetId: string;
  targetType: 'question' | 'answer' | 'workshop' | 'certificate';
  answerId?: string;
  workshopId?: string;
  certificateId?: string;
  message: string;
  createdAt: string;
  read: boolean;
  readAt?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionLabel?: string;
  meetingLink?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  hasMore: boolean;
  fetchNotifications: (loadMore?: boolean) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getUnreadCount: () => Promise<void>;
  navigateToNotification: (notification: Notification) => void;
  createWorkshopNotification: (userId: string, subType: string, data: any) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastCreatedAt, setLastCreatedAt] = useState<string | null>(null);

  const { user } = useAuth();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // Generate workshop notification content
  const generateWorkshopNotificationContent = (subType: string, data: any) => {
    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const formatTime = (timeStr: string) => {
      return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    };

    switch (subType) {
      case 'workshop_enrollment_confirmation':
        return {
          message: `You're enrolled in "${data.workshopTitle}" scheduled for ${formatDate(data.workshopDate)} at ${formatTime(data.workshopTime)}.`,
          priority: 'medium',
          actionUrl: `/workshops/${data.workshopId}`,
          actionLabel: 'View Workshop'
        };

      case 'workshop_reminder_24h':
        return {
          message: `Reminder: "${data.workshopTitle}" is tomorrow at ${formatTime(data.workshopTime)}. Don't forget to join!`,
          priority: 'high',
          actionUrl: `/workshops/${data.workshopId}`,
          actionLabel: 'View Workshop'
        };

      case 'workshop_reminder_1h':
        return {
          message: `"${data.workshopTitle}" starts in 1 hour. Get ready to join!`,
          priority: 'urgent',
          actionUrl: `/workshops/${data.workshopId}`,
          actionLabel: 'View Workshop'
        };

      case 'workshop_starting_now':
        return {
          message: `"${data.workshopTitle}" is starting now. Click to join the meeting.`,
          priority: 'urgent',
          actionUrl: data.meetingLink || `/workshops/${data.workshopId}/join`,
          actionLabel: 'Join Now',
          meetingLink: data.meetingLink
        };

      case 'workshop_cancelled':
        return {
          message: `Unfortunately, "${data.workshopTitle}" scheduled for ${formatDate(data.workshopDate)} has been cancelled.${data.cancellationReason ? ` Reason: ${data.cancellationReason}` : ''}`,
          priority: 'high',
          actionUrl: `/workshops/${data.workshopId}`,
          actionLabel: 'View Details'
        };

      case 'workshop_updated':
        return {
          message: `"${data.workshopTitle}" has been updated. ${data.changes ? `Changes: ${data.changes.join(', ')}` : 'Check the details for more information.'}`,
          priority: 'medium',
          actionUrl: `/workshops/${data.workshopId}`,
          actionLabel: 'View Changes'
        };

      case 'workshop_completed':
        return {
          message: `You've successfully completed "${data.workshopTitle}"!${data.certificateId ? ' Your certificate is ready for download.' : ''}`,
          priority: 'medium',
          actionUrl: data.certificateId ? `/certificates/${data.certificateId}` : `/workshops/${data.workshopId}`,
          actionLabel: data.certificateId ? 'View Certificate' : 'View Workshop'
        };

      case 'certificate_issued':
        return {
          message: `Your certificate for "${data.workshopTitle}" is now available for download.`,
          priority: 'medium',
          actionUrl: `/certificates/${data.certificateId}`,
          actionLabel: 'Download Certificate'
        };

      case 'waitlist_promoted':
        return {
          message: `Great news! You've been moved from the waitlist to enrolled status for "${data.workshopTitle}".`,
          priority: 'high',
          actionUrl: `/workshops/${data.workshopId}`,
          actionLabel: 'View Workshop'
        };

      case 'workshop_creator_approved':
        return {
          message: 'Congratulations! You now have workshop creator permissions. Start creating and sharing your knowledge!',
          priority: 'high',
          actionUrl: '/workshops/create',
          actionLabel: 'Create Workshop'
        };

      case 'enrollment_deadline_reminder':
        return {
          message: `Don't miss out! Enrollment for "${data.workshopTitle}" closes in 24 hours.`,
          priority: 'medium',
          actionUrl: `/workshops/${data.workshopId}`,
          actionLabel: 'Enroll Now'
        };

      default:
        return {
          message: `You have a new workshop notification regarding "${data.workshopTitle}".`,
          priority: 'low',
          actionUrl: `/workshops/${data.workshopId}`,
          actionLabel: 'View Workshop'
        };
    }
  };

  // Create workshop notification
  const createWorkshopNotification = useCallback(async (userId: string, subType: string, data: any) => {
    try {
      const content = generateWorkshopNotificationContent(subType, data);
      
      const notificationData = {
        userId,
        type: 'workshop',
        subType,
        fromUserId: data.creatorId || 'system',
        fromUserName: data.creatorName || 'DNA Community',
        targetId: data.workshopId,
        targetType: 'workshop',
        workshopId: data.workshopId,
        certificateId: data.certificateId,
        message: content.message,
        priority: content.priority,
        actionUrl: content.actionUrl,
        actionLabel: content.actionLabel,
        meetingLink: content.meetingLink,
      };

      const response = await fetch(`${apiUrl}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      if (response.ok) {
        // Refresh notifications and unread count
        await fetchNotifications();
        await getUnreadCount();
      }
    } catch (error) {
      console.error('Error creating workshop notification:', error);
    }
  }, [apiUrl]);

  // Fetch notifications - removed dependencies that cause loops
  const fetchNotifications = useCallback(async (loadMore = false) => {
    if (!user?.uid || loading) return;

    setLoading(true);
    try {
      let url = `${apiUrl}/api/notifications/${user.uid}?limit=20`;
      if (loadMore && lastCreatedAt) {
        url += `&lastCreatedAt=${lastCreatedAt}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        if (loadMore) {
          setNotifications(prev => [...prev, ...data.notifications]);
        } else {
          setNotifications(data.notifications);
        }
        
        setHasMore(data.pagination.hasMore);
        if (data.notifications.length > 0) {
          setLastCreatedAt(data.notifications[data.notifications.length - 1].createdAt);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, apiUrl]);

  // Get unread count
  const getUnreadCount = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const response = await fetch(`${apiUrl}/api/notifications/${user.uid}/unread-count`);
      const data = await response.json();

      if (response.ok) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user?.uid, apiUrl]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, read: true, readAt: new Date().toISOString() }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [apiUrl]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const response = await fetch(`${apiUrl}/api/notifications/${user.uid}/mark-all-read`, {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, read: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [user?.uid, apiUrl]);

  // Navigate to notification target
  const navigateToNotification = useCallback((notification: Notification) => {
    // Mark as read first
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Handle workshop notifications
    if (notification.type === 'workshop') {
      if (notification.subType === 'workshop_starting_now' && notification.meetingLink) {
        window.open(notification.meetingLink, '_blank');
      } else if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
      return;
    }

    // Navigate based on existing type
    if (notification.targetType === 'question') {
      window.location.href = `/questions/${notification.targetId}`;
    } else if (notification.targetType === 'answer' && notification.answerId) {
      window.location.href = `/questions/${notification.targetId}#answer-${notification.answerId}`;
    }
  }, [markAsRead]);

  // Separate useEffect for initial load
  useEffect(() => {
    if (user?.uid) {
      fetchNotifications();
      getUnreadCount();
    }
  }, [user?.uid]);

  // Separate useEffect for polling
  useEffect(() => {
    if (!user?.uid) return;

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      getUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.uid]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    navigateToNotification,
    createWorkshopNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};