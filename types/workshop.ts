export type WorkshopStatus = 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';

export type EnrollmentStatus = 'enrolled' | 'waitlisted' | 'completed' | 'cancelled' | 'no_show';

export type WorkshopCategory = 
  | 'data_analysis'
  | 'machine_learning'
  | 'programming'
  | 'statistics'
  | 'visualization'
  | 'databases'
  | 'cloud_computing'
  | 'web_development'
  | 'apis'
  | 'other';

export type WorkshopDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type WorkshopFormat = 'online' | 'in_person' | 'hybrid';

// Update the Workshop interface to include missing properties

export interface Workshop {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: WorkshopCategory;
  difficulty: WorkshopDifficulty;
  format: WorkshopFormat;
  
  // Creator information
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  creatorBio?: string;
  
  // Scheduling
  scheduledDate: string; // ISO date string
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  duration: number; // minutes
  timezone: string;
  
  // Capacity and enrollment
  maxParticipants: number;
  currentEnrollments: number;
  waitlistCount: number;
  enrollmentDeadline?: string; // ISO date string
  enrolledCount?: number; // Total enrolled users
  canEnroll?: boolean; // Whether the user can enroll
  remainingSpots?: number;
  
  // Content and requirements
  prerequisites?: string[];
  learningObjectives: string[];
  agenda?: WorkshopAgendaItem[];
  materials?: WorkshopMaterial[];
  requirements?: string[];
  requiredTools?: string[]; // ADD: Used in requirements tab
  targetAudience?: string; // ADD: Used in requirements tab
  
  // Media and resources
  thumbnailUrl?: string;
  bannerUrl?: string;
  slidesUrl?: string;
  recordingUrl?: string;
  meetingLink?: string;
  meetingPassword?: string;
  
  // Pricing (for future use)
  price: number; // 0 for free workshops
  currency: string;
  
  // Location (for in-person workshops)
  location?: string; // ADD: Used for in-person workshops
  
  // Status and metadata
  status: WorkshopStatus;
  tags: string[];
  language: string;
  isRecorded: boolean;
  isInteractive?: boolean; // ADD: Used in workshop features
  materialsProvided?: boolean; // ADD: Used in workshop features
  allowWaitlist: boolean;
  autoApproveEnrollments: boolean;
  sendReminders: boolean;
  
  // Completion and certification
  requiresCompletion: boolean;
  completionCriteria?: string[];
  certificateTemplate?: string;
  issuesCertificate: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  completedAt?: string;
  
  // Statistics
  stats?: {
    totalViews: number;
    totalEnrollments: number;
    completionRate: number;
    averageRating: number;
    totalRatings: number;
  };
}

export interface WorkshopAgendaItem {
  id: string;
  title: string;
  description?: string;
  startTime: string; // relative to workshop start (e.g., "00:15")
  duration: number; // minutes
  type: 'presentation' | 'demo' | 'exercise' | 'discussion' | 'break' | 'qa';
  resources?: string[];
}

export interface WorkshopMaterial {
  id: string;
  title: string;
  description?: string;
  type: 'document' | 'presentation' | 'code' | 'dataset' | 'video' | 'link';
  url: string;
  size?: number; // in bytes
  isRequired: boolean;
  downloadable: boolean;
}

export interface WorkshopEnrollment {
  id: string;
  workshopId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  
  // Enrollment details
  status: EnrollmentStatus;
  enrolledAt: string;
  waitlistPosition?: number;
  previousStatus?: EnrollmentStatus;
  
  // Attendance and completion
  attended: boolean;
  attendedAt?: string;
  completed: boolean;
  completedAt?: string;
  completionPercentage: number;
  
  // Feedback and rating
  rating?: number;
  feedback?: string;
  feedbackAt?: string;
  
  // Certificate
  certificateId?: string;
  certificateIssuedAt?: string;
  
  // Metadata
  enrollmentSource?: 'direct' | 'waitlist_promotion' | 'invitation';
  notes?: string;
  remindersSent: number;
  lastReminderAt?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopCertificate {
  id: string;
  workshopId: string;
  workshopTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  
  // Certificate details
  certificateNumber: string;
  issuedAt: Date;
  validUntil?: Date; // for certificates with expiration
  
  // Verification
  verificationCode: string;
  isVerified: boolean;
  verifiedAt?: Date;
  
  // Template and customization
  templateId?: string;
  customFields?: Record<string, any>;
  
  // File information
  pdfUrl?: string;
  imageUrl?: string;
  shareableUrl?: string;
  
  // Metadata
  issuerName: string;
  issuerTitle?: string;
  organizationName: string;
  organizationLogo?: string;
  
  // Skills and competencies (for future use)
  skillsAcquired?: string[];
  competencyLevel?: string;
  
  // Timestamps
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkshopFilters {
  status?: WorkshopStatus;
  category?: WorkshopCategory;
  difficulty?: WorkshopDifficulty;
  format?: WorkshopFormat;
  creatorId?: string;
  search?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  price?: 'free' | 'paid' | 'all';
  isRecorded?: boolean;
  hasAvailableSpots?: boolean;
  language?: string;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'scheduled_date' | 'title' | 'popularity' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface WorkshopSearchResult {
  workshops: Workshop[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
    limit: number;
  };
  filters: {
    categories: { value: WorkshopCategory; count: number; }[];
    difficulties: { value: WorkshopDifficulty; count: number; }[];
    formats: { value: WorkshopFormat; count: number; }[];
    tags: { value: string; count: number; }[];
  };
}

export interface WorkshopStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  waitlistCount: number;
  certificatesIssued: number;
  attendanceRate: number;
  completionRate: number;
  averageRating: number;
  totalRatings: number;
  noShowRate: number;
}

export interface UserWorkshopStats {
  totalEnrollments: number;
  completedWorkshops: number;
  certificatesEarned: number;
  upcomingWorkshops: number;
  averageRating: number;
  totalHoursLearned: number;
  skillsAcquired: string[];
}

export interface WorkshopFormData {
  title: string;
  description: string;
  shortDescription: string;
  category: WorkshopCategory;
  difficulty: WorkshopDifficulty;
  format: WorkshopFormat;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  maxParticipants: number;
  enrollmentDeadline?: string;
  prerequisites: string[];
  learningObjectives: string[];
  requirements: string[];
  requiredTools: string[]; // ADD: For required software/tools
  targetAudience?: string; // ADD: Who the workshop is for
  tags: string[];
  language: string;
  location?: string; // ADD: For in-person workshops
  isRecorded: boolean;
  isInteractive?: boolean; // ADD: Interactive workshop feature
  materialsProvided?: boolean; // ADD: Materials provided feature
  allowWaitlist: boolean;
  autoApproveEnrollments: boolean;
  sendReminders: boolean;
  requiresCompletion: boolean;
  issuesCertificate: boolean;
  price: number;
  currency: string;
  meetingLink?: string;
  meetingPassword?: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
}

// Workshop notification related types (extending your existing notification types)
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
  creatorId?: string;
  creatorName?: string;
  meetingLink?: string;
  certificateId?: string;
  changes?: string[];
  cancellationReason?: string;
}

// Validation schemas (for form validation)
export interface WorkshopValidationRules {
  title: {
    required: true;
    minLength: 5;
    maxLength: 100;
  };
  description: {
    required: true;
    minLength: 50;
    maxLength: 2000;
  };
  shortDescription: {
    maxLength: 200;
  };
  maxParticipants: {
    required: true;
    min: 1;
    max: 1000;
  };
  duration: {
    required: true;
    min: 15; // minimum 15 minutes
    max: 480; // maximum 8 hours
  };
  prerequisites: {
    maxItems: 10;
    maxLength: 100; // per item
  };
  learningObjectives: {
    required: true;
    minItems: 1;
    maxItems: 10;
    maxLength: 150; // per item
  };
  tags: {
    maxItems: 10;
    maxLength: 30; // per tag
  };
}

// Error types for better error handling
export class WorkshopError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'WorkshopError';
  }
}

export class EnrollmentError extends WorkshopError {
  constructor(message: string, code: string) {
    super(message, code, 409);
    this.name = 'EnrollmentError';
  }
}

export class CertificateError extends WorkshopError {
  constructor(message: string, code: string) {
    super(message, code, 422);
    this.name = 'CertificateError';
  }
}

// Helper types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
    limit: number;
  };
}

export interface WorkshopApiResponse extends ApiResponse<Workshop> {}
export interface WorkshopsApiResponse extends ApiResponse<Workshop[]> {}
export interface EnrollmentApiResponse extends ApiResponse<WorkshopEnrollment> {}
export interface CertificateApiResponse extends ApiResponse<WorkshopCertificate> {}