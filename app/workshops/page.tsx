"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  BookOpen,
  Plus,
  TrendingUp,
  Brain,
  Database,
  Code,
  BarChart3,
  Zap,
  Calendar,
  Users,
  Award,
  Clock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWorkshop } from "../../hooks/useWorkshops";
import { WorkshopFilters, WorkshopCategory } from "../../types/workshop";
import WorkshopList from "../../components/WorkshopList";
import WorkshopCreationForm from "../../components/WorkshopCreationForm";

export default function WorkshopsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const {
    workshops,
    userEnrollments,
    userCreatedWorkshops,
    getUserCreatedWorkshops,
    enrolledWorkshops,
    upcomingWorkshops,
    completedWorkshops,
    userStats,
    loading,
    error,
    getUserWorkshopStats,
  } = useWorkshop();

  // Load user stats on mount
  useEffect(() => {
    if (user?.uid) {
      getUserWorkshopStats();
      getUserCreatedWorkshops();
    }
  }, [user?.uid, getUserWorkshopStats, getUserCreatedWorkshops]);

  const categories = [
    { id: "all", name: "All Categories", icon: BookOpen, category: undefined },
    {
      id: "machine_learning",
      name: "Machine Learning",
      icon: Brain,
      category: "machine_learning" as WorkshopCategory,
    },
    {
      id: "data_analysis",
      name: "Data Analysis",
      icon: BarChart3,
      category: "data_analysis" as WorkshopCategory,
    },
    {
      id: "databases",
      name: "Databases",
      icon: Database,
      category: "databases" as WorkshopCategory,
    },
    {
      id: "programming",
      name: "Programming",
      icon: Code,
      category: "programming" as WorkshopCategory,
    },
    {
      id: "statistics",
      name: "Statistics",
      icon: TrendingUp,
      category: "statistics" as WorkshopCategory,
    },
    {
      id: "visualization",
      name: "Visualization",
      icon: Zap,
      category: "visualization" as WorkshopCategory,
    },
  ];

  const handleWorkshopCreated = (workshopId: string) => {
    setShowCreateForm(false);
    router.push(`/workshops/${workshopId}`);
  };

  const handleWorkshopSelect = (workshopId: string) => {
    router.push(`/workshops/${workshopId}`);
  };

  const getTabFilters = (tab: string): WorkshopFilters => {
    switch (tab) {
      case "published":
        return { status: "published" };
      case "upcoming":
        return {
          status: "published",
          startDate: new Date().toISOString().split("T")[0],
        };
      case "free":
        return { status: "published", price: "free" };
      case "recorded":
        return { status: "published", isRecorded: true };
      default:
        return { status: "published" };
    }
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(false)}
              className="mb-4"
            >
              ← Back to Workshops
            </Button>
          </div>

          <WorkshopCreationForm
            onWorkshopCreated={handleWorkshopCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold text-slate-800 mb-4">
                Data Science Workshops
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl">
                Level up your data skills with hands-on workshops taught by
                industry experts
              </p>
            </div>

            {user && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workshop
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Dashboard (if logged in) */}
        {user && userStats && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Your Workshop Journey
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">
                        Total Enrollments
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {userStats.totalEnrollments}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Completed</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {userStats.completedWorkshops}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Certificates</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {userStats.certificatesEarned}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Upcoming</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {userStats.upcomingWorkshops}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access to User's Workshops */}
            {upcomingWorkshops.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Your Upcoming Workshops
                  </CardTitle>
                  <CardDescription>
                    Workshops you're enrolled in that are starting soon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingWorkshops.slice(0, 3).map((workshop) => (
                      <div
                        key={workshop.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                        onClick={() => handleWorkshopSelect(workshop.id)}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">
                            {workshop.title}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(
                                workshop.scheduledDate
                              ).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {workshop.startTime}
                            </span>
                            <Badge variant="secondary" className="capitalize">
                              {workshop.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                  {upcomingWorkshops.length > 3 && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="ghost"
                        onClick={() => setActiveTab("my-enrollments")}
                      >
                        View All ({upcomingWorkshops.length})
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Category Filters */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Browse by Category
          </h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab("category");
                  // You could set a category filter here
                }}
                className="flex items-center hover:bg-emerald-50 hover:border-emerald-200"
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-8">
            <TabsTrigger value="all">All Workshops</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="free">Free</TabsTrigger>
            <TabsTrigger value="recorded">Recorded</TabsTrigger>
            {user && (
              <>
                <TabsTrigger value="my-enrollments">My Enrollments</TabsTrigger>
                <TabsTrigger value="my-workshops">My Workshops</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* All Workshops */}
          <TabsContent value="all">
            <WorkshopList
              initialFilters={getTabFilters("all")}
              onWorkshopSelect={handleWorkshopSelect}
              showFilters={true}
            />
          </TabsContent>

          {/* Upcoming Workshops */}
          <TabsContent value="upcoming">
            <WorkshopList
              initialFilters={getTabFilters("upcoming")}
              onWorkshopSelect={handleWorkshopSelect}
              showFilters={true}
            />
          </TabsContent>

          {/* Free Workshops */}
          <TabsContent value="free">
            <WorkshopList
              initialFilters={getTabFilters("free")}
              onWorkshopSelect={handleWorkshopSelect}
              showFilters={true}
            />
          </TabsContent>

          {/* Recorded Workshops */}
          <TabsContent value="recorded">
            <WorkshopList
              initialFilters={getTabFilters("recorded")}
              onWorkshopSelect={handleWorkshopSelect}
              showFilters={true}
            />
          </TabsContent>

          {/* User's Enrollments */}
          {user && (
            <TabsContent value="my-enrollments">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Your Enrolled Workshops
                  </h3>
                  <Badge variant="secondary">
                    {enrolledWorkshops.length} enrolled
                  </Badge>
                </div>

                {enrolledWorkshops.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">
                      No enrolled workshops
                    </h3>
                    <p className="text-slate-500 mb-4">
                      Start learning by enrolling in workshops that interest
                      you.
                    </p>
                    <Button
                      onClick={() => setActiveTab("all")}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Browse Workshops
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrolledWorkshops.map((workshop) => (
                      <Card
                        key={workshop.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleWorkshopSelect(workshop.id)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {workshop.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {workshop.shortDescription || workshop.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(
                                workshop.scheduledDate
                              ).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {workshop.startTime}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="capitalize">
                              {workshop.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              <Badge variant="outline">
                                {workshop.format?.replace("_", " ") ||
                                  "Not specified"}
                              </Badge>
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* User's Created Workshops */}
          {user && (
            <TabsContent value="my-workshops">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Workshops You Created
                  </h3>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Workshop
                  </Button>
                </div>

                {userCreatedWorkshops.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">
                      No workshops created yet
                    </h3>
                    <p className="text-slate-500 mb-4">
                      Share your knowledge by creating your first workshop.
                    </p>
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Workshop
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userCreatedWorkshops.map((workshop) => (
                      <Card
                        key={workshop.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleWorkshopSelect(workshop.id)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {workshop.title}
                            </CardTitle>
                            <Badge
                              variant={
                                workshop.status === "published"
                                  ? "default"
                                  : workshop.status === "draft"
                                  ? "secondary"
                                  : workshop.status === "cancelled"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="capitalize"
                            >
                              {workshop.status}
                            </Badge>
                          </div>
                          <CardDescription className="line-clamp-2">
                            {workshop.shortDescription || workshop.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(
                                workshop.scheduledDate
                              ).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {workshop.startTime}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="capitalize">
                                {workshop.difficulty}
                              </Badge>
                              <Badge variant="outline">
                                {workshop.format?.replace("_", " ") ||
                                  "Not specified"}
                              </Badge>
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                              <Users className="w-4 h-4 mr-1" />
                              {workshop.currentEnrollments}/
                              {workshop.maxParticipants}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {loading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading your workshops...</p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Category View */}
          <TabsContent value="category">
            <WorkshopList
              onWorkshopSelect={handleWorkshopSelect}
              showFilters={true}
            />
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && workshops.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading workshops...</p>
          </div>
        )}
      </div>
    </div>
  );
}
