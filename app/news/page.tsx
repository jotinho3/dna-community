"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Clock,
  TrendingUp,
  Eye,
  Share,
  Bookmark,
  Calendar,
  Zap,
  Brain,
  Code,
  BarChart3,
  Database,
} from "lucide-react"
import Link from "next/link"

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("latest")

  const categories = [
    { id: "all", name: "All News", icon: TrendingUp },
    { id: "ai-ml", name: "AI & Machine Learning", icon: Brain },
    { id: "data-science", name: "Data Science", icon: BarChart3 },
    { id: "programming", name: "Programming", icon: Code },
    { id: "databases", name: "Databases", icon: Database },
    { id: "industry", name: "Industry News", icon: TrendingUp },
    { id: "tools", name: "Tools & Platforms", icon: Zap },
  ]

  const articles = [
    {
      id: "1",
      title: "OpenAI Releases GPT-5: Revolutionary Breakthrough in AI Reasoning",
      summary:
        "The latest language model shows unprecedented capabilities in mathematical reasoning and code generation, setting new benchmarks across multiple domains.",
      content:
        "OpenAI has officially announced the release of GPT-5, marking a significant leap forward in artificial intelligence capabilities...",
      category: "ai-ml",
      author: "Dr. Sarah Chen",
      authorAvatar: "SC",
      image: "/placeholder.svg?height=300&width=500",
      readTime: "5 min read",
      publishedAt: "2024-01-15T10:00:00Z",
      views: 15420,
      trending: true,
      featured: true,
      tags: ["OpenAI", "GPT-5", "AI", "Machine Learning", "Natural Language Processing"],
    },
    {
      id: "2",
      title: "Google's New Quantum Computer Achieves 1000-Qubit Milestone",
      summary:
        "Breakthrough in quantum computing could revolutionize data processing and machine learning algorithms within the next decade.",
      content:
        "Google's quantum computing division has reached a historic milestone with their latest quantum processor...",
      category: "industry",
      author: "Mike Rodriguez",
      authorAvatar: "MR",
      image: "/placeholder.svg?height=300&width=500",
      readTime: "7 min read",
      publishedAt: "2024-01-15T08:00:00Z",
      views: 12350,
      trending: true,
      featured: true,
      tags: ["Google", "Quantum Computing", "Technology", "Innovation"],
    },
    {
      id: "3",
      title: "Python 3.13 Released with Major Performance Improvements",
      summary:
        "New version includes significant speed enhancements, better memory management, and improved data science libraries integration.",
      content:
        "The Python Software Foundation has released Python 3.13, bringing substantial performance improvements...",
      category: "programming",
      author: "Alex Kumar",
      authorAvatar: "AK",
      image: "/placeholder.svg?height=300&width=500",
      readTime: "4 min read",
      publishedAt: "2024-01-14T16:00:00Z",
      views: 8920,
      trending: false,
      featured: false,
      tags: ["Python", "Programming", "Performance", "Data Science"],
    },
    {
      id: "4",
      title: "Meta's New Data Center Uses 100% Renewable Energy for AI Training",
      summary:
        "Sustainable AI infrastructure becomes reality as tech giants invest heavily in green computing solutions.",
      content: "Meta has unveiled its latest data center facility designed specifically for AI model training...",
      category: "industry",
      author: "Emily Zhang",
      authorAvatar: "EZ",
      image: "/placeholder.svg?height=300&width=500",
      readTime: "6 min read",
      publishedAt: "2024-01-14T12:00:00Z",
      views: 6780,
      trending: false,
      featured: false,
      tags: ["Meta", "Sustainability", "Data Centers", "Green Computing"],
    },
    {
      id: "5",
      title: "Real-Time Analytics Market Expected to Reach $15B by 2025",
      summary:
        "Growing demand for instant data insights drives massive investment in streaming analytics and edge computing.",
      content:
        "According to a new market research report, the real-time analytics market is experiencing unprecedented growth...",
      category: "data-science",
      author: "Jordan Smith",
      authorAvatar: "JS",
      image: "/placeholder.svg?height=300&width=500",
      readTime: "8 min read",
      publishedAt: "2024-01-13T14:00:00Z",
      views: 5430,
      trending: true,
      featured: false,
      tags: ["Analytics", "Market Research", "Real-time Data", "Business Intelligence"],
    },
    {
      id: "6",
      title: "Apache Spark 4.0 Introduces Revolutionary Query Engine",
      summary: "New version promises 10x performance improvements for large-scale data processing workloads.",
      content: "The Apache Spark community has released version 4.0, featuring a completely redesigned query engine...",
      category: "tools",
      author: "Lisa Wang",
      authorAvatar: "LW",
      image: "/placeholder.svg?height=300&width=500",
      readTime: "6 min read",
      publishedAt: "2024-01-13T10:00:00Z",
      views: 4210,
      trending: false,
      featured: false,
      tags: ["Apache Spark", "Big Data", "Query Engine", "Performance"],
    },
  ]

  const filteredArticles = articles
    .filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || article.category === selectedCategory

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      } else if (sortBy === "popular") {
        return b.views - a.views
      } else if (sortBy === "trending") {
        return (b.trending ? 1 : 0) - (a.trending ? 1 : 0)
      }
      return 0
    })

  const featuredArticles = articles.filter((article) => article.featured)
  const trendingArticles = articles.filter((article) => article.trending)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return "1 day ago"
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <div className="bg-white border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-900 mb-4">DataHub News</h1>
            <p className="text-xl text-primary-700 max-w-3xl mx-auto">
              Stay updated with the latest developments in data science, AI, and technology
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-300 w-4 h-4" />
              <Input
                placeholder="Search articles, topics, or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={
                  selectedCategory === category.id
                    ? "bg-primary-600 hover:bg-primary-700 text-primary-50"
                    : "border-primary-200 text-primary-700 hover:bg-primary-100"
                }
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-96 bg-primary-100 border-primary-200">
            <TabsTrigger value="all" className="text-primary-700 data-[state=active]:bg-primary-600 data-[state=active]:text-primary-50">All Articles</TabsTrigger>
            <TabsTrigger value="featured" className="text-primary-700 data-[state=active]:bg-primary-600 data-[state=active]:text-primary-50">Featured</TabsTrigger>
            <TabsTrigger value="trending" className="text-primary-700 data-[state=active]:bg-primary-600 data-[state=active]:text-primary-50">Trending</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Articles */}
              <div className="lg:col-span-2 space-y-6">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3">
                        <img
                          src={article.image || "/placeholder.svg"}
                          alt={article.title}
                          className="w-full h-48 md:h-full object-cover rounded-l-lg"
                        />
                      </div>
                      <div className="md:w-2/3">
                        <CardHeader>
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="secondary" className="bg-primary-100 text-primary-700">
                              {categories.find((c) => c.id === article.category)?.name}
                            </Badge>
                            {article.trending && (
                              <Badge className="bg-red-500 hover:bg-red-600 text-white">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                            {article.featured && (
                              <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl hover:text-primary-600 cursor-pointer">
                            <Link href={`/news/${article.id}`}>{article.title}</Link>
                          </CardTitle>
                          <CardDescription className="text-sm line-clamp-2 text-primary-700">{article.summary}</CardDescription>
                        </CardHeader>

                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-primary-600 mb-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <Avatar className="w-6 h-6 mr-2">
                                  <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                                    {article.authorAvatar}
                                  </AvatarFallback>
                                </Avatar>
                                {article.author}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(article.publishedAt)}
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {article.readTime}
                              </div>
                              <div className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                {article.views.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {article.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs bg-primary-100 text-primary-700">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Bookmark className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Share className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Trending Articles */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-red-500" />
                      Trending Now
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {trendingArticles.slice(0, 5).map((article, index) => (
                      <div key={article.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm line-clamp-2 hover:text-primary-600 cursor-pointer">
                            <Link href={`/news/${article.id}`}>{article.title}</Link>
                          </h4>
                          <div className="flex items-center text-xs text-primary-500 mt-1">
                            <Eye className="w-3 h-3 mr-1" />
                            {article.views.toLocaleString()} views
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle>Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {categories.slice(1).map((category) => (
                      <Button
                        key={category.id}
                        variant="ghost"
                        className="w-full justify-start text-primary-700 hover:bg-primary-100"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <category.icon className="w-4 h-4 mr-2" />
                        {category.name}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-600 text-white">Featured</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="hover:text-primary-600 cursor-pointer">
                      <Link href={`/news/${article.id}`}>{article.title}</Link>
                    </CardTitle>
                    <CardDescription className="text-primary-700">{article.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-primary-600">
                      <div className="flex items-center">
                        <Avatar className="w-6 h-6 mr-2">
                          <AvatarFallback className="bg-primary-100 text-primary-700 text-xs">
                            {article.authorAvatar}
                          </AvatarFallback>
                        </Avatar>
                        {article.author}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.readTime}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg hover:text-primary-600 cursor-pointer">
                      <Link href={`/news/${article.id}`}>{article.title}</Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-primary-700">{article.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-primary-600">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {article.views.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {article.readTime}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-primary-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary-700 mb-2">No articles found</h3>
            <p className="text-primary-600">Try adjusting your search criteria or browse all articles.</p>
          </div>
        )}
      </div>
    </div>
  )
}