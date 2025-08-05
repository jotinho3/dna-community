"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  MessageCircle,
  ThumbsUp,
  CheckCircle,
  Send,
  User,
  Calendar,
  Tag,
  ArrowLeft,
  HelpCircle,
  Clock,
  Award,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { AnswerForm } from "@/components/AnswerForm";
import { Reactions } from "@/components/Reactions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Question {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorId: string;
  authorAvatar?: string;
  tags: string[];
  answersCount: number;
  reactions: any[];
  createdAt: string;
  isResolved: boolean;
  mentions?: any[];
}

interface Answer {
  id: string;
  content: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  reactions: any[];
  isAccepted: boolean;
  mentions?: any[];
}

export default function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Use React.use() to unwrap the Promise
  const { id: questionId } = React.use(params);

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Update questions and answers
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [q, a] = await Promise.all([
        fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
          }/api/qa/questions/${questionId}`
        ).then((res) => res.json()),
        fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
          }/api/qa/questions/${questionId}/answers`
        ).then((res) => res.json()),
      ]);
      setQuestion(q);
      setAnswers(a.answers || []);
    } catch {
      setError("Failed to load question");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!questionId) return;
    fetchData();
    // eslint-disable-next-line
  }, [questionId]);

  // Handler for question reactions
  const handleQuestionReacted = (newReactions: any[]) => {
    setQuestion((prev) => (prev ? { ...prev, reactions: newReactions } : prev));
  };

  // Handler for answer reactions
  const handleAnswerReacted = (answerId: string, newReactions: any[]) => {
    setAnswers((prev) =>
      prev.map((ans) =>
        ans.id === answerId ? { ...ans, reactions: newReactions } : ans
      )
    );
  };

const parseFirestoreTimestamp = (timestamp: any): Date => {
  if (timestamp && timestamp._seconds) {
    // Firestore timestamp with _seconds and _nanoseconds
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

  // Accept answer function
  const handleAcceptAnswer = async (answerId: string) => {
    if (!user?.uid || !question) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/qa/${
          user.uid
        }/answers/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.id,
            answerId: answerId,
          }),
        }
      );

      // Refresh answers
      fetchData();
    } catch (error) {
      console.error("Failed to accept answer:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading question...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {error || "Question not found"}
            </h2>
            <p className="text-slate-600 mb-4">
              The question you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild variant="outline">
              <Link href="/questions">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Questions
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const isQuestionOwner = user?.uid === question.authorId;
  const acceptedAnswer = answers.find((answer) => answer.isAccepted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/questions">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Questions
                </Link>
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              {question.isResolved && (
                <Badge className="bg-emerald-100 text-emerald-700">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Solved
                </Badge>
              )}
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <MessageCircle className="w-4 h-4" />
                <span>{answers.length} answers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Question Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ChevronUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Score</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {(question.reactions?.filter((r) => r.type === "upvote")
                      .length || 0) -
                      (question.reactions?.filter((r) => r.type === "downvote")
                        .length || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ThumbsUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Reactions</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {question.reactions?.length || 0}
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
                  <p className="text-sm text-slate-600">Status</p>
                  <p className="text-lg font-bold text-slate-900">
                    {question.isResolved ? "Solved" : "Open"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Asked</p>
                 <p className="text-sm font-bold text-slate-900">
  {parseFirestoreTimestamp(question.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}
</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Question Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="mb-8 shadow-lg border-emerald-100">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl text-slate-800 mb-4">
                    {question.title}
                  </CardTitle>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {question.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {question.isResolved && (
                  <CheckCircle className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Question Content */}
              <div className="prose prose-slate max-w-none">
                <div className="text-slate-700 whitespace-pre-line text-lg leading-relaxed">
                  {question.content}
                </div>
              </div>

              {/* Author and Date Info */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={question.authorAvatar}
                      alt={question.authorName}
                    />
                    <AvatarFallback>
                      {question.authorName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900">
                      {question.authorName}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                    <span>
  Asked on{" "}
  {parseFirestoreTimestamp(question.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  )}
</span>
                    </div>
                  </div>
                </div>

                {/* Just the Reactions component - remove the thumbs up display */}
                <Reactions
                  targetId={question.id}
                  targetType="question"
                  reactions={question.reactions}
                  onReacted={handleQuestionReacted}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Accepted Answer */}
        {acceptedAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-8"
          >
            <Card className="border-emerald-200 bg-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-700">
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Accepted Answer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="prose prose-slate max-w-none">
                    <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                      {acceptedAnswer.content}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-emerald-200">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={acceptedAnswer.authorAvatar}
                          alt={acceptedAnswer.authorName}
                        />
                        <AvatarFallback className="text-xs">
                          {acceptedAnswer.authorName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">
                          {acceptedAnswer.authorName}
                        </p>
                        <p className="text-sm text-slate-600">
                          {new Date(
                            acceptedAnswer.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <Reactions
                      targetId={acceptedAnswer.id}
                      targetType="answer"
                      reactions={acceptedAnswer.reactions}
                      onReacted={(newReactions) =>
                        handleAnswerReacted(acceptedAnswer.id, newReactions)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Other Answers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-700">
                <MessageCircle className="w-6 h-6 mr-2" />
                {acceptedAnswer ? "Other Answers" : "Answers"} (
                {answers.filter((a) => !a.isAccepted).length})
              </CardTitle>
              {answers.length === 0 && (
                <CardDescription>
                  Be the first to answer this question and help the community!
                </CardDescription>
              )}
            </CardHeader>

            <CardContent>
              {answers.filter((answer) => !answer.isAccepted).length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">
                    {acceptedAnswer ? "No other answers yet" : "No answers yet"}
                  </h3>
                  <p className="text-slate-500">
                    Be the first to share your knowledge and help solve this
                    question.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <AnimatePresence>
                    {answers
                      .filter((answer) => !answer.isAccepted)
                      .map((answer, index) => (
                        <motion.div
                          key={answer.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          className="border border-slate-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow"
                        >
                          {/* Accept Answer Button */}
                          {isQuestionOwner && !question.isResolved && (
                            <div className="mb-4 flex justify-end">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleAcceptAnswer(answer.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Accept Answer
                              </Button>
                            </div>
                          )}

                          {/* Answer Content */}
                          <div className="prose prose-slate max-w-none mb-4">
                            <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                              {answer.content}
                            </div>
                          </div>

                          {/* Answer Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={answer.authorAvatar} 
                                  alt={answer.authorName} 
                                />
                                <AvatarFallback className="text-xs">
                                  {answer.authorName 
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-slate-900">
                                  {answer.authorName} 
                                </p>
                                <p className="text-sm text-slate-600">
                                  {new Date(
                                    answer.createdAt
                                  ).toLocaleDateString()}{" "}

                                </p>
                              </div>
                            </div>

                            {/* Fixed Reactions to use answer data */}
                            <Reactions
                              targetId={answer.id} // Changed from question.id
                              targetType="answer" // Changed from "question"
                              reactions={answer.reactions} // Changed from question.reactions
                              onReacted={(newReactions) =>
                                handleAnswerReacted(answer.id, newReactions)
                              }
                            />
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Answer Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card className="shadow-lg border-emerald-100">
            <CardHeader>
              <CardTitle className="flex items-center text-emerald-700">
                <Send className="w-6 h-6 mr-2" />
                Share Your Answer
              </CardTitle>
              <CardDescription>
                Help solve this question by sharing your knowledge and
                experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnswerForm questionId={question.id} onSuccess={fetchData} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
