"use client";

import React, { useState } from "react";
import MentionEditor from "../components/MentionEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, X, HelpCircle, ArrowLeft, Plus, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function AskQuestionForm() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("write");
  const [mentions, setMentions] = useState<
    Array<{
      userId: string;
      userName: string;
    }>
  >([]);

  const { user } = useAuth();
  const router = useRouter();

  // Categories for selection
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
    "Programming",
    "Web Development",
    "General",
  ];

  // Popular tags
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
    "javascript",
    "react",
    "nodejs",
    "api",
    "database",
  ];

  // Enhanced tag handling
  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // Submit function with enhanced validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Enhanced validation
    if (!user) {
      setError("You need to be logged in to ask a question.");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a question title.");
      return;
    }
    if (title.length < 10) {
      setError("Title should be at least 10 characters long.");
      return;
    }
    if (!body.trim()) {
      setError("Please provide a detailed description of your question.");
      return;
    }
    if (body.length < 30) {
      setError("Description should be at least 30 characters long.");
      return;
    }
    if (!category) {
      setError("Please select a category.");
      return;
    }
    if (tags.length === 0) {
      setError("Please add at least one tag.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/qa/${
          user!.uid
        }/questions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            title: title.trim(), 
            content: body.trim(), 
            category,
            tags, 
            mentions 
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error creating question.");
      } else {
        setSuccess("Question created successfully!");
        setTimeout(() => {
          router.push(`/questions/${data.id}`);
        }, 1200);
      }
    } catch (err) {
      setError("Failed to create question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/questions">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Questions
            </Link>
          </Button>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-lg border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center text-primary-600">
              <HelpCircle className="w-6 h-6 mr-2" />
              Ask a Question
            </CardTitle>
            <CardDescription>
              Share your question with the community and get expert answers from fellow developers and data scientists
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Alerts */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert variant="default" className="border-emerald-200 bg-emerald-50">
                      <AlertDescription className="text-emerald-700">{success}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Question Title *</Label>
                <Input
                  id="title"
                  className="text-lg focus:ring-2 focus:ring-emerald-200 transition-all"
                  placeholder="What's your question? Be specific and clear."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  maxLength={150}
                  required
                />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">
                    {title.length}/150 characters
                  </span>
                  {title.length > 0 && title.length < 10 && (
                    <span className="text-amber-600">Title should be more descriptive</span>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  disabled={loading}
                >
                  <SelectTrigger className="focus:ring-2 focus:ring-emerald-200">
                    <SelectValue placeholder="Select a category for your question" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Question Details with Tabs */}
              <div className="space-y-2">
                <Label htmlFor="body">Question Details *</Label>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="write">Write</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>

                  <TabsContent value="write" className="space-y-2">
                    <MentionEditor
                      value={body}
                      userId={user?.uid}
                      onChange={(text) => setBody(text)}
                      onMentionsChange={(mentionsList) => setMentions(mentionsList)}
                      placeholder="Provide detailed information about your question. Include:
• What you're trying to achieve
• What you've tried so far  
• Any error messages or unexpected results
• Sample data or code (if applicable)
• Your expected outcome"
                      className="min-h-[200px] focus:ring-2 focus:ring-emerald-200"
                    />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">
                        {body.length} characters
                      </span>
                      {body.length > 0 && body.length < 30 && (
                        <span className="text-amber-600">Please provide more details</span>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-2">
                    <div className="min-h-[200px] p-4 border border-slate-200 rounded-md bg-white">
                      {body ? (
                        <div className="prose prose-sm max-w-none">
                          {body.split("\n").map((line, index) => (
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

                {/* Mentions Display */}
                {mentions.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-600">Mentioned Users:</Label>
                    <div className="flex flex-wrap gap-2">
                      {mentions.map((mention) => (
                        <Badge
                          key={mention.userId}
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-700 px-3 py-1"
                        >
                          @{mention.userName}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-auto p-0 text-emerald-700 hover:text-red-500"
                            onClick={() => {
                              setMentions((prev) =>
                                prev.filter((m) => m.userId !== mention.userId)
                              );
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags Section */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags * (up to 5)</Label>
                
                {/* Current Tags */}
                <div className="space-y-3">
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {tags.map((tag) => (
                          <motion.span
                            key={tag}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                            }}
                          >
                            <Badge 
                              variant="secondary" 
                              className="bg-emerald-100 text-emerald-700 px-3 py-1"
                            >
                              {tag}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="ml-2 h-auto p-0 text-emerald-700 hover:text-red-500"
                                onClick={() => handleRemoveTag(tag)}
                                aria-label={`Remove tag ${tag}`}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Add Tag Input */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      disabled={loading || tags.length >= 5}
                      className="focus:ring-2 focus:ring-emerald-200"
                      maxLength={25}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddTag(tagInput)}
                      disabled={!tagInput.trim() || tags.length >= 5}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Popular Tags */}
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
                          disabled={tags.includes(tag) || tags.length >= 5}
                          className="text-xs hover:bg-emerald-50 hover:border-emerald-200"
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    Use relevant keywords like: python, sql, machine-learning, data-analysis...
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4 pt-6 border-t border-slate-200">
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 transition-all"
                  disabled={loading}
                >
                  {loading ? (
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/questions")}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="mt-6 border-emerald-100">
          <CardHeader>
            <CardTitle className="text-lg flex items-center text-emerald-700">
              <Lightbulb className="w-5 h-5 mr-2" />
              Tips for a Great Question
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Before you post:</h4>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start">
                    <span className="text-emerald-500 mr-2">•</span>
                    Search for similar questions first
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-500 mr-2">•</span>
                    Try to solve it yourself first
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-500 mr-2">•</span>
                    Prepare a minimal reproducible example
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-500 mr-2">•</span>
                    Check documentation and tutorials
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Writing your question:</h4>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start">
                    <span className="text-emerald-500 mr-2">•</span>
                    Be specific and clear in your title
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-500 mr-2">•</span>
                    Include relevant code, data, or examples
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-500 mr-2">•</span>
                    Explain what you expected vs what happened
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-500 mr-2">•</span>
                    Use appropriate tags for visibility
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}