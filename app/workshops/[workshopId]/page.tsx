"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "../../context/AuthContext";
import { useWorkshop } from "../../../hooks/useWorkshops";
import { Workshop, WorkshopStatus } from "../../../types/workshop";
import WorkshopEditForm from "../../../components/WorkshopEditorForm";

export default function WorkshopDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const workshopId = params.workshopId as string;

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const {
    currentWorkshop,
    loading,
    error,
    enrollmentLoading,
    getWorkshop,
    enrollInWorkshop,
    unenrollFromWorkshop,
    publishWorkshop,
    updateWorkshop,
    isEnrolled,
    canEnroll,
    getWorkshopStatus,
    formatWorkshopDate,
    formatWorkshopTime,
    clearError,
  } = useWorkshop();

  // Load workshop data
  useEffect(() => {
    if (workshopId) {
      getWorkshop(workshopId);
    }
  }, [workshopId, getWorkshop]);

  const isCreator = user?.uid === currentWorkshop?.creatorId;
  const enrolled = currentWorkshop ? isEnrolled(currentWorkshop.id) : false;
  const canEnrollInWorkshop = currentWorkshop ? canEnroll(currentWorkshop) : false;
  const workshopStatus = currentWorkshop ? getWorkshopStatus(currentWorkshop) : '';

  const handleEnroll = async () => {
    if (!currentWorkshop) return;
    
    const success = await enrollInWorkshop(currentWorkshop.id);
    if (success) {
      // Workshop will be automatically updated through the hook
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

  const handleWorkshopUpdate = async (updatedWorkshop: Workshop) => {
    setIsEditing(false);
    // Workshop will be updated through the hook
  };

  const getStatusBadgeVariant = (status: WorkshopStatus) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const canJoinMeeting = () => {
    if (!currentWorkshop) return false;
    
    const now = new Date();
    const workshopStart = new Date(`${currentWorkshop.scheduledDate}T${currentWorkshop.startTime}`);
    const workshopEnd = new Date(`${currentWorkshop.scheduledDate}T${currentWorkshop.endTime}`);
    
    // Allow joining 15 minutes before start and during the workshop
    const joinWindow = new Date(workshopStart.getTime() - 15 * 60 * 1000);
    
    return enrolled && 
           currentWorkshop.status === 'published' && 
           now >= joinWindow && 
           now <= workshopEnd &&
           currentWorkshop.meetingLink;
  };

  if (loading && !currentWorkshop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading workshop...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentWorkshop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              Workshop Not Found
            </h3>
            <p className="text-slate-500 mb-4">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="mb-4"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/workshops")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workshops
          </Button>
        </div>

        {/* Workshop Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row items-start justify-between mb-6">
            <div className="flex-1 mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-4">
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
                  {currentWorkshop.category?.replace('_', ' ')}
                </Badge>
              </div>
              
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                {currentWorkshop.title}
              </h1>
              
              <p className="text-xl text-slate-600 mb-6">
                {currentWorkshop.shortDescription}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Calendar className="w-5 h-5" />
                  <span>{formatWorkshopDate(currentWorkshop)}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Clock className="w-5 h-5" />
                  <span>{formatWorkshopTime(currentWorkshop)}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Users className="w-5 h-5" />
                  <span>
                    {currentWorkshop.currentEnrollments}/{currentWorkshop.maxParticipants}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  {currentWorkshop.format === 'online' ? (
                    <Globe className="w-5 h-5" />
                  ) : currentWorkshop.format === 'in_person' ? (
                    <MapPin className="w-5 h-5" />
                  ) : (
                    <Video className="w-5 h-5" />
                  )}
                  <span className="capitalize">
                    {currentWorkshop.format?.replace('_', ' ')}
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
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {currentWorkshop.status === 'draft' && (
                    <Button
                      onClick={handlePublish}
                      disabled={loading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Publish Workshop
                    </Button>
                  )}
                  
                  <div className="text-center">
                    <Badge variant="outline" className="bg-blue-50">
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
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
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
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
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
                        <Badge variant="default" className="bg-emerald-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Enrolled
                        </Badge>
                      </div>
                      
                      {currentWorkshop.status === 'published' && !canJoinMeeting() && (
                        <p className="text-sm text-slate-600 text-center">
                          Meeting link will be available 15 minutes before start
                        </p>
                      )}
                      
                      <Button
                        onClick={handleUnenroll}
                        disabled={enrollmentLoading}
                        variant="outline"
                        className="w-full"
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

                  {currentWorkshop.status !== 'published' && (
                    <div className="text-center">
                      <Badge variant="secondary">
                        Workshop not yet published
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Workshop Creator Info */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center space-x-4">
              {currentWorkshop.creatorAvatar && (
                <img
                  src={currentWorkshop.creatorAvatar}
                  alt={currentWorkshop.creatorName}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-slate-900">
                  {currentWorkshop.creatorName}
                </p>
                <p className="text-sm text-slate-600">Workshop Creator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workshop Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            {isCreator && (
              <>
                <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
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
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Description</h3>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {currentWorkshop.description}
                    </p>
                  </div>
                </div>

                {currentWorkshop.learningObjectives && currentWorkshop.learningObjectives.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      What You'll Learn
                    </h3>
                    <ul className="space-y-2">
                      {currentWorkshop.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentWorkshop.tags && currentWorkshop.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentWorkshop.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
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
                      <label className="text-sm font-medium text-slate-600">Duration</label>
                      <p className="text-slate-900">
                        {currentWorkshop.duration} minutes
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Language</label>
                      <p className="text-slate-900">
                        {currentWorkshop.language || 'English'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Price</label>
                      <p className="text-slate-900 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {currentWorkshop.price === 0 ? 'Free' : `$${currentWorkshop.price}`}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Certificate</label>
                      <p className="text-slate-900 flex items-center">
                        {currentWorkshop.issuesCertificate ? (
                          <>
                            <Award className="w-4 h-4 mr-1 text-emerald-600" />
                            Available
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-1 text-slate-400" />
                            Not Available
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {currentWorkshop.location && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Location</label>
                      <p className="text-slate-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {currentWorkshop.location}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Enrollment Progress</span>
                      <span className="text-slate-900">
                        {currentWorkshop.currentEnrollments}/{currentWorkshop.maxParticipants}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (currentWorkshop.currentEnrollments / currentWorkshop.maxParticipants) * 100,
                            100
                          )}%`
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
                      <span className="text-slate-700">Recorded Session</span>
                      {currentWorkshop.isRecorded ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Interactive</span>
                      {currentWorkshop.isInteractive ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Materials Provided</span>
                      {currentWorkshop.materialsProvided ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Waitlist Available</span>
                      {currentWorkshop.allowWaitlist ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-400" />
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
                {currentWorkshop.prerequisites && currentWorkshop.prerequisites.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Prerequisites</h3>
                    <ul className="space-y-2">
                      {currentWorkshop.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-slate-700">{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentWorkshop.targetAudience && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Target Audience</h3>
                    <p className="text-slate-700">{currentWorkshop.targetAudience}</p>
                  </div>
                )}

                {currentWorkshop.requiredTools && currentWorkshop.requiredTools.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Required Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {currentWorkshop.requiredTools.map((tool, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-slate-50 rounded">
                          <Settings className="w-4 h-4 text-slate-600" />
                          <span className="text-slate-700">{tool}</span>
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
                <Card>
                  <CardHeader>
                    <CardTitle>Enrollment Management</CardTitle>
                    <CardDescription>
                      Manage participants and track enrollment status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">
                      Enrollment management features coming soon...
                    </p>
                  </CardContent>
                </Card>
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
                    <p className="text-slate-600">
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
                    <p className="text-slate-600">
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