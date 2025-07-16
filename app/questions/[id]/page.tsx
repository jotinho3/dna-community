"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, ThumbsUp, MessageSquare, Eye, Share } from "lucide-react"
import Link from "next/link"

export default function QuestionPage({ params }: { params: { id: string } }) {
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
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-4">
                  What's the best approach to handle missing data in time series analysis?
                </CardTitle>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">Time Series</Badge>
                  <Badge variant="secondary">Data Cleaning</Badge>
                  <Badge variant="secondary">Python</Badge>
                </div>

                <div className="flex items-center space-x-4 text-sm text-slate-600">
                  <div className="flex items-center">
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">SC</AvatarFallback>
                    </Avatar>
                    Asked by Sarah Chen
                  </div>
                  <span>2 hours ago</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="prose prose-slate max-w-none mb-6">
              <p>
                I'm working with a time series dataset that has several missing values scattered throughout different
                time periods. I've tried simple forward fill and backward fill, but I'm not getting satisfactory results
                for my forecasting model.
              </p>
              <p>
                What are the best practices for handling missing data in time series analysis? Should I use
                interpolation methods, or are there more sophisticated approaches?
              </p>
            </div>

            <div className="flex items-center space-x-6 text-sm text-slate-500 pt-4 border-t">
              <div className="flex items-center">
                <ThumbsUp className="w-4 h-4 mr-1" />
                45 upvotes
              </div>
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-1" />
                12 answers
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                2.3k views
              </div>
              <Button variant="ghost" size="sm">
                <Share className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-slate-600 mb-4">🎉 Congratulations! Your question has been successfully posted.</p>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
