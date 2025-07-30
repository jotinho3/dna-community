import { useState, useEffect, useCallback } from 'react';
import { WorkshopNotification } from '../types/workshopNotifications';
import workshopNotificationService from '../api/workshopNotificationApiLayer';

export const useWorkshopNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<WorkshopNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await workshopNotificationService.getWorkshopNotifications(userId);
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await workshopNotificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await workshopNotificationService.markAllWorkshopNotificationsAsRead(userId);
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, [userId]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await workshopNotificationService.deleteNotification(notificationId);
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [notifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Set up real-time notifications (WebSocket/SSE) if available
  useEffect(() => {
    if (!userId) return;

    // Example WebSocket connection for real-time notifications
    // Replace with your actual WebSocket/SSE implementation
    const connectToNotifications = () => {
      // const ws = new WebSocket(`ws://your-websocket-url/${userId}/workshop-notifications`);
      // 
      // ws.onmessage = (event) => {
      //   const newNotification = JSON.parse(event.data);
      //   setNotifications(prev => [newNotification, ...prev]);
      //   if (!newNotification.read) {
      //     setUnreadCount(prev => prev + 1);
      //   }
      // };
      //
      // return ws;
    };

    // const ws = connectToNotifications();
    // return () => ws?.close();
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};