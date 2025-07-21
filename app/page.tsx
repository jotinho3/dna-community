"use client"

import { OnboardingModal } from "../components/OnboardingModal/OnboardingModal"
import { useOnboarding } from "@/hooks/useOnboarding"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Search,
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
  Bell,
  User,
  Settings,
  LogOut,
} from "lucide-react"
import { useAuth } from "./context/AuthContext"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { NewsCarousel } from "@/components/news-carousel"
;

export default function HomePage() {
  const { user, logout } = useAuth()
    const { showOnboarding, setShowOnboarding, loading } = useOnboarding()

  const categories = [
    { name: "Machine Learning", icon: Brain, count: "2.3k", color: "bg-emerald-100 text-emerald-700" },
    { name: "Data Science", icon: BarChart3, count: "1.8k", color: "bg-teal-100 text-teal-700" },
    { name: "SQL & Databases", icon: Database, count: "1.5k", color: "bg-cyan-100 text-cyan-700" },
    { name: "Python", icon: Code, count: "3.1k", color: "bg-orange-100 text-orange-700" },
    { name: "Analytics Tools", icon: TrendingUp, count: "987", color: "bg-amber-100 text-amber-700" },
    { name: "AI & Deep Learning", icon: Zap, count: "1.2k", color: "bg-emerald-100 text-emerald-700" },
  ]

  const questions = [
    {
      title: "What's the best approach to handle missing data in time series analysis?",
      author: "Sarah Chen",
      avatar: "SC",
      tags: ["Time Series", "Data Cleaning", "Python"],
      views: "2.3k",
      answers: 12,
      upvotes: 45,
      timeAgo: "2h ago",
    },
    {
      title: "How do you optimize SQL queries for large datasets in production?",
      author: "Mike Rodriguez",
      avatar: "MR",
      tags: ["SQL", "Performance", "Big Data"],
      views: "1.8k",
      answers: 8,
      upvotes: 32,
      timeAgo: "4h ago",
    },
    {
      title: "Best practices for feature engineering in machine learning pipelines?",
      author: "Alex Kumar",
      avatar: "AK",
      tags: ["Machine Learning", "Feature Engineering", "MLOps"],
      views: "3.1k",
      answers: 15,
      upvotes: 67,
      timeAgo: "6h ago",
    },
  ]

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">DataHub</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search questions, topics, or users..."
                  className="pl-10 bg-slate-50 border-slate-200 focus:bg-white"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <Link href="/ask">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Ask Question
                </Link>
              </Button>

              {user ? (
                <>
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                    <Link href="/workshops">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Workshops
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                    <Link href="/news">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      News
                    </Link>
                  </Button>

                  <Button variant="ghost" size="sm" className="relative" asChild>
                    <Link href="/notifications">
                      <Bell className="w-4 h-4" />
                      <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500" />
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700">{user.name}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/profile/${user.uid}`}>
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/workshops">
                          <BookOpen className="mr-2 h-4 w-4" />
                          My Workshops
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/news">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          News
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/notifications">
                          <Bell className="mr-2 h-4 w-4" />
                          Notifications
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/profile/edit">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                    <Link href="/workshops">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Workshops
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                    <Link href="/news">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      News
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/signin">Sign In</Link>
                  </Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                    <Link href="/signup">Join Community</Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* News Carousel Hero Section */}
      <section>
        <div className="max-w-full">
          <NewsCarousel />
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-8">Join the Leading Data Community</h2>

          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">50K+</div>
              <div className="text-slate-600">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600">25K+</div>
              <div className="text-slate-600">Questions Answered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-600">100+</div>
              <div className="text-slate-600">Expert Contributors</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <Users className="w-5 h-5 mr-2" />
              Join the Community
            </Button>
            <Button size="lg" variant="outline">
              <BookOpen className="w-5 h-5 mr-2" />
              Explore Topics
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Popular Topics</h2>
            <p className="text-slate-600">
              Explore discussions across different areas of data analytics and technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <category.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary">{category.count} questions</Badge>
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">{category.name}</h3>
                  <p className="text-sm text-slate-600">Join the discussion and share your expertise</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Questions */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">Recent Questions</h2>
              <p className="text-slate-600">Latest discussions from our community</p>
            </div>
            <Button variant="outline">
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="space-y-6">
            {questions.map((question, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700">{question.avatar}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 mb-2 hover:text-emerald-600 transition-colors">
                        {question.title}
                      </h3>

                      <div className="flex items-center text-sm text-slate-600 mb-3">
                        <span>Asked by {question.author}</span>
                        <span className="mx-2">•</span>
                        <span>{question.timeAgo}</span>
                      </div>

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
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {question.views} views
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join the Conversation?</h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Connect with data professionals, share your knowledge, and grow your career
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-50">
              <Star className="w-5 h-5 mr-2" />
              Start Contributing
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-emerald-600 bg-transparent"
            >
              Ask Your First Question
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">DataHub</span>
              </div>
              <p className="text-sm">
                The premier community for data professionals to share knowledge and grow together.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Community</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-emerald-400">
                    Questions
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-emerald-400">
                    Topics
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-emerald-400">
                    Users
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-emerald-400">
                    Leaderboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-emerald-400">
                    Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-emerald-400">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-emerald-400">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-emerald-400">
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-emerald-400">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-emerald-400">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-emerald-400">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-emerald-400">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 DataHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>

    <OnboardingModal 
        open={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
    
  </>
  )
}
