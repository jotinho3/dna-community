export type WorkshopNotificationType = 
  | 'workshop_enrollment_confirmation'
  | 'workshop_reminder_24h'
  | 'workshop_reminder_1h'
  | 'workshop_starting_now'
  | 'workshop_cancelled'
  | 'workshop_updated'
  | 'workshop_completed'
  | 'certificate_issued'
  | 'waitlist_promoted'
  | 'workshop_creator_approved'
  | 'enrollment_deadline_reminder';

export interface WorkshopNotificationData {
  workshopId: string;
  workshopTitle: string;
  workshopDate: string;
  workshopTime: string;
  creatorName?: string;
  meetingLink?: string;
  certificateId?: string;
  changes?: string[];
  cancellationReason?: string;
}

export interface WorkshopNotification {
  id: string;
  type: WorkshopNotificationType;
  title: string;
  message: string;
  data: WorkshopNotificationData;
  userId: string;
  read: boolean;
  createdAt: Date;
  scheduledFor?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}