"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LiveIndicator from "../../../components/LiveIndicator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Globe,
  Video,
  Edit,
  Share2,
  BookOpen,
  Award,
  CheckCircle,
  XCircle,
  ExternalLink,
  ArrowLeft,
  Settings,
  Eye,
  FileText,
  Tag,
  DollarSign,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useWorkshop } from "../../../hooks/useWorkshops";
import { Workshop, WorkshopStatus } from "../../../types/workshop";
import WorkshopEditForm from "../../../components/WorkshopEditorForm";
import WorkshopEnrollmentTab from "../../../components/WorkshopEnrollmentTab";

export default function WorkshopDetailPage({
  params,
}: {
  params: Promise<{ workshopId: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();

  // Use React.use() to unwrap the Promise
  const { workshopId } = React.use(params);

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const {
    currentWorkshop,
    loading,
    error,
    enrollmentLoading,
    participants,
    participantsLoading,
    getWorkshop,
    enrollInWorkshop,
    unenrollFromWorkshop,
    publishWorkshop,
    updateWorkshop,
    getWorkshopParticipants,
    isEnrolled,
    canEnroll,
    getWorkshopStatus,
    formatWorkshopDate,
    formatWorkshopTime,
    clearError,
  } = useWorkshop();

  const isCreator = user?.uid === currentWorkshop?.creatorId;
  const enrolled = currentWorkshop ? isEnrolled(currentWorkshop.id) : false;
  const canEnrollInWorkshop = currentWorkshop
    ? canEnroll(currentWorkshop)
    : false;
  const workshopStatus = currentWorkshop
    ? getWorkshopStatus(currentWorkshop)
    : "";

    const parseFirestoreTimestamp = (timestamp: any): Date => {
  if (timestamp && timestamp._seconds) {
    // Firestore timestamp
    return new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
  } else if (typeof timestamp === 'string') {
    // ISO string
    return new Date(timestamp);
  } else if (timestamp instanceof Date) {
    // Already a Date object
    return timestamp;
  } else {
    // Fallback to current date
    console.warn('Unknown timestamp format:', timestamp);
    return new Date();
  }
};

const createWorkshopDateTime = (scheduledDate: any, time: string) => {
  // Handle Firestore timestamp format
  let date;
  if (scheduledDate && scheduledDate._seconds) {
    // Convert Firestore timestamp to Date
    date = new Date(scheduledDate._seconds * 1000 + (scheduledDate._nanoseconds || 0) / 1000000);
  } else if (typeof scheduledDate === 'string') {
    date = new Date(scheduledDate);
  } else {
    date = new Date(scheduledDate);
  }
  
  // Extract date components in UTC to avoid timezone conversion issues
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  
  // Parse time with error handling
  if (!time || typeof time !== 'string') {
    console.warn('Invalid time provided:', time);
    return new Date(year, month, day, 0, 0, 0, 0); // Default to midnight
  }
  
  const timeParts = time.split(':');
  if (timeParts.length !== 2) {
    console.warn('Invalid time format:', time);
    return new Date(year, month, day, 0, 0, 0, 0); // Default to midnight
  }
  
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes)) {
    console.warn('Invalid time values:', time);
    return new Date(year, month, day, 0, 0, 0, 0); // Default to midnight
  }
  
  // Create final datetime in local timezone
  const result = new Date(year, month, day, hours, minutes, 0, 0);
  
  console.log("=== createWorkshopDateTime DEBUG ===");
  console.log("Input scheduledDate:", scheduledDate);
  console.log("Input time:", time);
  console.log("Parsed date (UTC):", date.toISOString());
  console.log("UTC Date components:", { year, month, day });
  console.log("Final result:", result.toISOString());
  console.log("Final result (local):", result.toLocaleString());
  
  return result;
};

const hasWorkshopStarted = () => {
  if (!currentWorkshop || !currentWorkshop.startTime) return false;

  const now = new Date();
  const workshopStart = createWorkshopDateTime(
    currentWorkshop.scheduledDate, 
    currentWorkshop.startTime
  );

  console.log("=== hasWorkshopStarted DEBUG ===");
  console.log("Now:", now.toLocaleString());
  console.log("Now (ISO):", now.toISOString());
  console.log("Workshop Start:", workshopStart.toLocaleString());
  console.log("Workshop Start (ISO):", workshopStart.toISOString());
  console.log("Time difference (minutes):", (workshopStart.getTime() - now.getTime()) / (1000 * 60));
  console.log("Has Started:", now >= workshopStart);

  return now >= workshopStart;
};

const hasWorkshopOccurred = () => {
  if (!currentWorkshop || !currentWorkshop.endTime) return false;

  const now = new Date();
  const workshopEnd = createWorkshopDateTime(
    currentWorkshop.scheduledDate, 
    currentWorkshop.endTime
  );

  console.log("=== hasWorkshopOccurred DEBUG ===");
  console.log("Now:", now.toLocaleString());
  console.log("Workshop End:", workshopEnd.toLocaleString());
  console.log("Time difference (minutes):", (workshopEnd.getTime() - now.getTime()) / (1000 * 60));
  console.log("Has Occurred:", now > workshopEnd);

  return now > workshopEnd;
};

  const canEditWorkshop = () => {
    if (!currentWorkshop || !isCreator) return false;

    // Workshop cannot be edited if it has already started
    return !hasWorkshopStarted();
  };

const canJoinMeeting = () => {
  if (!currentWorkshop || !currentWorkshop.startTime || !currentWorkshop.endTime) return false;

  const now = new Date();
  const workshopStart = createWorkshopDateTime(
    currentWorkshop.scheduledDate, 
    currentWorkshop.startTime
  );
  const workshopEnd = createWorkshopDateTime(
    currentWorkshop.scheduledDate, 
    currentWorkshop.endTime
  );

  // Allow joining 15 minutes before start and during the workshop
  const joinWindow = new Date(workshopStart.getTime() - 15 * 60 * 1000);

  return (
    enrolled &&
    currentWorkshop.status === "published" &&
    now >= joinWindow &&
    now <= workshopEnd &&
    currentWorkshop.meetingLink
  );
};

// Check if workshop can be published
const canPublishWorkshop = () => {
  if (!currentWorkshop || !isCreator) return false;

    // Only draft workshops that haven't started can be published
    return currentWorkshop.status === "draft" && !hasWorkshopStarted();
  };

const isWorkshopLive = () => {
  if (!currentWorkshop || !currentWorkshop.startTime || !currentWorkshop.endTime) return false;

  const now = new Date();
  const workshopStart = createWorkshopDateTime(
    currentWorkshop.scheduledDate, 
    currentWorkshop.startTime
  );
  const workshopEnd = createWorkshopDateTime(
    currentWorkshop.scheduledDate, 
    currentWorkshop.endTime
  );

  return (
    now >= workshopStart &&
    now <= workshopEnd &&
    currentWorkshop.status === "published"
  );
};

const handleWorkshopUpdate = async (updatedWorkshop: Workshop) => {
  setIsEditing(false);
  // Immediately redirect to workshops page after successful update
  router.push('/workshops');
};


  // Load workshop data
useEffect(() => {
  if (workshopId && !currentWorkshop && !isEditing && !loading) {
    getWorkshopSafely(workshopId);
  }
}, [workshopId]);


  useEffect(() => {
    if (activeTab === "enrollments" && isCreator && workshopId) {
      getWorkshopParticipants(workshopId);
    }
  }, [activeTab, isCreator, workshopId, getWorkshopParticipants]);

  const handleEnroll = async () => {
    if (!currentWorkshop) return;

    const success = await enrollInWorkshop(currentWorkshop.id);
    if (success) {
      // Workshop will be automatically updated through the hook
    }
  };

  const getWorkshopSafely = async (id: string) => {
  try {
    await getWorkshop(id);
  } catch (error) {
    console.warn("Failed to fetch workshop, but this might be expected during navigation:", error);
    // Don't throw the error, just log it
  }
};

  const handleUnenroll = async () => {
    if (!currentWorkshop) return;

    const success = await unenrollFromWorkshop(currentWorkshop.id);
    if (success) {
      // Workshop will be automatically updated through the hook
    }
  };

  const handlePublish = async () => {
    if (!currentWorkshop) return;

    const success = await publishWorkshop(currentWorkshop.id);
    if (success) {
      // Workshop status will be updated automatically
    }
  };


  const getStatusBadgeVariant = (status: WorkshopStatus) => {
    switch (status) {
      case "published":
        return "default";
      case "draft":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "completed":
        return "outline";
      default:
        return "secondary";
    }
  };



  if (loading && !currentWorkshop) {
    return (
      <div className="min-h-screen bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-primary-700">Loading workshop...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentWorkshop) {
    return (
      <div className="min-h-screen bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary-700 mb-2">
              Workshop Not Found
            </h3>
            <p className="text-primary-600 mb-4">
              {error || "The workshop you're looking for doesn't exist or has been removed."}
            </p>
            <div className="space-x-2">
              <Button variant="outline" onClick={clearError}>
                Dismiss
              </Button>
              <Button onClick={() => router.push("/workshops")}>
                Browse Workshops
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing && isCreator) {
    return (
      <div className="min-h-screen bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="mb-4 border-primary-600 text-primary-700 hover:bg-primary-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Workshop
            </Button>
          </div>
          <WorkshopEditForm
            workshop={currentWorkshop}
            onWorkshopUpdated={handleWorkshopUpdate}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/workshops")}
            className="mb-4 border-primary-600 text-primary-700 hover:bg-primary-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workshops
          </Button>
        </div>

        {/* Workshop Header */}
        <div className="bg-white rounded-lg border border-primary-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start justify-between mb-6">
            <div className="flex-1 mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                {isWorkshopLive() && <LiveIndicator />}
                <Badge
                  variant={getStatusBadgeVariant(currentWorkshop.status)}
                  className="capitalize"
                >
                  {currentWorkshop.status}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {currentWorkshop.difficulty}
                </Badge>
                <Badge variant="secondary">
                  {currentWorkshop.category?.replace("_", " ")}
                </Badge>
              </div>

              <h1 className="text-4xl font-bold text-primary-900 mb-4">
                {currentWorkshop.title}
              </h1>

              <p className="text-xl text-primary-700 mb-6">
                {currentWorkshop.shortDescription}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2 text-primary-700">
                  <Calendar className="w-5 h-5" />
                  <span>{formatWorkshopDate(currentWorkshop)}</span>
                </div>
                <div className="flex items-center space-x-2 text-primary-700">
                  <Clock className="w-5 h-5" />
                  <span>{formatWorkshopTime(currentWorkshop)}</span>
                </div>
                <div className="flex items-center space-x-2 text-primary-700">
                  <Users className="w-5 h-5" />
                  <span>
                    {currentWorkshop.currentEnrollments}/
                    {currentWorkshop.maxParticipants}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-primary-700">
                  {currentWorkshop.format === "online" ? (
                    <Globe className="w-5 h-5" />
                  ) : currentWorkshop.format === "in_person" ? (
                    <MapPin className="w-5 h-5" />
                  ) : (
                    <Video className="w-5 h-5" />
                  )}
                  <span className="capitalize">
                    {currentWorkshop.format?.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 min-w-64">
              {/* Creator Actions */}
              {isCreator && (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      className="flex-1 border-primary-600 text-primary-700 hover:bg-primary-100"
                      disabled={!canEditWorkshop()}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="icon" className="border-primary-600 text-primary-700 hover:bg-primary-100">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {hasWorkshopStarted() && !hasWorkshopOccurred() && (
                    <div className="text-center">
                      <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Workshop is currently running - Cannot edit
                      </Badge>
                    </div>
                  )}

                  {hasWorkshopOccurred() && (
                    <div className="text-center">
                      <Badge
                        variant="outline"
                        className="bg-primary-50 text-primary-700"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Workshop has ended - No longer editable
                      </Badge>
                    </div>
                  )}

                  {canPublishWorkshop() && (
                    <Button
                      onClick={handlePublish}
                      disabled={loading}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-primary-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Publish Workshop
                    </Button>
                  )}

                  {currentWorkshop.status === "draft" &&
                    hasWorkshopStarted() && (
                      <div className="text-center">
                        <Badge
                          variant="outline"
                          className="bg-primary-50 text-primary-700"
                        >
                          Cannot publish - Workshop has already started
                        </Badge>
                      </div>
                    )}

                  <div className="text-center">
                    <Badge variant="outline" className="bg-blue-50 text-primary-700">
                      <UserCheck className="w-3 h-3 mr-1" />
                      You are the creator
                    </Badge>
                  </div>
                </div>
              )}

              {/* Participant Actions */}
              {!isCreator && (
                <div className="space-y-3">
                  {/* Join Meeting Button (Priority) */}
                  {canJoinMeeting() && (
                    <Button
                      asChild
                      className="w-full bg-primary-600 hover:bg-primary-700 text-primary-50"
                    >
                      <a
                        href={currentWorkshop.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Meeting
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  )}

                  {/* Enrollment Actions */}
                  {!enrolled && canEnrollInWorkshop && (
                    <Button
                      onClick={handleEnroll}
                      disabled={enrollmentLoading}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-primary-50"
                    >
                      {enrollmentLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Enroll Now
                        </>
                      )}
                    </Button>
                  )}

                  {enrolled && (
                    <div className="space-y-2">
                      <div className="text-center">
                        <Badge variant="default" className="bg-primary-600 text-primary-50">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Enrolled
                        </Badge>
                      </div>

                      {currentWorkshop.status === "published" &&
                        !canJoinMeeting() && (
                          <p className="text-sm text-primary-700 text-center">
                            Meeting link will be available 15 minutes before
                            start
                          </p>
                        )}

                      <Button
                        onClick={handleUnenroll}
                        disabled={enrollmentLoading}
                        variant="outline"
                        className="w-full border-primary-600 text-primary-700 hover:bg-primary-100"
                      >
                        {enrollmentLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Unenroll
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {currentWorkshop.status !== "published" && (
                    <div className="text-center">
                      <Badge variant="secondary" className="bg-primary-100 text-primary-700">
                        Workshop not yet published
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Workshop Creator Info */}
          <div className="border-t border-primary-200 pt-6">
            <div className="flex items-center space-x-4">
              {currentWorkshop.creatorAvatar && (
                <img
                  src={currentWorkshop.creatorAvatar}
                  alt={currentWorkshop.creatorName}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-primary-900">
                  {currentWorkshop.creatorName}
                </p>
                <p className="text-sm text-primary-700">Workshop Creator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workshop Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8 bg-primary-100 border-primary-200">
            <TabsTrigger value="overview" className="text-primary-700 data-[state=active]:bg-primary-600 data-[state=active]:text-primary-50">Overview</TabsTrigger>
            <TabsTrigger value="details" className="text-primary-700 data-[state=active]:bg-primary-600 data-[state=active]:text-primary-50">Details</TabsTrigger>
            <TabsTrigger value="requirements" className="text-primary-700 data-[state=active]:bg-primary-600 data-[state=active]:text-primary-50">Requirements</TabsTrigger>
            {isCreator && (
              <>
                <TabsTrigger value="enrollments" className="text-primary-700 data-[state=active]:bg-primary-600 data-[state=active]:text-primary-50">Enrollments</TabsTrigger>
                <TabsTrigger value="analytics" className="text-primary-700 data-[state=active]:bg-primary-600 data-[state=active]:text-primary-50">Analytics</TabsTrigger>
                <TabsTrigger value="settings" className="text-primary-700 data-[state=active]:bg-primary-600 data-[state=active]:text-primary-50">Settings</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>About This Workshop</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-3">
                    Description
                  </h3>
                  <div className="prose prose-primary max-w-none">
                    <p className="text-primary-700 whitespace-pre-wrap">
                      {currentWorkshop.description}
                    </p>
                  </div>
                </div>

                {currentWorkshop.learningObjectives &&
                  currentWorkshop.learningObjectives.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-primary-900 mb-3">
                        What You'll Learn
                      </h3>
                      <ul className="space-y-2">
                        {currentWorkshop.learningObjectives.map(
                          (objective, index) => (
                            <li
                              key={index}
                              className="flex items-start space-x-2"
                            >
                              <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                              <span className="text-primary-700">
                                {objective}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {currentWorkshop.tags && currentWorkshop.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900 mb-3">
                      Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentWorkshop.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="bg-primary-100 text-primary-700">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Workshop Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-primary-700">
                        Duration
                      </label>
                      <p className="text-primary-900">
                        {currentWorkshop.duration} minutes
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-primary-700">
                        Language
                      </label>
                      <p className="text-primary-900">
                        {currentWorkshop.language || "English"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-primary-700">
                        Price
                      </label>
                      <p className="text-primary-900 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {currentWorkshop.price === 0
                          ? "Free"
                          : `$${currentWorkshop.price}`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-primary-700">
                        Certificate
                      </label>
                      <p className="text-primary-900 flex items-center">
                        {currentWorkshop.issuesCertificate ? (
                          <>
                            <Award className="w-4 h-4 mr-1 text-primary-600" />
                            Available
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-1 text-primary-400" />
                            Not Available
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {currentWorkshop.location && (
                    <div>
                      <label className="text-sm font-medium text-primary-700">
                        Location
                      </label>
                      <p className="text-primary-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {currentWorkshop.location}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary-700">
                        Enrollment Progress
                      </span>
                      <span className="text-primary-900">
                        {currentWorkshop.currentEnrollments}/
                        {currentWorkshop.maxParticipants}
                      </span>
                    </div>
                    <div className="w-full bg-primary-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (currentWorkshop.currentEnrollments /
                              currentWorkshop.maxParticipants) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Workshop Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-primary-700">Recorded Session</span>
                      {currentWorkshop.isRecorded ? (
                        <CheckCircle className="w-5 h-5 text-primary-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-primary-400" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-primary-700">Interactive</span>
                      {currentWorkshop.isInteractive ? (
                        <CheckCircle className="w-5 h-5 text-primary-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-primary-400" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-primary-700">Materials Provided</span>
                      {currentWorkshop.materialsProvided ? (
                        <CheckCircle className="w-5 h-5 text-primary-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-primary-400" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-primary-700">Waitlist Available</span>
                      {currentWorkshop.allowWaitlist ? (
                        <CheckCircle className="w-5 h-5 text-primary-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-primary-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Requirements Tab */}
          <TabsContent value="requirements">
            <Card>
              <CardHeader>
                <CardTitle>Requirements & Preparation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentWorkshop.prerequisites &&
                  currentWorkshop.prerequisites.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-primary-900 mb-3">
                        Prerequisites
                      </h3>
                      <ul className="space-y-2">
                        {currentWorkshop.prerequisites.map((prereq, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2"
                          >
                            <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-primary-700">{prereq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {currentWorkshop.targetAudience && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary-900 mb-3">
                      Target Audience
                    </h3>
                    <p className="text-primary-700">
                      {currentWorkshop.targetAudience}
                    </p>
                  </div>
                )}

                {currentWorkshop.requiredTools &&
                  currentWorkshop.requiredTools.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-primary-900 mb-3">
                        Required Tools
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {currentWorkshop.requiredTools.map((tool, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 p-2 bg-primary-50 rounded"
                          >
                            <Settings className="w-4 h-4 text-primary-700" />
                            <span className="text-primary-700">{tool}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Creator-only tabs would go here */}
          {isCreator && (
            <>
              <TabsContent value="enrollments">
                <WorkshopEnrollmentTab
                  workshopId={workshopId}
                  participants={participants}
                  loading={participantsLoading}
                  onRefresh={() => getWorkshopParticipants(workshopId)}
                />
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Workshop Analytics</CardTitle>
                    <CardDescription>
                      Track performance and engagement metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-primary-700">
                      Analytics dashboard coming soon...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Workshop Settings</CardTitle>
                    <CardDescription>
                      Advanced workshop configuration and management
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-primary-700">
                      Advanced settings coming soon...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}