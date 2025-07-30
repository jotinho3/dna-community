import React, { useState, useEffect } from 'react';
import { WorkshopNotification } from '../types/workshopNotifications';
import workshopNotificationService from '../api/workshopNotificationApiLayer';
import WorkshopNotificationComponent from './WorkshopNotification';

interface WorkshopNotificationCenterProps {
  userId: string;
  onNotificationAction?: (notification: WorkshopNotification) => void;
}

const WorkshopNotificationCenter: React.FC<WorkshopNotificationCenterProps> = ({
  userId,
  onNotificationAction,
}) => {
  const [notifications, setNotifications] = useState<WorkshopNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'reminders' | 'certificates'>('all');

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await workshopNotificationService.getWorkshopNotifications(
        userId,
        filter === 'unread'
      );
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await workshopNotificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await workshopNotificationService.deleteNotification(notificationId);
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await workshopNotificationService.markAllWorkshopNotificationsAsRead(userId);
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNotificationAction = (notification: WorkshopNotification) => {
    // Mark as read when action is taken
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Trigger parent callback
    onNotificationAction?.(notification);
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'reminders':
        return notifications.filter(n => 
          n.type.includes('reminder') || n.type === 'workshop_starting_now'
        );
      case 'certificates':
        return notifications.filter(n => 
          n.type === 'certificate_issued' || n.type === 'workshop_completed'
        );
      default:
        return notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Workshop Notifications</h2>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'reminders', label: 'Reminders', count: notifications.filter(n => n.type.includes('reminder') || n.type === 'workshop_starting_now').length },
          { key: 'certificates', label: 'Certificates', count: notifications.filter(n => n.type === 'certificate_issued' || n.type === 'workshop_completed').length },
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key as any)}
            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              filter === filterOption.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {filterOption.label}
            {filterOption.count > 0 && (
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                filter === filterOption.key
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {filterOption.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error loading notifications</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchNotifications}
                className="text-sm text-red-600 hover:text-red-800 mt-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border-l-4 border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notifications List */}
      {!loading && filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5m0-5v5m-5-5H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
          </h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? 'Workshop notifications will appear here when you enroll in workshops.'
              : `You don't have any ${filter} notifications at the moment.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <WorkshopNotificationComponent
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              onAction={handleNotificationAction}
            />
          ))}
        </div>
      )}

      {/* Load More (if needed) */}
      {filteredNotifications.length > 20 && (
        <div className="text-center mt-8">
          <button className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Load More Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkshopNotificationCenter;