"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Send, Code, Bold, Italic, List, Link2, X, Plus, HelpCircle } from "lucide-react"
import { useAuth } from "../context/AuthContext" // <-- updated import path
import Link from "next/link"

export default function AskQuestionPage() {
  const { user } = useAuth() // <-- get user from context
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [] as string[],
  })
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("write")

  const categories = [
    "Machine Learning",
    "Data Science",
    "SQL & Databases",
    "Python",
    "R Programming",
    "Statistics",
    "Data Visualization",
    "Big Data",
    "Analytics Tools",
    "AI & Deep Learning",
  ]

  const popularTags = [
    "python",
    "sql",
    "machine-learning",
    "pandas",
    "data-analysis",
    "statistics",
    "visualization",
    "deep-learning",
    "tensorflow",
    "scikit-learn",
  ]

  useEffect(() => {
    if (user === null) {
      router.push("/signin?redirect=/ask")
    }
  }, [user, router])

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.title.trim()) {
      setError("Please enter a question title")
      return
    }

    if (!formData.description.trim()) {
      setError("Please provide a detailed description")
      return
    }

    if (!formData.category) {
      setError("Please select a category")
      return
    }

    if (formData.tags.length === 0) {
      setError("Please add at least one tag")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Redirect to the question (mock ID)
      router.push("/questions/123")
    } catch (err) {
      setError("Failed to post question. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="w-6 h-6 mr-2 text-emerald-600" />
              Ask a Question
            </CardTitle>
            <CardDescription>Share your question with the DataHub community and get expert answers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Question Title *</Label>
                <Input
                  id="title"
                  placeholder="What's your data science question? Be specific and clear."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={isSubmitting}
                  className="text-lg"
                />
                <p className="text-sm text-slate-500">{formData.title.length}/150 characters</p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category for your question" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Question Details *</Label>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>

                  <TabsContent value="write" className="space-y-2">
                    <div className="flex items-center space-x-2 p-2 border-b border-slate-200">
                      <Button type="button" variant="ghost" size="sm">
                        <Bold className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm">
                        <Italic className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm">
                        <Code className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm">
                        <Link2 className="w-4 h-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm">
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                    <Textarea
                      id="description"
                      placeholder="Provide detailed information about your question. Include:
• What you're trying to achieve
• What you've tried so far
• Any error messages or unexpected results
• Sample data or code (if applicable)"
                      rows={12}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      disabled={isSubmitting}
                      className="font-mono text-sm"
                    />
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-2">
                    <div className="min-h-[300px] p-4 border border-slate-200 rounded-md bg-white">
                      {formData.description ? (
                        <div className="prose prose-sm max-w-none">
                          {formData.description.split("\n").map((line, index) => (
                            <p key={index} className="mb-2">
                              {line || "\u00A0"}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">Preview will appear here...</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags * (up to 5)</Label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="px-3 py-1">
                        {tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-auto p-0 text-slate-500 hover:text-slate-700"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTag(newTag)
                        }
                      }}
                      disabled={isSubmitting || formData.tags.length >= 5}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddTag(newTag)}
                      disabled={!newTag || formData.tags.length >= 5}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">Popular tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularTags.map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddTag(tag)}
                          disabled={formData.tags.includes(tag) || formData.tags.length >= 5}
                          className="text-xs"
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex space-x-4 pt-4">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting Question...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Post Question
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Tips for a Great Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Before you post:</h4>
                <ul className="space-y-1 text-slate-600">
                  <li>• Search for similar questions</li>
                  <li>• Try to solve it yourself first</li>
                  <li>• Prepare a minimal example</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Writing your question:</h4>
                <ul className="space-y-1 text-slate-600">
                  <li>• Be specific and clear</li>
                  <li>• Include relevant code/data</li>
                  <li>• Explain what you expected</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
     </div>
  )
}