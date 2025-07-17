"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Clock,
  Eye,
  Share,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  Calendar,
  TrendingUp,
  User,
} from "lucide-react"
import Link from "next/link"

export default function NewsArticlePage({ params }: { params: { id: string } }) {
  // Mock article data - in real app, fetch based on params.id
  const article = {
    id: params.id,
    title: "OpenAI Releases GPT-5: Revolutionary Breakthrough in AI Reasoning",
    summary:
      "The latest language model shows unprecedented capabilities in mathematical reasoning and code generation, setting new benchmarks across multiple domains.",
    content: `
      <p>OpenAI has officially announced the release of GPT-5, marking a significant leap forward in artificial intelligence capabilities. The new model demonstrates unprecedented performance in mathematical reasoning, code generation, and complex problem-solving tasks.</p>

      <h2>Key Improvements</h2>
      <p>GPT-5 introduces several groundbreaking features that set it apart from its predecessors:</p>
      <ul>
        <li><strong>Enhanced Mathematical Reasoning:</strong> The model can now solve complex mathematical problems with 95% accuracy, compared to 78% in GPT-4.</li>
        <li><strong>Advanced Code Generation:</strong> Supports over 50 programming languages with improved syntax accuracy and logical flow.</li>
        <li><strong>Multimodal Capabilities:</strong> Seamlessly processes text, images, audio, and video inputs simultaneously.</li>
        <li><strong>Reduced Hallucinations:</strong> Factual accuracy improved by 40% through enhanced training methodologies.</li>
      </ul>

      <h2>Impact on Data Science</h2>
      <p>For data scientists and analysts, GPT-5 offers revolutionary capabilities in data analysis, visualization, and interpretation. The model can now:</p>
      <ul>
        <li>Generate complex SQL queries from natural language descriptions</li>
        <li>Create comprehensive data analysis reports with statistical insights</li>
        <li>Suggest optimal machine learning algorithms based on dataset characteristics</li>
        <li>Debug and optimize existing data science code</li>
      </ul>

      <h2>Availability and Pricing</h2>
      <p>GPT-5 will be available through OpenAI's API starting next month, with pricing tiers designed to accommodate both individual developers and enterprise customers. Early access is currently being provided to select partners and research institutions.</p>

      <p>This release represents a significant milestone in AI development and is expected to accelerate innovation across multiple industries, particularly in data science, software development, and research.</p>
    `,
    category: "AI & Machine Learning",
    author: "Dr. Sarah Chen",
    authorAvatar: "SC",
    authorBio:
      "AI Research Scientist and former OpenAI researcher with expertise in large language models and neural networks.",
    image: "/placeholder.svg?height=400&width=800",
    readTime: "5 min read",
    publishedAt: "2024-01-15T10:00:00Z",
    views: 15420,
    likes: 342,
    comments: 28,
    trending: true,
    tags: ["OpenAI", "GPT-5", "AI", "Machine Learning", "Natural Language Processing"],
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const relatedArticles = [
    {
      id: "2",
      title: "Google's New Quantum Computer Achieves 1000-Qubit Milestone",
      readTime: "7 min read",
      views: 12350,
    },
    {
      id: "3",
      title: "Python 3.13 Released with Major Performance Improvements",
      readTime: "4 min read",
      views: 8920,
    },
    {
      id: "4",
      title: "Meta's New Data Center Uses 100% Renewable Energy for AI Training",
      readTime: "6 min read",
      views: 6780,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/news">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to News
            </Link>
          </Button>
        </div>

        <article>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Badge variant="secondary">{article.category}</Badge>
              {article.trending && (
                <Badge className="bg-red-500 hover:bg-red-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold text-slate-800 mb-4 leading-tight">{article.title}</h1>

            <p className="text-xl text-slate-600 mb-6">{article.summary}</p>

            {/* Article Meta */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">{article.authorAvatar}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-slate-800">{article.author}</div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(article.publishedAt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-slate-600">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {article.readTime}
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {article.views.toLocaleString()} views
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 mb-8">
              <Button variant="outline" size="sm">
                <ThumbsUp className="w-4 h-4 mr-2" />
                {article.likes}
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                {article.comments}
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="mb-8">
            <img
              src={article.image || "/placeholder.svg"}
              alt={article.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h3 className="font-semibold text-slate-800 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="my-8" />

          {/* Author Bio */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">
                    {article.authorAvatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">About {article.author}</h3>
                  <p className="text-slate-600 mb-4">{article.authorBio}</p>
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          <Card>
            <CardHeader>
              <CardTitle>Related Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relatedArticles.map((relatedArticle) => (
                  <div
                    key={relatedArticle.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 hover:text-emerald-600 cursor-pointer">
                        <Link href={`/news/${relatedArticle.id}`}>{relatedArticle.title}</Link>
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {relatedArticle.readTime}
                        </div>
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {relatedArticle.views.toLocaleString()} views
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  )
}
