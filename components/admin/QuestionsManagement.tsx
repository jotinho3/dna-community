"use client";

import React, { useEffect, useState } from "react";
import {
  HelpCircle,
  Search,
  Filter,
  Eye,
  Trash2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  User,
  Tag,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Users,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface Question {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string; // Changed from 'description' to 'content'
  category?: string;
  tags: string[];
  status?: string;
  createdAt: string;
  updatedAt: string;
  isResolved: boolean;
  viewsCount: number; // Changed from 'viewCount' to 'viewsCount'
  upvotes?: number;
  downvotes?: number;
  answersCount: number;
  reactions?: any[];
  mentions?: any[];
}

interface Answer {
  id: string;
  questionId: string;
  authorId: string; // Changed from 'userId' to 'authorId'
  authorName: string; // Added authorName
  content: string;
  createdAt: string;
  isAccepted: boolean;
  upvotes: number;
  downvotes: number;
}

interface QuestionDetails extends Question {
  answers: Answer[];
}

interface QuestionsResponse {
  questions: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    status: string | null;
    category: string | null;
    userId: string | null;
    search: string | null;
    startDate: string | null;
    endDate: string | null;
  };
}

interface QuestionsStats {
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  stats: {
    totalQuestions: number;
    totalAnswers: number;
    answeredQuestions: number;
    unansweredQuestions: number;
    averageAnswersPerQuestion: number;
    questionsByCategory: Record<string, number>;
    questionsByStatus: Record<string, number>;
    questionsByDay: Record<string, number>;
    mostActiveAskers: Array<{
      authorName: string; // Changed from userName to authorName
      questionCount: number;
    }>;
  };
}

export const QuestionsManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuestionsResponse | null>(null);
  const [stats, setStats] = useState<QuestionsStats | null>(null);
  const [selectedQuestion, setSelectedQuestion] =
    useState<QuestionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    userId: "",
    search: "",
    startDate: "",
    endDate: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
  });

  const [statsPeriod, setStatsPeriod] = useState("30d");

  const fetchQuestions = async (page = 1, newFilters = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      // Add filters to query params
      if (newFilters.status) queryParams.append("status", newFilters.status);
      if (newFilters.category)
        queryParams.append("category", newFilters.category);
      if (newFilters.userId) queryParams.append("userId", newFilters.userId);
      if (newFilters.search) queryParams.append("search", newFilters.search);
      if (newFilters.startDate)
        queryParams.append("startDate", newFilters.startDate);
      if (newFilters.endDate) queryParams.append("endDate", newFilters.endDate);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/admin/questions?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.uid}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();
      setQuestions(data);
      setPagination((prev) => ({ ...prev, page }));
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      toast({
        title: "Erro",
        description: "Failed to load questions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (period = statsPeriod) => {
    setStatsLoading(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/admin/questions/stats?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.uid}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch question stats:", error);
      toast({
        title: "Erro",
        description: "Failed to load question statistics",
        variant: "destructive",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchQuestionDetails = async (questionId: string) => {
    setDetailsLoading(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/admin/questions/${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser?.uid}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch question details");
      }

      const data = await response.json();
      setSelectedQuestion(data.question);
    } catch (error) {
      console.error("Failed to fetch question details:", error);
      toast({
        title: "Erro",
        description: "Failed to load question details",
        variant: "destructive",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    setDeleteLoading(questionId);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
        }/api/admin/questions/${questionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${currentUser?.uid}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      const data = await response.json();

      toast({
        title: "Sucesso",
        description: `Question "${data.questionTitle}" deleted successfully`,
      });

      // Refresh questions list
      fetchQuestions(pagination.page, filters);
    } catch (error) {
      console.error("Failed to delete question:", error);
      toast({
        title: "Erro",
        description: "Failed to delete question",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchQuestions();
      fetchStats();
    }
  }, [currentUser]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (key !== "search") {
      fetchQuestions(1, newFilters);
    }
  };

  const handleSearch = () => {
    fetchQuestions(1, filters);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "answered":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "closed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-700";
      case "answered":
        return "bg-green-100 text-green-700";
      case "closed":
        return "bg-red-100 text-red-700";
      case "resolved":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "tech":
        return "bg-purple-100 text-purple-700";
      case "career":
        return "bg-orange-100 text-orange-700";
      case "general":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const QuestionDetailDialog = ({ question }: { question: Question }) => {
    const [open, setOpen] = useState(false);

    const handleOpenChange = async (isOpen: boolean) => {
      setOpen(isOpen);
      if (isOpen) {
        await fetchQuestionDetails(question.id);
      }
    };

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5" />
              <span>Question Details</span>
            </DialogTitle>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : selectedQuestion && selectedQuestion.id === question.id ? (
            <div className="space-y-6">
              {/* Question Info */}
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {selectedQuestion.title}
                    </h3>
                    <div className="flex items-center space-x-3 mb-3">
                      <Badge
                        className={getStatusColor(
                          selectedQuestion.status || "open"
                        )}
                      >
                        {getStatusIcon(selectedQuestion.status || "open")}
                        <span className="ml-1 capitalize">
                          {selectedQuestion.status || "open"}
                        </span>
                      </Badge>
                      {selectedQuestion.category && (
                        <Badge
                          className={getCategoryColor(
                            selectedQuestion.category
                          )}
                        >
                          {selectedQuestion.category}
                        </Badge>
                      )}
                      <span className="text-sm text-slate-500">
                        {formatDate(selectedQuestion.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-700 mb-4 whitespace-pre-wrap">
                  {selectedQuestion.content}
                </p>

                {selectedQuestion.tags && selectedQuestion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedQuestion.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{selectedQuestion.viewsCount || 0} views</span>
                  </div>
                  {selectedQuestion.upvotes !== undefined && (
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{selectedQuestion.upvotes} upvotes</span>
                    </div>
                  )}
                  {selectedQuestion.downvotes !== undefined && (
                    <div className="flex items-center space-x-2">
                      <ThumbsDown className="w-4 h-4" />
                      <span>{selectedQuestion.downvotes} downvotes</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>{selectedQuestion.answersCount} answers</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {selectedQuestion.authorName?.charAt(0).toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {selectedQuestion.authorName || "Unknown User"}
                      </p>
                      <p className="text-xs text-slate-600">
                        {selectedQuestion.authorId}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedQuestion.isResolved
                          ? "Resolved"
                          : "Unresolved"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Answers */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">
                  Answers ({selectedQuestion.answers?.length || 0})
                </h4>

                {!selectedQuestion.answers ||
                selectedQuestion.answers.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">
                    No answers yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {selectedQuestion.answers.map((answer) => (
                      <div key={answer.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {answer.authorName?.charAt(0).toUpperCase() ||
                                  "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {answer.authorName || "Unknown User"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatDate(answer.createdAt)}
                              </p>
                            </div>
                          </div>
                          {answer.isAccepted && (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Accepted
                            </Badge>
                          )}
                        </div>

                        <p className="text-slate-700 mb-3 whitespace-pre-wrap">
                          {answer.content}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{answer.upvotes || 0}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsDown className="w-3 h-3" />
                            <span>{answer.downvotes || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              Failed to load question details
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions">Questions Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search questions..."
                      value={filters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                      className="pl-10"
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                </div>

                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="answered">Answered</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.category}
                  onValueChange={(value) =>
                    handleFilterChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  placeholder="Start Date"
                  value={filters.startDate}
                  onChange={(e) =>
                    handleFilterChange("startDate", e.target.value)
                  }
                />

                <Input
                  type="date"
                  placeholder="End Date"
                  value={filters.endDate}
                  onChange={(e) =>
                    handleFilterChange("endDate", e.target.value)
                  }
                />
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <Button onClick={handleSearch} size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      status: "",
                      category: "",
                      userId: "",
                      search: "",
                      startDate: "",
                      endDate: "",
                    });
                    fetchQuestions(1, {
                      status: "",
                      category: "",
                      userId: "",
                      search: "",
                      startDate: "",
                      endDate: "",
                    });
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchQuestions(pagination.page, filters)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>Questions</span>
                  {questions && (
                    <Badge variant="outline">
                      {questions.pagination.total} total
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : questions?.questions.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">
                    No questions found
                  </h3>
                  <p className="text-slate-500">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions?.questions.map((question) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge
                              className={getStatusColor(
                                question.status || "open"
                              )}
                            >
                              {getStatusIcon(question.status || "open")}
                              <span className="ml-1 capitalize">
                                {question.status || "open"}
                              </span>
                            </Badge>
                            {question.category && (
                              <Badge
                                className={getCategoryColor(question.category)}
                              >
                                {question.category}
                              </Badge>
                            )}
                            <span className="text-xs text-slate-500">
                              {formatDate(question.createdAt)}
                            </span>
                          </div>

                          <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                            {question.title}
                          </h3>

                          <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                            {question.content}
                          </p>

                          {question.tags && question.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {question.tags.slice(0, 3).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {question.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{question.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {question.authorName
                                      ?.charAt(0)
                                      .toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span>
                                  {question.authorName || "Unknown User"}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>{question.viewsCount || 0}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{question.answersCount}</span>
                              </div>
                              {question.upvotes !== undefined && (
                                <div className="flex items-center space-x-1">
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>{question.upvotes}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              <QuestionDetailDialog question={question} />

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={deleteLoading === question.id}
                                  >
                                    {deleteLoading === question.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                    ) : (
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Question
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this
                                      question? This action cannot be undone.
                                      All answers and related data will also be
                                      deleted.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteQuestion(question.id)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Pagination */}
                  {questions && questions.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-slate-600">
                        Page {questions.pagination.page} of{" "}
                        {questions.pagination.totalPages}
                        <span className="ml-2">
                          ({questions.pagination.total} total questions)
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            fetchQuestions(
                              questions.pagination.page - 1,
                              filters
                            )
                          }
                          disabled={!questions.pagination.hasPrevPage}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            fetchQuestions(
                              questions.pagination.page + 1,
                              filters
                            )
                          }
                          disabled={!questions.pagination.hasNextPage}
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Period Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Questions Analytics</span>
                </div>
                <Select
                  value={statsPeriod}
                  onValueChange={(value) => {
                    setStatsPeriod(value);
                    fetchStats(value);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
          </Card>

          {statsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Total Questions
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {stats.stats.totalQuestions}
                        </p>
                      </div>
                      <HelpCircle className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Total Answers
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {stats.stats.totalAnswers}
                        </p>
                      </div>
                      <MessageSquare className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Answer Rate
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {Math.round(
                            (stats.stats.answeredQuestions /
                              stats.stats.totalQuestions) *
                              100
                          )}
                          %
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-emerald-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">
                          Avg Answers/Question
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {stats.stats.averageAnswersPerQuestion.toFixed(1)}
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Questions by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Questions by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.stats.questionsByCategory).map(
                      ([category, count]) => (
                        <div
                          key={category}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <Badge className={getCategoryColor(category)}>
                              {category}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (count / stats.stats.totalQuestions) * 100
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Questions by Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Questions by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.stats.questionsByStatus).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(status)}
                            <span className="font-medium capitalize">
                              {status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${
                                    (count / stats.stats.totalQuestions) * 100
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-12 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Most Active Askers */}
           <Card>
  <CardHeader>
    <CardTitle>Most Active Question Askers</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {stats.stats.mostActiveAskers
        .slice(0, 10)
        .map((userStat, index) => (
          <div
            key={`${userStat.authorName}-${index}`} // Changed key to use authorName
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {userStat.authorName?.charAt(0).toUpperCase() || "U"} {/* Changed to authorName */}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {userStat.authorName || "Unknown User"} {/* Changed to authorName */}
                </p>
                <p className="text-sm text-slate-600">
                  {userStat.questionCount} questions asked
                </p>
              </div>
            </div>
            <Badge variant="outline">
              {userStat.questionCount} questions
            </Badge>
          </div>
        ))}
    </div>
  </CardContent>
</Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  No analytics data available
                </h3>
                <p className="text-slate-500">
                  Analytics data will appear here once there are questions to
                  analyze.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
