'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Loader2, 
  Search, 
  CheckCircle, 
  MessageCircle, 
  ThumbsUp,
  HelpCircle,
  Plus,
  TrendingUp,
  Clock,
  Filter,
  X,
  User
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface Question {
  id: string
  title: string
  authorName: string
  authorAvatar?: string
  tags: string[]
  answersCount: number
  reactions: any[]
  createdAt: string
  isResolved: boolean
}

export function QuestionsList() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [resolvedFilter, setResolvedFilter] = useState<"all" | "resolved" | "unresolved">("all")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  // ...existing code...
  
  // Fetch questions
  useEffect(() => {
    setLoading(true)
    setError(null)
    let url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/qa/questions?limit=10&page=${page}`
    if (search) url += `&search=${encodeURIComponent(search)}`
    if (tagFilter) url += `&tags=${encodeURIComponent(tagFilter)}`
    if (resolvedFilter === "resolved") url += `&resolved=true`
    if (resolvedFilter === "unresolved") url += `&resolved=false`
  
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (page === 1) {
          setQuestions(data.questions)
        } else {
          setQuestions(prev => [...prev, ...data.questions])
        }
        setHasMore(data.pagination?.hasMore)
      })
      .catch(() => setError("Failed to load questions"))
      .finally(() => setLoading(false))
    // eslint-disable-next-line
  }, [search, tagFilter, resolvedFilter, page])
  
  // ...existing code...
  // Filter questions based on tab
  const getFilteredQuestions = () => {
    switch (activeTab) {
      case "resolved":
        return questions.filter(q => q.isResolved)
      case "unresolved":
        return questions.filter(q => !q.isResolved)
      case "popular":
        return questions.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0))
      case "recent":
        return questions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      default:
        return questions
    }
  }

  // Unique tags for filter UI
  const allTags = Array.from(new Set(questions.flatMap(q => q.tags)))
  const popularTags = allTags.slice(0, 10) // Show top 10 tags

  // Get question stats
  const totalQuestions = questions.length
  const resolvedQuestions = questions.filter(q => q.isResolved).length
  const unresolvedQuestions = totalQuestions - resolvedQuestions

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold text-slate-800 mb-4">
                Community Q&A
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl">
                Get help from the community and share your knowledge with fellow developers
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                className=" bg-primary-600 hover:bg-primary-700"
              >
                <Link href="/questions/ask">
                  <Plus className="w-4 h-4 mr-2" />
                  Ask Question
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 rounded-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Questions</p>
                  <p className="text-2xl font-bold text-slate-900">{totalQuestions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Resolved</p>
                  <p className="text-2xl font-bold text-slate-900">{resolvedQuestions}</p>
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
                  <p className="text-sm text-slate-600">Pending</p>
                  <p className="text-2xl font-bold text-slate-900">{unresolvedQuestions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Search & Filter
            </CardTitle>
            <CardDescription>
              Find the questions you're looking for
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                className="pl-10 focus:ring-2 focus:ring-emerald-200"
                placeholder="Search questions by title, content, or tags..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            {/* Popular Tags */}
            {popularTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Popular Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={tagFilter === tag ? "default" : "secondary"}
                      className={`cursor-pointer transition-colors ${
                        tagFilter === tag 
                          ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                          : "hover:bg-emerald-50 hover:text-emerald-700"
                      }`}
                      onClick={() => {
                        setTagFilter(tagFilter === tag ? null : tag)
                        setPage(1)
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {tagFilter && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => { setTagFilter(null); setPage(1) }}
                      className="h-6"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="all">All Questions</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="unresolved">Unresolved</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          {/* All Tab Content */}
          <TabsContent value="all">
            <QuestionContent 
              questions={getFilteredQuestions()}
              loading={loading}
              error={error}
              hasMore={hasMore}
              onLoadMore={() => setPage(page + 1)}
            />
          </TabsContent>

          <TabsContent value="recent">
            <QuestionContent 
              questions={getFilteredQuestions()}
              loading={loading}
              error={error}
              hasMore={hasMore}
              onLoadMore={() => setPage(page + 1)}
            />
          </TabsContent>

          <TabsContent value="popular">
            <QuestionContent 
              questions={getFilteredQuestions()}
              loading={loading}
              error={error}
              hasMore={hasMore}
              onLoadMore={() => setPage(page + 1)}
            />
          </TabsContent>

          <TabsContent value="unresolved">
            <QuestionContent 
              questions={getFilteredQuestions()}
              loading={loading}
              error={error}
              hasMore={hasMore}
              onLoadMore={() => setPage(page + 1)}
            />
          </TabsContent>

          <TabsContent value="resolved">
            <QuestionContent 
              questions={getFilteredQuestions()}
              loading={loading}
              error={error}
              hasMore={hasMore}
              onLoadMore={() => setPage(page + 1)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Separate component for question content to avoid repetition
function QuestionContent({ 
  questions, 
  loading, 
  error, 
  hasMore, 
  onLoadMore 
}: {
  questions: Question[]
  loading: boolean
  error: string | null
  hasMore: boolean
  onLoadMore: () => void
}) {
  if (loading && questions.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading questions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <div className="text-red-600 mb-4">
          <HelpCircle className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium">Failed to load questions</p>
          <p className="text-sm text-slate-600 mt-1">{error}</p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Card>
    )
  }

  if (questions.length === 0) {
    return (
      <Card className="p-12 text-center">
        <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-600 mb-2">
          No questions found
        </h3>
        <p className="text-slate-500 mb-4">
          Be the first to ask a question in this category.
        </p>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
          <Link href="/ask">
            <Plus className="w-4 h-4 mr-2" />
            Ask First Question
          </Link>
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <AnimatePresence>
          {questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/questions/${question.id}`}>
                <Card className="hover:shadow-lg transition-all duration-200 hover:border-emerald-200 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between space-x-4">
                      {/* Question Content */}
                      <div className="flex-1 space-y-3">
                        {/* Title and Status */}
                        <div className="flex items-start space-x-2">
                          <h3 className="text-lg font-semibold text-slate-800 hover:text-emerald-600 transition-colors line-clamp-2">
                            {question.title}
                          </h3>
                          {question.isResolved && (
                            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {question.tags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="secondary"
                              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Author and Date */}
                        <div className="flex items-center space-x-3 text-sm text-slate-600">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={question.authorAvatar} alt={question.authorName} />
                              <AvatarFallback className="text-xs">
                                {question.authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span>by {question.authorName}</span>
                          </div>
                          <span className="text-slate-400">•</span>
                          <span>{new Date(question.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex flex-col items-end space-y-2 text-sm text-slate-600 min-w-[80px]">
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-medium">{question.answersCount}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium">{question.reactions?.length || 0}</span>
                        </div>
                        {question.isResolved && (
                          <Badge variant="default" className="bg-emerald-100 text-emerald-700 text-xs">
                            Solved
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-6">
          <Button 
            onClick={onLoadMore} 
            variant="outline"
            className="hover:bg-emerald-50 hover:border-emerald-200"
          >
            Load More Questions
          </Button>
        </div>
      )}

      {/* Loading More */}
      {loading && questions.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="flex items-center space-x-2 text-slate-600">
            <Loader2 className="animate-spin w-4 h-4" />
            <span>Loading more questions...</span>
          </div>
        </div>
      )}
    </div>
  )
}