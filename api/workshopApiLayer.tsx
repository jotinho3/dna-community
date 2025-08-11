import { Workshop, WorkshopEnrollment, WorkshopCertificate, WorkshopStatus, EnrollmentStatus } from '../types/workshop';

class WorkshopService {
  private baseUrl: string;
  private apiUrl: string;


constructor(apiUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080') {
  this.apiUrl = apiUrl;
  this.baseUrl = `${apiUrl}/api/workshops`; // Construct full workshop API URL
}

  // Helper method to create notifications
  private async createNotification(userId: string, subType: string, data: any) {
    try {
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
        message: this.generateNotificationMessage(subType, data),
        priority: this.getNotificationPriority(subType),
        actionUrl: this.getActionUrl(subType, data),
        actionLabel: this.getActionLabel(subType),
        meetingLink: data.meetingLink,
      };

      const response = await fetch(`${this.apiUrl}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        throw new Error('Failed to create notification');
      }
    } catch (error) {
      console.error('Error creating workshop notification:', error);
    }
  }

  private generateNotificationMessage(subType: string, data: any): string {
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
        return `enrolled you in "${data.workshopTitle}" scheduled for ${formatDate(data.workshopDate)} at ${formatTime(data.workshopTime)}.`;
      case 'workshop_reminder_24h':
        return `reminded you that "${data.workshopTitle}" is tomorrow at ${formatTime(data.workshopTime)}.`;
      case 'workshop_reminder_1h':
        return `reminded you that "${data.workshopTitle}" starts in 1 hour.`;
      case 'workshop_starting_now':
        return `notified you that "${data.workshopTitle}" is starting now. Click to join!`;
      case 'workshop_cancelled':
        return `cancelled the workshop "${data.workshopTitle}"${data.cancellationReason ? ` - ${data.cancellationReason}` : ''}.`;
      case 'workshop_updated':
        return `updated the workshop "${data.workshopTitle}"${data.changes ? ` - Changes: ${data.changes.join(', ')}` : ''}.`;
      case 'workshop_completed':
        return `marked you as completed for "${data.workshopTitle}". ${data.certificateId ? 'Your certificate is ready!' : ''}`;
      case 'certificate_issued':
        return `issued your certificate for "${data.workshopTitle}". Download it now!`;
      case 'waitlist_promoted':
        return `moved you from the waitlist to enrolled status for "${data.workshopTitle}".`;
      case 'workshop_creator_approved':
        return 'approved your workshop creator access. You can now create workshops!';
      case 'enrollment_deadline_reminder':
        return `reminded you that enrollment for "${data.workshopTitle}" closes in 24 hours.`;
      default:
        return `sent you a workshop notification about "${data.workshopTitle}".`;
    }
  }

  private getNotificationPriority(subType: string): string {
    switch (subType) {
      case 'workshop_starting_now':
        return 'urgent';
      case 'workshop_reminder_1h':
      case 'workshop_cancelled':
      case 'waitlist_promoted':
      case 'workshop_creator_approved':
        return 'high';
      case 'workshop_enrollment_confirmation':
      case 'workshop_reminder_24h':
      case 'workshop_updated':
      case 'workshop_completed':
      case 'certificate_issued':
      case 'enrollment_deadline_reminder':
        return 'medium';
      default:
        return 'low';
    }
  }

  private getActionUrl(subType: string, data: any): string {
    switch (subType) {
      case 'workshop_starting_now':
        return data.meetingLink || `/workshops/${data.workshopId}/join`;
      case 'certificate_issued':
      case 'workshop_completed':
        return data.certificateId ? `/certificates/${data.certificateId}` : `/workshops/${data.workshopId}`;
      case 'workshop_creator_approved':
        return '/workshops/create';
      default:
        return `/workshops/${data.workshopId}`;
    }
  }

  private getActionLabel(subType: string): string {
    switch (subType) {
      case 'workshop_starting_now':
        return 'Join Now';
      case 'certificate_issued':
        return 'Download Certificate';
      case 'workshop_completed':
        return 'View Certificate';
      case 'workshop_creator_approved':
        return 'Create Workshop';
      case 'enrollment_deadline_reminder':
        return 'Enroll Now';
      case 'workshop_updated':
        return 'View Changes';
      case 'workshop_cancelled':
        return 'View Details';
      default:
        return 'View Workshop';
    }
  }

  // Workshop CRUD Operations
 async getWorkshops(filters?: {
  status?: WorkshopStatus;
  category?: string;
  creatorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}, uid?: string): Promise<{ workshops: Workshop[]; pagination: any }> {
  
  // uid is now required for the available workshops endpoint
  if (!uid) {
    throw new Error('User ID is required to fetch available workshops');
  }
  
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Skip uid and status from query params since they're handled differently
        if (key !== 'uid' && key !== 'status') {
          params.append(key, value.toString());
        }
      }
    });
  }

  // Use the new endpoint with uid in the path
  const queryString = params.toString();
  const url = `${this.baseUrl}/${uid}/available${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch workshops: ${response.statusText}`);
  }

  return response.json();
}

  async getWorkshop(workshopId: string): Promise<Workshop> {
    const response = await fetch(`${this.baseUrl}/${workshopId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch workshop: ${response.statusText}`);
    }

    return response.json();
  }

  async getWorkshopParticipants(workshopId: string, uid: string): Promise<any[]> {
  try {
    const response = await fetch(`${this.baseUrl}/${workshopId}/${uid}/participants`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch workshop participants: ${response.statusText}`);
    }

    const data = await response.json();
    return data.participants || [];
  } catch (error) {
    console.error('Error fetching workshop participants:', error);
    throw error;
  }
}

  async createWorkshop(workshopData: Omit<Workshop, 'id' | 'createdAt' | 'updatedAt'>, uid: string): Promise<Workshop> {
  const response = await fetch(`${this.baseUrl}/${uid}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workshopData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create workshop: ${response.statusText}`);
  }

  const workshop = await response.json();

  // Notify creator about approval (if not auto-approved)
  if (workshop.status === 'pending') {
    await this.createNotification(workshop.creatorId, 'workshop_creator_approved', {
      workshopId: workshop.id,
      workshopTitle: workshop.title,
      creatorId: workshop.creatorId,
      creatorName: workshop.creatorName,
    });
  }

  return workshop;
}

async getUserCreatedWorkshops(userId: string): Promise<{ workshops: Workshop[]; pagination: any }> {
  const response = await fetch(`${this.baseUrl}/${userId}/created`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user created workshops: ${response.statusText}`);
  }

  return response.json();
}

 async updateWorkshop(workshopId: string, updates: Partial<Workshop>, changes?: string[], uid?: string): Promise<Workshop> {
  const url = uid ? `${this.baseUrl}/${workshopId}/${uid}` : `${this.baseUrl}/${workshopId}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update workshop: ${response.statusText}`);
  }

  const workshop = await response.json();

  // Notify enrolled participants about updates
  if (changes && changes.length > 0) {
    await this.notifyWorkshopUpdated(workshopId, changes);
  }

  return workshop;
}

async publishWorkshop(workshopId: string, uid: string): Promise<Workshop> {
  const response = await fetch(`${this.baseUrl}/${workshopId}/${uid}/publish`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to publish workshop: ${response.statusText}`);
  }

  const workshop = await response.json();

  // Notify about workshop publication if needed
  if (workshop.status === 'published') {
    // Could send notifications to followers or interested users
    console.log(`Workshop ${workshop.title} has been published!`);
  }

  return workshop;
}

  async deleteWorkshop(workshopId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${workshopId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete workshop: ${response.statusText}`);
    }
  }

  // Enrollment Operations
async enrollInWorkshop(workshopId: string, userId: string): Promise<void> {
  const response = await fetch(`${this.baseUrl}/${workshopId}/${userId}/enroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Already enrolled in this workshop');
    }
    throw new Error(`Failed to enroll in workshop: ${response.statusText}`);
  }

  const result = await response.json();
  const workshop = result.workshop;

  // Schedule reminder notifications (this would typically be done by backend scheduler)
  this.scheduleReminders(workshop, userId);
}

async unenrollFromWorkshop(workshopId: string, userId: string): Promise<void> {
  const response = await fetch(`${this.baseUrl}/${workshopId}/${userId}/enroll`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to unenroll from workshop: ${response.statusText}`);
  }
}

  async getWorkshopEnrollments(workshopId: string): Promise<WorkshopEnrollment[]> {
    const response = await fetch(`${this.baseUrl}/${workshopId}/enrollments`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch enrollments: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserEnrollments(userId: string, status?: EnrollmentStatus): Promise<WorkshopEnrollment[]> {
  // Remove the status parameter since backend doesn't support it
  const response = await fetch(`${this.baseUrl}/${userId}/enrollments`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user enrollments: ${response.statusText}`);
  }

  const enrollments = await response.json();
  
  // If status filtering is needed, do it on the frontend
  if (status) {
    return enrollments.filter((enrollment: WorkshopEnrollment) => enrollment.status === status);
  }
  
  return enrollments;
}

  async getEnrollmentStatus(workshopId: string, userId: string): Promise<{ enrolled: boolean; status: EnrollmentStatus | null }> {
    const response = await fetch(`${this.baseUrl}/${workshopId}/enrollment/${userId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return { enrolled: false, status: null };
      }
      throw new Error(`Failed to fetch enrollment status: ${response.statusText}`);
    }

    const enrollment = await response.json();
    return { enrolled: true, status: enrollment.status };
  }

  // Certificate Operations
  async getCertificate(certificateId: string): Promise<WorkshopCertificate> {
    const response = await fetch(`${this.baseUrl}/certificates/${certificateId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch certificate: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserCertificates(userId: string): Promise<WorkshopCertificate[]> {
    const response = await fetch(`${this.baseUrl}/${userId}/certificates`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user certificates: ${response.statusText}`);
    }

    return response.json();
  }

  async issueCertificate(workshopId: string, userId: string): Promise<WorkshopCertificate> {
    const response = await fetch(`${this.baseUrl}/${workshopId}/certificate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to issue certificate: ${response.statusText}`);
    }

    const certificate = await response.json();

    // Notify user about certificate issuance
    await this.notifyCertificateIssued(certificate.id, userId);

    return certificate;
  }

  // Workshop Management Operations
  async markWorkshopCompleted(workshopId: string, userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${workshopId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to mark workshop as completed: ${response.statusText}`);
    }

    const result = await response.json();
    const workshop = result.workshop;

    // Notify user about completion
    await this.createNotification(userId, 'workshop_completed', {
      workshopId: workshop.id,
      workshopTitle: workshop.title,
      certificateId: result.certificateId,
      creatorId: workshop.creatorId,
      creatorName: workshop.creatorName,
    });
  }

  async cancelWorkshop(workshopId: string, reason?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${workshopId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel workshop: ${response.statusText}`);
    }

    // Notify all enrolled participants
    await this.notifyWorkshopCancelled(workshopId, reason);
  }

  // Notification Methods
  async notifyWorkshopStarting(workshopId: string): Promise<void> {
    const workshop = await this.getWorkshop(workshopId);
    const enrollments = await this.getWorkshopEnrollments(workshopId);

    const promises = enrollments
      .filter(enrollment => enrollment.status === 'enrolled')
      .map(enrollment =>
        this.createNotification(enrollment.userId, 'workshop_starting_now', {
          workshopId: workshop.id,
          workshopTitle: workshop.title,
          workshopDate: workshop.scheduledDate,
          workshopTime: workshop.startTime,
          meetingLink: workshop.meetingLink,
          creatorId: workshop.creatorId,
          creatorName: workshop.creatorName,
        })
      );

    await Promise.all(promises);
  }

  async notifyWorkshopReminder(workshopId: string, reminderType: 'workshop_reminder_24h' | 'workshop_reminder_1h'): Promise<void> {
    const workshop = await this.getWorkshop(workshopId);
    const enrollments = await this.getWorkshopEnrollments(workshopId);

    const promises = enrollments
      .filter(enrollment => enrollment.status === 'enrolled')
      .map(enrollment =>
        this.createNotification(enrollment.userId, reminderType, {
          workshopId: workshop.id,
          workshopTitle: workshop.title,
          workshopDate: workshop.scheduledDate,
          workshopTime: workshop.startTime,
          creatorId: workshop.creatorId,
          creatorName: workshop.creatorName,
        })
      );

    await Promise.all(promises);
  }

  async notifyEnrollmentDeadline(workshopId: string): Promise<void> {
    // This would typically notify users who showed interest but haven't enrolled
    // For now, we'll skip this implementation as it requires additional user tracking
    console.log(`Would notify about enrollment deadline for workshop ${workshopId}`);
  }

  async notifyCertificateIssued(certificateId: string, userId: string): Promise<void> {
    const certificate = await this.getCertificate(certificateId);
    
    await this.createNotification(userId, 'certificate_issued', {
      workshopId: certificate.workshopId,
      workshopTitle: certificate.workshopTitle,
      certificateId: certificate.id,
      creatorId: 'system',
      creatorName: 'DNA Community',
    });
  }

  async notifyWorkshopUpdated(workshopId: string, changes: string[]): Promise<void> {
    const workshop = await this.getWorkshop(workshopId);
    const enrollments = await this.getWorkshopEnrollments(workshopId);

    const promises = enrollments
      .filter(enrollment => enrollment.status === 'enrolled')
      .map(enrollment =>
        this.createNotification(enrollment.userId, 'workshop_updated', {
          workshopId: workshop.id,
          workshopTitle: workshop.title,
          workshopDate: workshop.scheduledDate,
          workshopTime: workshop.startTime,
          changes: changes,
          creatorId: workshop.creatorId,
          creatorName: workshop.creatorName,
        })
      );

    await Promise.all(promises);
  }

  async notifyWorkshopCancelled(workshopId: string, reason?: string): Promise<void> {
    const workshop = await this.getWorkshop(workshopId);
    const enrollments = await this.getWorkshopEnrollments(workshopId);

    const promises = enrollments
      .filter(enrollment => enrollment.status === 'enrolled')
      .map(enrollment =>
        this.createNotification(enrollment.userId, 'workshop_cancelled', {
          workshopId: workshop.id,
          workshopTitle: workshop.title,
          workshopDate: workshop.scheduledDate,
          workshopTime: workshop.startTime,
          cancellationReason: reason,
          creatorId: workshop.creatorId,
          creatorName: workshop.creatorName,
        })
      );

    await Promise.all(promises);
  }

  async approveWorkshopCreator(userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/creators/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to approve workshop creator: ${response.statusText}`);
    }

    // Notify user about creator approval
    await this.createNotification(userId, 'workshop_creator_approved', {
      workshopId: '',
      workshopTitle: '',
      creatorId: 'system',
      creatorName: 'DNA Community',
    });
  }

  // Helper Methods
  private async scheduleReminders(workshop: any, userId: string) {
    // This would typically be handled by your backend scheduler
    // For demonstration, we'll log what would be scheduled
    const workshopDateTime = new Date(`${workshop.scheduledDate}T${workshop.startTime}`);
    const now = new Date();

    // If workshop is more than 24 hours away, schedule 24h reminder
    const reminder24h = new Date(workshopDateTime.getTime() - 24 * 60 * 60 * 1000);
    if (reminder24h > now) {
      console.log(`Would schedule 24h reminder for user ${userId} at:`, reminder24h);
      // In production, you would use a job scheduler like Bull, Agenda, or cron
      // Example: await scheduleJob('workshop_reminder_24h', reminder24h, { workshopId: workshop.id, userId });
    }

    // If workshop is more than 1 hour away, schedule 1h reminder
    const reminder1h = new Date(workshopDateTime.getTime() - 60 * 60 * 1000);
    if (reminder1h > now) {
      console.log(`Would schedule 1h reminder for user ${userId} at:`, reminder1h);
      // Example: await scheduleJob('workshop_reminder_1h', reminder1h, { workshopId: workshop.id, userId });
    }

    // Schedule workshop starting notification
    if (workshopDateTime > now) {
      console.log(`Would schedule starting notification for user ${userId} at:`, workshopDateTime);
      // Example: await scheduleJob('workshop_starting_now', workshopDateTime, { workshopId: workshop.id, userId });
    }
  }

  
  // Download the certificate
async downloadCertificate(certificateId: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/certificates/${certificateId}/download`);
    
    if (!response.ok) {
      throw new Error(`Failed to download certificate: ${response.statusText}`);
    }

    return response.blob();
  }

  // Verify certificate by verification code
  async verifyCertificate(verificationCode: string): Promise<{
    isValid: boolean;
    certificate?: WorkshopCertificate;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/certificates/verify/${verificationCode}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            isValid: false,
            error: 'Certificate not found or verification code is invalid'
          };
        }
        throw new Error(`Failed to verify certificate: ${response.statusText}`);
      }

      const certificate = await response.json();
      
      // Check if certificate is expired
      if (certificate.validUntil && new Date(certificate.validUntil) < new Date()) {
        return {
          isValid: false,
          certificate,
          error: 'Certificate has expired'
        };
      }

      // Check if certificate is verified
      if (!certificate.isVerified) {
        return {
          isValid: false,
          certificate,
          error: 'Certificate is not verified'
        };
      }

      return {
        isValid: true,
        certificate
      };
    } catch (error) {
      console.error('Certificate verification error:', error);
      return {
        isValid: false,
        error: 'Failed to verify certificate. Please try again later.'
      };
    }
  }

  // Get certificate by verification code (alternative method)
  async getCertificateByVerificationCode(verificationCode: string): Promise<WorkshopCertificate> {
    const response = await fetch(`${this.baseUrl}/certificates/verify/${verificationCode}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Certificate not found');
      }
      throw new Error(`Failed to fetch certificate: ${response.statusText}`);
    }

    return response.json();
  }

  // Share certificate (generate or get shareable link)
  async shareCertificate(certificateId: string): Promise<{ shareableUrl: string }> {
    const response = await fetch(`${this.baseUrl}/certificates/${certificateId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to generate shareable link: ${response.statusText}`);
    }

    return response.json();
  }

async getWorkshopById(workshopId: string): Promise<Workshop> {
  const response = await fetch(`${this.baseUrl}/workshop/${workshopId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch workshop: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Extract workshop from nested response and transform data
  const workshopData = data.workshop;
  
  // Transform Firestore timestamps to ISO strings
  const transformedWorkshop: Workshop = {
    ...workshopData,
    // Convert Firestore timestamp to ISO string
    scheduledDate: workshopData.scheduledDate._seconds 
      ? new Date(workshopData.scheduledDate._seconds * 1000).toISOString().split('T')[0]
      : workshopData.scheduledDate,
    
    // Map API fields to expected Workshop interface fields
    currentEnrollments: workshopData.enrolledCount || 0,
    waitlistCount: workshopData.waitlistCount || 0,
    
    // Add missing required fields with defaults
    shortDescription: workshopData.shortDescription || '',
    format: workshopData.format || 'online',
    duration: workshopData.duration || 120, // Default 2 hours
    language: workshopData.language || 'English',
    price: workshopData.price || 0,
    currency: workshopData.currency || 'USD',
    isRecorded: workshopData.isRecorded || false,
    isInteractive: workshopData.isInteractive || false,
    materialsProvided: workshopData.materialsProvided || false,
    autoApproveEnrollments: workshopData.autoApproveEnrollments !== false,
    requiresCompletion: workshopData.requiresCompletion || false,
    issuesCertificate: workshopData.autoGenerateCertificate || false,
    allowWaitlist: workshopData.allowWaitlist || false,
    
    // Transform timestamps
    createdAt: workshopData.createdAt._seconds 
      ? new Date(workshopData.createdAt._seconds * 1000).toISOString()
      : workshopData.createdAt || new Date().toISOString(),
    updatedAt: workshopData.updatedAt._seconds 
      ? new Date(workshopData.updatedAt._seconds * 1000).toISOString()
      : workshopData.updatedAt || new Date().toISOString(),
    
    // Add any missing optional fields
    requirements: workshopData.requirements || [],
    requiredTools: workshopData.requiredTools || [],
    targetAudience: workshopData.targetAudience || '',
    location: workshopData.location || '',
    enrollmentDeadline: workshopData.enrollmentDeadline || undefined,
    thumbnailUrl: workshopData.thumbnailUrl || '',
    bannerUrl: workshopData.bannerUrl || '',
    meetingPassword: workshopData.meetingPassword || '',
    creatorAvatar: workshopData.creatorAvatar || '',
    creatorBio: workshopData.creatorBio || '',
    publishedAt: workshopData.publishedAt || undefined,
    completedAt: workshopData.completedAt || undefined,
  };

  return transformedWorkshop;
}

  // Analytics and Statistics
  async getWorkshopStats(workshopId: string): Promise<{
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    waitlistCount: number;
    certificatesIssued: number;
  }> {
    const response = await fetch(`${this.baseUrl}/${workshopId}/stats`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch workshop stats: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserWorkshopStats(userId: string): Promise<{
    totalEnrollments: number;
    completedWorkshops: number;
    certificatesEarned: number;
    upcomingWorkshops: number;
  }> {
    const response = await fetch(`${this.baseUrl}/${userId}/stats`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user workshop stats: ${response.statusText}`);
    }

    return response.json();
  }
}

export const workshopService = new WorkshopService();
export default workshopService;