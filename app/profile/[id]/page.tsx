"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Globe,
  Calendar,
  Award,
  MessageSquare,
  HelpCircle,
  ThumbsUp,
  Edit,
  Star,
  TrendingUp,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function ProfilePage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const isOwnProfile = user?.id === params.id

  // Mock user data - in real app, fetch based on params.id
  const profileUser = user || {
    id: params.id,
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    avatar: "SC",
    bio: "Senior Data Scientist with 8+ years of experience in machine learning, statistical analysis, and data visualization. Passionate about helping others learn data science.",
    title: "Senior Data Scientist at TechCorp",
    location: "Seattle, WA",
    website: "https://sarahchen.dev",
    joinedDate: "2022-03-15",
    reputation: 2450,
    questionsAsked: 45,
    answersGiven: 123,
    badges: ["Top Contributor", "ML Expert", "Python Guru", "Helpful Mentor"],
  }

  const recentQuestions = [
    {
      title: "Best practices for handling imbalanced datasets in classification?",
      tags: ["Machine Learning", "Classification", "Data Preprocessing"],
      upvotes: 23,
      answers: 8,
      timeAgo: "2 days ago",
    },
    {
      title: "How to optimize hyperparameters for deep learning models?",
      tags: ["Deep Learning", "Hyperparameter Tuning", "Neural Networks"],
      upvotes: 31,
      answers: 12,
      timeAgo: "1 week ago",
    },
  ]

  const recentAnswers = [
    {
      question: "What's the difference between supervised and unsupervised learning?",
      preview: "Great question! The main difference lies in whether you have labeled training data or not...",
      upvotes: 45,
      timeAgo: "3 days ago",
    },
    {
      question: "How to handle missing values in time series data?",
      preview: "There are several approaches depending on the nature of your missing data. For time series...",
      upvotes: 28,
      timeAgo: "5 days ago",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl font-bold">
                {profileUser.avatar}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">{profileUser.name}</h1>
                  {profileUser.title && <p className="text-lg text-slate-600 mt-1">{profileUser.title}</p>}
                </div>
                {isOwnProfile && (
                  <Button asChild className="mt-4 sm:mt-0">
                    <Link href="/profile/edit">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                )}
              </div>

              {profileUser.bio && <p className="text-slate-700 mt-4 max-w-2xl">{profileUser.bio}</p>}

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-600">
                {profileUser.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profileUser.location}
                  </div>
                )}
                {profileUser.website && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    <a
                      href={profileUser.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700"
                    >
                      {profileUser.website.replace("https://", "")}
                    </a>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined{" "}
                  {new Date(profileUser.joinedDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                  Reputation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {profileUser.reputation.toLocaleString()}
                </div>
                <p className="text-sm text-slate-600">Community points earned</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <HelpCircle className="w-4 h-4 mr-2 text-slate-500" />
                    <span className="text-sm">Questions Asked</span>
                  </div>
                  <span className="font-semibold">{profileUser.questionsAsked}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-slate-500" />
                    <span className="text-sm">Answers Given</span>
                  </div>
                  <span className="font-semibold">{profileUser.answersGiven}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2 text-amber-500" />
                  Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileUser.badges.map((badge, index) => (
                    <Badge key={index} variant="secondary" className="bg-amber-100 text-amber-700">
                      <Star className="w-3 h-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="questions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="answers">Answers</TabsTrigger>
              </TabsList>

              <TabsContent value="questions" className="space-y-4">
                {recentQuestions.map((question, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-slate-800 mb-3 hover:text-emerald-600 cursor-pointer">
                        {question.title}
                      </h3>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {question.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-slate-500">
                        <div className="flex items-center">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {question.upvotes}
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {question.answers} answers
                        </div>
                        <span>{question.timeAgo}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="answers" className="space-y-4">
                {recentAnswers.map((answer, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-slate-800 mb-2 hover:text-emerald-600 cursor-pointer">
                        {answer.question}
                      </h3>

                      <p className="text-slate-600 mb-4">{answer.preview}</p>

                      <div className="flex items-center space-x-6 text-sm text-slate-500">
                        <div className="flex items-center">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {answer.upvotes}
                        </div>
                        <span>{answer.timeAgo}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
