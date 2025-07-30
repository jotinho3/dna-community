import { WorkshopNotification, WorkshopNotificationType, WorkshopNotificationData } from '../types/workshopNotifications';

class WorkshopNotificationService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/notifications') {
    this.baseUrl = baseUrl;
  }

  // Create workshop notification
  async createWorkshopNotification(
    userId: string,
    type: WorkshopNotificationType,
    data: WorkshopNotificationData,
    scheduledFor?: Date
  ): Promise<WorkshopNotification> {
    const response = await fetch(`${this.baseUrl}/workshop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        type,
        data,
        scheduledFor,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create notification: ${response.statusText}`);
    }

    return response.json();
  }

  // Get workshop notifications for user
  async getWorkshopNotifications(userId: string, unreadOnly: boolean = false): Promise<WorkshopNotification[]> {
    const params = unreadOnly ? '?unreadOnly=true' : '';
    const response = await fetch(`${this.baseUrl}/workshop/${userId}${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.statusText}`);
    }

    return response.json();
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${notificationId}/read`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error(`Failed to mark notification as read: ${response.statusText}`);
    }
  }

  // Mark all workshop notifications as read
  async markAllWorkshopNotificationsAsRead(userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/workshop/${userId}/read-all`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${notificationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete notification: ${response.statusText}`);
    }
  }

  // Generate notification content based on type
  generateNotificationContent(type: WorkshopNotificationType, data: WorkshopNotificationData) {
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

    switch (type) {
      case 'workshop_enrollment_confirmation':
        return {
          title: 'Workshop Enrollment Confirmed',
          message: `You're enrolled in "${data.workshopTitle}" scheduled for ${formatDate(data.workshopDate)} at ${formatTime(data.workshopTime)}.`,
          priority: 'medium' as const,
        };

      case 'workshop_reminder_24h':
        return {
          title: 'Workshop Tomorrow',
          message: `Reminder: "${data.workshopTitle}" is tomorrow at ${formatTime(data.workshopTime)}. Don't forget to join!`,
          priority: 'high' as const,
        };

      case 'workshop_reminder_1h':
        return {
          title: 'Workshop Starting Soon',
          message: `"${data.workshopTitle}" starts in 1 hour. Get ready to join!`,
          priority: 'urgent' as const,
        };

      case 'workshop_starting_now':
        return {
          title: 'Workshop Starting Now',
          message: `"${data.workshopTitle}" is starting now. Click to join the meeting.`,
          priority: 'urgent' as const,
        };

      case 'workshop_cancelled':
        return {
          title: 'Workshop Cancelled',
          message: `Unfortunately, "${data.workshopTitle}" scheduled for ${formatDate(data.workshopDate)} has been cancelled. ${data.cancellationReason ? `Reason: ${data.cancellationReason}` : ''}`,
          priority: 'high' as const,
        };

      case 'workshop_updated':
        return {
          title: 'Workshop Updated',
          message: `"${data.workshopTitle}" has been updated. ${data.changes ? `Changes: ${data.changes.join(', ')}` : 'Check the details for more information.'}`,
          priority: 'medium' as const,
        };

      case 'workshop_completed':
        return {
          title: 'Workshop Completed',
          message: `You've successfully completed "${data.workshopTitle}"! ${data.certificateId ? 'Your certificate is ready for download.' : ''}`,
          priority: 'medium' as const,
        };

      case 'certificate_issued':
        return {
          title: 'Certificate Ready',
          message: `Your certificate for "${data.workshopTitle}" is now available for download.`,
          priority: 'medium' as const,
        };

      case 'waitlist_promoted':
        return {
          title: 'Moved from Waitlist',
          message: `Great news! You've been moved from the waitlist to enrolled status for "${data.workshopTitle}".`,
          priority: 'high' as const,
        };

      case 'workshop_creator_approved':
        return {
          title: 'Workshop Creator Access Approved',
          message: `Congratulations! You now have workshop creator permissions. Start creating and sharing your knowledge!`,
          priority: 'high' as const,
        };

      case 'enrollment_deadline_reminder':
        return {
          title: 'Enrollment Deadline Approaching',
          message: `Don't miss out! Enrollment for "${data.workshopTitle}" closes in 24 hours.`,
          priority: 'medium' as const,
        };

      default:
        return {
          title: 'Workshop Notification',
          message: `You have a new workshop notification regarding "${data.workshopTitle}".`,
          priority: 'low' as const,
        };
    }
  }
}

export const workshopNotificationService = new WorkshopNotificationService();
export default workshopNotificationService;