import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../app/context/AuthContext";
import workshopService from "../api/workshopApiLayer";
import {
  Workshop,
  WorkshopEnrollment,
  WorkshopCertificate,
  WorkshopStatus,
  EnrollmentStatus,
  WorkshopFilters,
  WorkshopSearchResult,
  WorkshopStats,
  UserWorkshopStats,
  WorkshopFormData,
  WorkshopError,
  EnrollmentError,
  CertificateError,
} from "../types/workshop";

interface UseWorkshopReturn {
  // Workshop data
  workshops: Workshop[];
  userCreatedWorkshops: Workshop[];
  currentWorkshop: Workshop | null;
  userEnrollments: WorkshopEnrollment[];
  userCertificates: WorkshopCertificate[];
  participants: any[]; // Add participants state
  
  // Computed values
  enrolledWorkshops: Workshop[];
  upcomingWorkshops: Workshop[];
  completedWorkshops: Workshop[];

  // Loading states
  loading: boolean;
  enrollmentLoading: boolean;
  certificateLoading: boolean;
  participantsLoading: boolean; // Add participants loading state

  // Error states
  error: string | null;
  enrollmentError: string | null;

  // Pagination and search
  hasMore: boolean;
  searchResult: WorkshopSearchResult | null;

  // Statistics
  workshopStats: WorkshopStats | null;
  userStats: UserWorkshopStats | null;

  // Workshop operations
  getWorkshops: (filters?: WorkshopFilters) => Promise<void>;
  getWorkshop: (workshopId: string) => Promise<Workshop | null>;
  createWorkshop: (workshopData: WorkshopFormData) => Promise<Workshop | null>;
  deleteWorkshop: (workshopId: string) => Promise<boolean>;
  getUserCreatedWorkshops: () => Promise<void>;
  publishWorkshop: (workshopId: string) => Promise<Workshop | null>;
  updateWorkshop: (
    workshopId: string,
    updates: Partial<Workshop>,
    changes?: string[]
  ) => Promise<Workshop | null>;

  // Enrollment operations
  enrollInWorkshop: (workshopId: string) => Promise<boolean>;
  unenrollFromWorkshop: (workshopId: string) => Promise<boolean>;
  getEnrollmentStatus: (
    workshopId: string
  ) => Promise<{ enrolled: boolean; status: EnrollmentStatus | null }>;
  getUserEnrollments: (status?: EnrollmentStatus) => Promise<void>;

  // Certificate operations
  getUserCertificates: () => Promise<void>;
  downloadCertificate: (certificateId: string) => Promise<string | null>;
  verifyCertificate: (
    verificationCode: string
  ) => Promise<WorkshopCertificate | null>;

  // Workshop management (for creators)
  getWorkshopEnrollments: (workshopId: string) => Promise<WorkshopEnrollment[]>;
  getWorkshopParticipants: (workshopId: string) => Promise<any[]>; // Add participants method
  markWorkshopCompleted: (
    workshopId: string,
    userId: string
  ) => Promise<boolean>;
  issueCertificate: (
    workshopId: string,
    userId: string
  ) => Promise<WorkshopCertificate | null>;
  cancelWorkshop: (workshopId: string, reason?: string) => Promise<boolean>;

  // Statistics
  getWorkshopStats: (workshopId: string) => Promise<void>;
  getUserWorkshopStats: () => Promise<void>;

  // Utility functions
  isEnrolled: (workshopId: string) => boolean;
  canEnroll: (workshop: Workshop) => boolean;
  getWorkshopStatus: (workshop: Workshop) => string;
  formatWorkshopDate: (workshop: Workshop) => string;
  formatWorkshopTime: (workshop: Workshop) => string;

  // Reset functions
  clearError: () => void;
  resetWorkshops: () => void;
  refreshWorkshop: (workshopId: string) => Promise<void>;
}

export const useWorkshop = (): UseWorkshopReturn => {
  // State management
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [currentWorkshop, setCurrentWorkshop] = useState<Workshop | null>(null);
  const [userCreatedWorkshops, setUserCreatedWorkshops] = useState<Workshop[]>(
    []
  );
  const [userEnrollments, setUserEnrollments] = useState<WorkshopEnrollment[]>(
    []
  );
  const [userCertificates, setUserCertificates] = useState<
    WorkshopCertificate[]
  >([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  // Error states
  const [error, setError] = useState<string | null>(null);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

  // Pagination and search
  const [hasMore, setHasMore] = useState(true);
  const [searchResult, setSearchResult] = useState<WorkshopSearchResult | null>(
    null
  );

  // Statistics
  const [workshopStats, setWorkshopStats] = useState<WorkshopStats | null>(
    null
  );
  const [userStats, setUserStats] = useState<UserWorkshopStats | null>(null);

  // Hooks
  const { user, isLoading: authLoading } = useAuth();

  // Helper function to handle errors
  const handleError = useCallback(
    (error: any, setter: (error: string | null) => void) => {
      console.error("Workshop operation error:", error);

      if (
        error instanceof WorkshopError ||
        error instanceof EnrollmentError ||
        error instanceof CertificateError
      ) {
        setter(error.message);
      } else if (error.message) {
        setter(error.message);
      } else {
        setter("An unexpected error occurred");
      }
    },
    []
  );

  // Workshop operations
  const getWorkshops = useCallback(
    async (filters?: WorkshopFilters) => {
      setLoading(true);
      setError(null);

      try {
        // Wait for user to be loaded, but don't require authentication for public workshops
        // If you want to require authentication, check if user loading is complete first
        if (!user?.uid) {
          // Instead of throwing an error, you can either:
          // Option 1: Show public workshops (if your backend supports it)
          // Option 2: Wait for authentication
          // Option 3: Show empty state

          console.log("User not authenticated, skipping workshop fetch");
          setWorkshops([]);
          return;
        }

        const result = await workshopService.getWorkshops(filters, user.uid);

        // Minimal transformation - trust backend data
        const transformedWorkshops = result.workshops.map((workshop) => ({
          ...workshop,
          // Ensure we have a currentEnrollments field for compatibility
          currentEnrollments:
            workshop.enrolledCount || workshop.currentEnrollments || 0,
        }));

        if (filters?.page && filters.page > 1) {
          setWorkshops((prev) => [...prev, ...transformedWorkshops]);
        } else {
          setWorkshops(transformedWorkshops);
        }

        setHasMore(result.pagination.hasMore);
        setSearchResult({
          ...result,
          workshops: transformedWorkshops,
          filters: {
            ...(filters || {}),
            categories: (result as any).filters?.categories ?? [],
            difficulties: (result as any).filters?.difficulties ?? [],
            formats: (result as any).filters?.formats ?? [],
            tags: (result as any).filters?.tags ?? [],
          },
        });
      } catch (error) {
        handleError(error, setError);
      } finally {
        setLoading(false);
      }
    },
    [handleError, user?.uid]
  );

  const getWorkshop = useCallback(
    async (workshopId: string): Promise<Workshop | null> => {
      setLoading(true);
      setError(null);

      try {
        const workshop = await workshopService.getWorkshopById(workshopId);

        // Minimal transformation
        const transformedWorkshop = {
          ...workshop,
          currentEnrollments:
            workshop.enrolledCount || workshop.currentEnrollments || 0,
        };

        setCurrentWorkshop(transformedWorkshop);
        return transformedWorkshop;
      } catch (error) {
        handleError(error, setError);
        setCurrentWorkshop(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleError]
  );

  const getWorkshopParticipants = useCallback(async (workshopId: string) => {
  if (!user?.uid) {
    throw new Error('User must be logged in to view participants');
  }

  setParticipantsLoading(true);
  setError(null);
  
  try {
    const participantList = await workshopService.getWorkshopParticipants(workshopId, user.uid);
    setParticipants(participantList);
    return participantList;
  } catch (error) {
    handleError(error, setError);
    return [];
  } finally {
    setParticipantsLoading(false);
  }
}, [user?.uid, handleError]);

  const createWorkshop = useCallback(
    async (workshopData: WorkshopFormData): Promise<Workshop | null> => {
      if (!user?.uid) {
        setError("You must be logged in to create a workshop");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const workshop = await workshopService.createWorkshop(
          {
            ...workshopData,
            creatorId: user.uid,
            creatorName: user.name || user.email || "Unknown",
            creatorAvatar: user.photoURL,
            currentEnrollments: 0,
            waitlistCount: 0,
            status: "draft" as WorkshopStatus,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          user.uid
        ); // Pass user.uid as second parameter

        setWorkshops((prev) => [workshop, ...prev]);
        return workshop;
      } catch (error) {
        handleError(error, setError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, handleError]
  );

  const updateWorkshop = useCallback(
    async (
      workshopId: string,
      updates: Partial<Workshop>,
      changes?: string[]
    ): Promise<Workshop | null> => {
      if (!user?.uid) {
        setError("You must be logged in to update a workshop");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const workshop = await workshopService.updateWorkshop(
          workshopId,
          updates,
          changes,
          user.uid
        );

        // Update workshop in local state
        setWorkshops((prev) =>
          prev.map((w) => (w.id === workshopId ? workshop : w))
        );

        // Update user created workshops
        setUserCreatedWorkshops((prev) =>
          prev.map((w) => (w.id === workshopId ? workshop : w))
        );

        if (currentWorkshop?.id === workshopId) {
          setCurrentWorkshop(workshop);
        }

        return workshop;
      } catch (error) {
        handleError(error, setError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, currentWorkshop, handleError]
  );

  const publishWorkshop = useCallback(
    async (workshopId: string): Promise<Workshop | null> => {
      if (!user?.uid) {
        setError("You must be logged in to publish a workshop");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const workshop = await workshopService.publishWorkshop(
          workshopId,
          user.uid
        );

        // Update workshop in local state
        setWorkshops((prev) =>
          prev.map((w) => (w.id === workshopId ? workshop : w))
        );

        // Update user created workshops
        setUserCreatedWorkshops((prev) =>
          prev.map((w) => (w.id === workshopId ? workshop : w))
        );

        if (currentWorkshop?.id === workshopId) {
          setCurrentWorkshop(workshop);
        }

        return workshop;
      } catch (error) {
        handleError(error, setError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, currentWorkshop, handleError]
  );

  const deleteWorkshop = useCallback(
    async (workshopId: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        await workshopService.deleteWorkshop(workshopId);

        setWorkshops((prev) => prev.filter((w) => w.id !== workshopId));

        if (currentWorkshop?.id === workshopId) {
          setCurrentWorkshop(null);
        }

        return true;
      } catch (error) {
        handleError(error, setError);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [currentWorkshop, handleError]
  );

  const getUserCreatedWorkshops = useCallback(async () => {
    if (!user?.uid) {
      setUserCreatedWorkshops([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await workshopService.getUserCreatedWorkshops(user.uid);
      setUserCreatedWorkshops(result.workshops);
    } catch (error) {
      handleError(error, setError);
      setUserCreatedWorkshops([]);
    } finally {
      setLoading(false);
    }
  }, [user, handleError]);

  // Enrollment operations
  const enrollInWorkshop = useCallback(
    async (workshopId: string): Promise<boolean> => {
      if (!user?.uid) {
        setEnrollmentError("You must be logged in to enroll");
        return false;
      }

      setEnrollmentLoading(true);
      setEnrollmentError(null);

      try {
        // The service handles notification creation
        await workshopService.enrollInWorkshop(workshopId, user.uid);

        // Refresh user enrollments
        await getUserEnrollments();

        // Update workshop enrollment count in local state
        setWorkshops((prev) =>
          prev.map((w) =>
            w.id === workshopId
              ? { ...w, currentEnrollments: w.currentEnrollments + 1 }
              : w
          )
        );

        if (currentWorkshop?.id === workshopId) {
          setCurrentWorkshop((prev) =>
            prev
              ? {
                  ...prev,
                  currentEnrollments: prev.currentEnrollments + 1,
                }
              : null
          );
        }

        return true;
      } catch (error) {
        handleError(error, setEnrollmentError);
        return false;
      } finally {
        setEnrollmentLoading(false);
      }
    },
    [user, currentWorkshop, handleError]
  );

  const unenrollFromWorkshop = useCallback(
    async (workshopId: string): Promise<boolean> => {
      if (!user?.uid) {
        setEnrollmentError("You must be logged in to unenroll");
        return false;
      }

      setEnrollmentLoading(true);
      setEnrollmentError(null);

      try {
        await workshopService.unenrollFromWorkshop(workshopId, user.uid);

        // Refresh user enrollments
        await getUserEnrollments();

        // Update workshop enrollment count in local state
        setWorkshops((prev) =>
          prev.map((w) =>
            w.id === workshopId
              ? {
                  ...w,
                  currentEnrollments: Math.max(0, w.currentEnrollments - 1),
                }
              : w
          )
        );

        if (currentWorkshop?.id === workshopId) {
          setCurrentWorkshop((prev) =>
            prev
              ? {
                  ...prev,
                  currentEnrollments: Math.max(0, prev.currentEnrollments - 1),
                }
              : null
          );
        }

        return true;
      } catch (error) {
        handleError(error, setEnrollmentError);
        return false;
      } finally {
        setEnrollmentLoading(false);
      }
    },
    [user, currentWorkshop, handleError]
  );

  const getEnrollmentStatus = useCallback(
    async (workshopId: string) => {
      if (!user?.uid) {
        return { enrolled: false, status: null };
      }

      try {
        return await workshopService.getEnrollmentStatus(workshopId, user.uid);
      } catch (error) {
        console.error("Failed to get enrollment status:", error);
        return { enrolled: false, status: null };
      }
    },
    [user]
  );

  const getUserEnrollments = useCallback(
    async (status?: EnrollmentStatus) => {
      if (!user?.uid) {
        setUserEnrollments([]);
        return;
      }

      try {
        const response = await workshopService.getUserEnrollments(
          user.uid,
          status
        );

        console.log("Raw backend response:", response);

        // Check if response has workshops property (nested structure)
        if (
          response &&
          typeof response === "object" &&
          "workshops" in response &&
          Array.isArray((response as any).workshops)
        ) {
          // Handle nested structure from backend
          const enrollments =
            (response as any).workshops.map((item: any) => ({
              id: item.enrollmentId,
              workshopId: item.enrollment.workshopId,
              userId: item.enrollment.userId,
              userName: item.enrollment.userName,
              userEmail: item.enrollment.userEmail,
              enrolledAt: item.enrollment.enrolledAt,
              status: item.enrollment.status,

              // Add missing required fields from WorkshopEnrollment interface
              userAvatar: item.enrollment.userAvatar || "",
              attended: item.enrollment.attended || false,
              attendedAt: item.enrollment.attendedAt,
              completed: item.enrollment.completed || false,
              completedAt: item.enrollment.completedAt,
              completionPercentage: item.enrollment.completionPercentage || 0,
              rating: item.enrollment.rating,
              feedback: item.enrollment.feedback,
              feedbackAt: item.enrollment.feedbackAt,
              certificateId: item.enrollment.certificateId,
              certificateIssuedAt: item.enrollment.certificateIssuedAt,
              enrollmentSource: item.enrollment.enrollmentSource || "direct",
              notes: item.enrollment.notes || "",
              remindersSent: item.enrollment.remindersSent || 0,
              lastReminderAt: item.enrollment.lastReminderAt,
              createdAt:
                item.enrollment.createdAt || item.enrollment.enrolledAt,
              updatedAt:
                item.enrollment.updatedAt || item.enrollment.enrolledAt,
              waitlistPosition: item.enrollment.waitlistPosition,
              previousStatus: item.enrollment.previousStatus,

              // Store workshop data for reference
              workshop: item.workshop,
            })) || [];

          console.log("Transformed enrollments:", enrollments);
          setUserEnrollments(enrollments);
        } else if (Array.isArray(response)) {
          // Handle direct array response
          setUserEnrollments(response);
        } else {
          console.warn("Unexpected response format:", response);
          setUserEnrollments([]);
        }
      } catch (error) {
        console.error("Failed to get user enrollments:", error);
        setUserEnrollments([]);
      }
    },
    [user]
  );

  // Certificate operations
  const getUserCertificates = useCallback(async () => {
    if (!user?.uid) {
      setUserCertificates([]);
      return;
    }

    setCertificateLoading(true);

    try {
      const certificates = await workshopService.getUserCertificates(user.uid);
      setUserCertificates(certificates);
    } catch (error) {
      console.error("Failed to get user certificates:", error);
      setUserCertificates([]);
    } finally {
      setCertificateLoading(false);
    }
  }, [user]);

  const downloadCertificate = useCallback(
    async (certificateId: string): Promise<string | null> => {
      try {
        const certificate = await workshopService.getCertificate(certificateId);
        return certificate.pdfUrl || certificate.shareableUrl || null;
      } catch (error) {
        console.error("Failed to download certificate:", error);
        return null;
      }
    },
    []
  );

  const verifyCertificate = useCallback(
    async (verificationCode: string): Promise<WorkshopCertificate | null> => {
      try {
        // This would be implemented in the service when you add certificate verification
        console.log("Verifying certificate:", verificationCode);
        return null;
      } catch (error) {
        console.error("Failed to verify certificate:", error);
        return null;
      }
    },
    []
  );

  // Workshop management operations (for workshop creators)
  const getWorkshopEnrollments = useCallback(
    async (workshopId: string): Promise<WorkshopEnrollment[]> => {
      try {
        return await workshopService.getWorkshopEnrollments(workshopId);
      } catch (error) {
        console.error("Failed to get workshop enrollments:", error);
        return [];
      }
    },
    []
  );

  const markWorkshopCompleted = useCallback(
    async (workshopId: string, userId: string): Promise<boolean> => {
      try {
        // The service handles notification creation
        await workshopService.markWorkshopCompleted(workshopId, userId);

        // Refresh user enrollments if it's the current user
        if (user?.uid === userId) {
          await getUserEnrollments();
        }

        return true;
      } catch (error) {
        console.error("Failed to mark workshop completed:", error);
        return false;
      }
    },
    [user, getUserEnrollments]
  );

  const issueCertificate = useCallback(
    async (
      workshopId: string,
      userId: string
    ): Promise<WorkshopCertificate | null> => {
      try {
        // The service handles notification creation
        const certificate = await workshopService.issueCertificate(
          workshopId,
          userId
        );

        // Refresh user certificates if it's for the current user
        if (user?.uid === userId) {
          await getUserCertificates();
        }

        return certificate;
      } catch (error) {
        console.error("Failed to issue certificate:", error);
        return null;
      }
    },
    [user, getUserCertificates]
  );

  const cancelWorkshop = useCallback(
    async (workshopId: string, reason?: string): Promise<boolean> => {
      try {
        // The service handles notification creation for all enrolled users
        await workshopService.cancelWorkshop(workshopId, reason);

        // Update workshop status in local state
        setWorkshops((prev) =>
          prev.map((w) =>
            w.id === workshopId
              ? { ...w, status: "cancelled" as WorkshopStatus }
              : w
          )
        );

        if (currentWorkshop?.id === workshopId) {
          setCurrentWorkshop((prev) =>
            prev
              ? {
                  ...prev,
                  status: "cancelled" as WorkshopStatus,
                }
              : null
          );
        }

        return true;
      } catch (error) {
        handleError(error, setError);
        return false;
      }
    },
    [currentWorkshop, handleError]
  );

  // Statistics
  const getWorkshopStats = useCallback(async (workshopId: string) => {
    try {
      const stats = await workshopService.getWorkshopStats(workshopId);
      // Ensure all required fields are present, calculate or default if missing
      setWorkshopStats({
        totalEnrollments: stats.totalEnrollments ?? 0,
        activeEnrollments: stats.activeEnrollments ?? 0,
        completedEnrollments: stats.completedEnrollments ?? 0,
        waitlistCount: stats.waitlistCount ?? 0,
        certificatesIssued: stats.certificatesIssued ?? 0,
        attendanceRate:
          "attendanceRate" in stats ? (stats as any).attendanceRate ?? 0 : 0,
        completionRate:
          "completionRate" in stats ? (stats as any).completionRate ?? 0 : 0,
        averageRating:
          "averageRating" in stats ? (stats as any).averageRating ?? 0 : 0,
        totalRatings:
          "totalRatings" in stats ? (stats as any).totalRatings ?? 0 : 0,
        noShowRate: "noShowRate" in stats ? (stats as any).noShowRate ?? 0 : 0,
      });
    } catch (error) {
      console.error("Failed to get workshop stats:", error);
    }
  }, []);

  const getUserWorkshopStats = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const stats = await workshopService.getUserWorkshopStats(user.uid);
      setUserStats({
        totalEnrollments: stats.totalEnrollments ?? 0,
        completedWorkshops: stats.completedWorkshops ?? 0,
        certificatesEarned: stats.certificatesEarned ?? 0,
        upcomingWorkshops: stats.upcomingWorkshops ?? 0,
        averageRating:
          "averageRating" in stats ? (stats as any).averageRating ?? 0 : 0,
        totalHoursLearned:
          "totalHoursLearned" in stats
            ? (stats as any).totalHoursLearned ?? 0
            : 0,
        skillsAcquired:
          "skillsAcquired" in stats ? (stats as any).skillsAcquired ?? [] : [],
      });
    } catch (error) {
      console.error("Failed to get user workshop stats:", error);
    }
  }, [user]);

  // Utility functions
  const isEnrolled = useCallback(
    (workshopId: string): boolean => {
      console.log("isEnrolled debug:", {
        workshopId,
        userEnrollments,
        userEnrollmentsType: typeof userEnrollments,
        isArray: Array.isArray(userEnrollments),
        length: userEnrollments?.length,
      });

      // Add validation to ensure userEnrollments is an array
      if (!Array.isArray(userEnrollments)) {
        return false;
      }

      const result = userEnrollments.some((enrollment) => {
        console.log("Checking enrollment:", {
          enrollmentWorkshopId: enrollment.workshopId,
          targetWorkshopId: workshopId,
          status: enrollment.status,
          matches: enrollment.workshopId === workshopId,
          statusValid: ["enrolled", "completed"].includes(enrollment.status),
        });

        return (
          enrollment.workshopId === workshopId &&
          ["enrolled", "completed"].includes(enrollment.status)
        );
      });

      console.log("isEnrolled result:", result);
      return result;
    },
    [userEnrollments]
  );

  const canEnroll = useCallback((workshop: Workshop): boolean => {
    // Just use the backend's decision
    return workshop.canEnroll ?? false;
  }, []);

  const getWorkshopStatus = useCallback((workshop: Workshop): string => {
    // If backend provides a status, use it
    if (workshop.status) {
      switch (workshop.status) {
        case "published":
          return "Upcoming";
        case "completed":
          return "Completed";
        case "cancelled":
          return "Cancelled";
        case "draft":
          return "Draft";
        default:
          return workshop.status;
      }
    }
    return "Unknown";
  }, []);

  const formatWorkshopDate = useCallback((workshop: Workshop): string => {
    return new Date(workshop.scheduledDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const formatWorkshopTime = useCallback((workshop: Workshop): string => {
    try {
      if (!workshop.startTime || !workshop.endTime) {
        return "Time TBD";
      }

      // Simple time formatting without complex parsing
      const formatTime = (time: string) => {
        // Handle various time formats
        const timeStr = time.includes(":") ? time : `${time}:00`;
        const [hours, minutes] = timeStr.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes || "00"} ${ampm}`;
      };

      return `${formatTime(workshop.startTime)} - ${formatTime(
        workshop.endTime
      )}`;
    } catch (error) {
      return `${workshop.startTime || "TBD"} - ${workshop.endTime || "TBD"}`;
    }
  }, []);

  // Reset functions
  const clearError = useCallback(() => {
    setError(null);
    setEnrollmentError(null);
  }, []);

  const resetWorkshops = useCallback(() => {
    setWorkshops([]);
    setCurrentWorkshop(null);
    setSearchResult(null);
    setHasMore(true);
    setError(null);
  }, []);

  const refreshWorkshop = useCallback(
    async (workshopId: string) => {
      await getWorkshop(workshopId);
    },
    [getWorkshop]
  );

  // Load user data on mount
  useEffect(() => {
    // Only load user data if user exists and auth is not loading
    if (!authLoading && user?.uid) {
      getUserEnrollments();
      getUserCertificates();
      getUserWorkshopStats();
    }
  }, [user?.uid, authLoading]);

  // Memoized computed values
  const enrolledWorkshops = useMemo(() => {
    if (!Array.isArray(userEnrollments)) return [];

    return userEnrollments
      .filter(
        (enrollment) =>
          enrollment.status &&
          ["enrolled", "completed"].includes(enrollment.status)
      )
      .map((enrollment) =>
        workshops.find((w) => w.id === enrollment.workshopId)
      )
      .filter(Boolean) as Workshop[];
  }, [userEnrollments, workshops]);

  const upcomingWorkshops = useMemo(() => {
    return enrolledWorkshops.filter(
      (workshop) =>
        workshop.status !== "cancelled" && workshop.status !== "completed"
    );
  }, [enrolledWorkshops]);

  const completedWorkshops = useMemo(() => {
    if (!Array.isArray(userEnrollments)) return [];

    return userEnrollments
      .filter((enrollment) => enrollment.status === "completed")
      .map((enrollment) =>
        workshops.find((w) => w.id === enrollment.workshopId)
      )
      .filter(Boolean) as Workshop[];
  }, [userEnrollments, workshops]);

  return {
    // Data
    workshops,
    currentWorkshop,
    userEnrollments,
    userCertificates,
    userCreatedWorkshops,
    getUserCreatedWorkshops,

    // Computed values
    enrolledWorkshops,
    upcomingWorkshops,
    completedWorkshops,

    // Loading states
    loading,
    enrollmentLoading,
    certificateLoading,

    // Error states
    error,
    enrollmentError,

    // Pagination and search
    hasMore,
    searchResult,

    // Statistics
    workshopStats,
    userStats,

    // Workshop operations
    getWorkshops,
    getWorkshop,
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
    publishWorkshop,

    // Enrollment operations
    enrollInWorkshop,
    unenrollFromWorkshop,
    getEnrollmentStatus,
    getUserEnrollments,
    participants,
    participantsLoading,
    getWorkshopParticipants,

    // Certificate operations
    getUserCertificates,
    downloadCertificate,
    verifyCertificate,

    // Workshop management
    getWorkshopEnrollments,
    markWorkshopCompleted,
    issueCertificate,
    cancelWorkshop,

    // Statistics
    getWorkshopStats,
    getUserWorkshopStats,

    // Utility functions
    isEnrolled,
    canEnroll,
    getWorkshopStatus,
    formatWorkshopDate,
    formatWorkshopTime,

    // Reset functions
    clearError,
    resetWorkshops,
    refreshWorkshop,
  };
};

export default useWorkshop;
