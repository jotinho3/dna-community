"use client";

import { OnboardingModal } from "../components/OnboardingModal/OnboardingModal";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  TrendingUp,
  Users,
  MessageSquare,
  BookOpen,
  BarChart3,
  Database,
  Brain,
  Code,
  Zap,
  ArrowRight,
  Star,
  Eye,
  ThumbsUp,
  Loader2,
} from "lucide-react";
import { NewsCarousel } from "@/components/home/news-carousel";
import { useState, useEffect } from "react";
import Link from "next/link";

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

export default function HomePage() {
  const { showOnboarding, setShowOnboarding } = useOnboarding();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { name: "Machine Learning", icon: Brain, count: "2.3k", color: "bg-emerald-100 text-emerald-700" },
    { name: "Data Science", icon: BarChart3, count: "1.8k", color: "bg-teal-100 text-teal-700" },
    { name: "SQL & Databases", icon: Database, count: "1.5k", color: "bg-cyan-100 text-cyan-700" },
    { name: "Python", icon: Code, count: "3.1k", color: "bg-orange-100 text-orange-700" },
    { name: "Analytics Tools", icon: TrendingUp, count: "987", color: "bg-amber-100 text-amber-700" },
    { name: "AI & Deep Learning", icon: Zap, count: "1.2k", color: "bg-emerald-100 text-emerald-700" },
  ];

  // Fetch recent questions
  useEffect(() => {
    const fetchRecentQuestions = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetch(`${apiUrl}/api/qa/questions?limit=5&page=1&sort=newest`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching questions');
        console.error('Error fetching recent questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentQuestions();
  }, []);

  // Helper functions
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const getInitials = (name: string) => {
    return name.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTotalReactions = (reactions: any[]) => {
    return reactions?.length || 0;
  };

  return (
     <>
      <div className="min-h-screen bg-primary-50">
        {/* News Carousel Hero Section */}
        <section>
          <div className="max-w-full">
            <NewsCarousel />
          </div>
        </section>

        {/* Community Stats */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-primary-800 mb-8">Join the Leading Data Community</h2>

            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">50K+</div>
                <div className="text-primary-700">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-500">25K+</div>
                <div className="text-primary-700">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400">100+</div>
                <div className="text-primary-700">Expert Contributors</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary-600 hover:bg-primary-700 text-primary-50" asChild>
                <Link href="/signup">
                  <Users className="w-5 h-5 mr-2" />
                  Join the Community
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-600 text-primary-700 hover:bg-primary-100" asChild>
                <Link href="/questions">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Explore Topics
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary-800 mb-4">Popular Topics</h2>
              <p className="text-primary-700">
                Explore discussions across different areas of data analytics and technology
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer border-primary-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${category.color}`}>
                        <category.icon className="w-6 h-6" />
                      </div>
                      <Badge variant="secondary">{category.count} questions</Badge>
                    </div>
                    <h3 className="font-semibold text-primary-800 mb-2">{category.name}</h3>
                    <p className="text-sm text-primary-700">Join the discussion and share your expertise</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Questions */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-primary-800 mb-4">Recent Questions</h2>
                <p className="text-primary-700">Latest discussions from our community</p>
              </div>
              <Button variant="outline" className="border-primary-600 text-primary-700 hover:bg-primary-100" asChild>
                <Link href="/questions">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="border-primary-600 text-primary-700 hover:bg-primary-100"
                >
                  Try Again
                </Button>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-primary-200 mx-auto mb-4" />
                <p className="text-primary-700 mb-4">No questions yet</p>
                <Button asChild className="bg-primary-600 hover:bg-primary-700 text-primary-50">
                  <Link href="/ask">
                    Ask the First Question
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question) => (
                  <Card key={question.id} className="hover:shadow-md transition-shadow cursor-pointer border-primary-100">
                    <CardContent className="p-6">
                      <Link href={`/questions/${question.id}`}>
                        <div className="flex items-start space-x-4">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary-100 text-primary-700">
                              {getInitials(question.authorName)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <h3 className="font-semibold text-primary-800 mb-2 hover:text-primary-600 transition-colors">
                              {question.title}
                            </h3>

                            <div className="flex items-center text-sm text-primary-700 mb-3">
                              <span>Asked by {question.authorName}</span>
                              <span className="mx-2">•</span>
                              <span>{formatTimeAgo(question.createdAt)}</span>
                              {question.isResolved && (
                                <>
                                  <span className="mx-2">•</span>
                                  <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
                                    Resolved
                                  </Badge>
                                </>
                              )}
                            </div>

                            {/* Content preview */}
                            {question.content && (
                              <p className="text-sm text-primary-700 mb-3 line-clamp-2">
                                {question.content.substring(0, 150)}
                                {question.content.length > 150 ? '...' : ''}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2 mb-4">
                              {question.tags.slice(0, 3).map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {question.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{question.tags.length - 3} more
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-primary-500">
                              <div className="flex items-center">
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                {getTotalReactions(question.reactions)}
                              </div>
                              <div className="flex items-center">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                {question.answersCount} answers
                              </div>
                              {question.mentions && question.mentions.length > 0 && (
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  {question.mentions.length} mentions
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary-700 to-primary-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-primary-50 mb-4">Ready to Join the Conversation?</h2>
            <p className="text-primary-200 mb-8 text-lg">
              Connect with data professionals, share your knowledge, and grow your career
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary-50 text-primary-700 hover:bg-primary-100" asChild>
                <Link href="/questions">
                  <Star className="w-5 h-5 mr-2" />
                  Start Contributing
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-50 text-primary-50 hover:bg-primary-50 hover:text-primary-700 bg-transparent"
                asChild
              >
                <Link href="/ask">
                  Ask Your First Question
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <OnboardingModal 
        open={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    </>
  );
}