"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, CheckCircle, XCircle, AlertTriangle, Mail, MessageCircle } from "lucide-react"

interface PolicyRule {
  level: string
  action: string
  examples: string[]
}

interface PolicyData {
  title: string
  objective: string
  applicability: string
  rules: {
    allowed: string[]
    prohibited: string[]
  }
  moderation: {
    functions: string[]
    penalties: PolicyRule[]
  }
  custom_rules: string[]
  contact: {
    email: string
    chat_channel: string
  }
}

interface PolicyResponse {
  version: string
  last_updated: string
  policy: {
    "pt-BR": PolicyData
    "en-US": PolicyData
  }
}

interface PolicyModalProps {
  open: boolean
  onClose: () => void
  onAccept: () => void
}

export default function PolicyModal({ open, onClose, onAccept }: PolicyModalProps) {
  const [policyData, setPolicyData] = useState<PolicyResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [language, setLanguage] = useState<"pt-BR" | "en-US">("en-US")

  useEffect(() => {
    if (open && !policyData) {
      fetchPolicy()
    }
  }, [open])

  const fetchPolicy = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/policy/moderation`)
      if (!response.ok) {
        throw new Error("Failed to fetch policy")
      }
      const data = await response.json()
      setPolicyData(data)
    } catch (err: any) {
      setError(err.message || "Failed to load policy")
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = () => {
    onAccept()
    onClose()
  }

  const currentPolicy = policyData?.policy[language]

  const getPenaltyIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case "leve":
      case "minor":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "moderada":
      case "moderate":
        return <XCircle className="w-4 h-4 text-orange-500" />
      case "grave":
      case "severe":
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />
    }
  }

  const getPenaltyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "leve":
      case "minor":
        return "bg-yellow-100 text-yellow-800"
      case "moderada":
      case "moderate":
        return "bg-orange-100 text-orange-800"
      case "grave":
      case "severe":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-primary-900">
            {currentPolicy?.title || "Community Policy"}
          </DialogTitle>
          <DialogDescription className="text-primary-700">
            Please read and accept our community moderation policy to continue
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <span className="ml-2 text-primary-700">Loading policy...</span>
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center text-red-700">
                <XCircle className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
              <Button 
                onClick={fetchPolicy} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {policyData && currentPolicy && (
          <>
            {/* Language Selector */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm text-primary-700">Language:</span>
              <Button
                variant={language === "en-US" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("en-US")}
                className="h-7"
              >
                English
              </Button>
              <Button
                variant={language === "pt-BR" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("pt-BR")}
                className="h-7"
              >
                Português
              </Button>
            </div>

            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Version and Last Updated */}
                <div className="flex items-center justify-between text-sm text-primary-600">
                  <Badge variant="outline">Version {policyData.version}</Badge>
                  <span>Last updated: {policyData.last_updated}</span>
                </div>

                {/* Objective */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-primary-900">Objective</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-primary-700">{currentPolicy.objective}</p>
                  </CardContent>
                </Card>

                {/* Applicability */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-primary-900">Applicability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-primary-700">{currentPolicy.applicability}</p>
                  </CardContent>
                </Card>

                {/* Allowed Rules */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-primary-900 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                      Allowed Behavior
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {currentPolicy.rules.allowed.map((rule, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                          <span className="text-primary-700">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Prohibited Rules */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-primary-900 flex items-center">
                      <XCircle className="w-5 h-5 mr-2 text-red-500" />
                      Prohibited Behavior
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {currentPolicy.rules.prohibited.map((rule, index) => (
                        <li key={index} className="flex items-start">
                          <XCircle className="w-4 h-4 mr-2 mt-0.5 text-red-500 flex-shrink-0" />
                          <span className="text-primary-700">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Moderation Functions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-primary-900">Moderation Functions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {currentPolicy.moderation.functions.map((func, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                          <span className="text-primary-700">{func}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Penalties */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-primary-900">Penalty System</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentPolicy.moderation.penalties.map((penalty, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              {getPenaltyIcon(penalty.level)}
                              <span className="font-semibold text-primary-900 ml-2">
                                {penalty.level}
                              </span>
                            </div>
                            <Badge className={getPenaltyColor(penalty.level)}>
                              {penalty.action}
                            </Badge>
                          </div>
                          <div className="text-sm text-primary-700">
                            <strong>Examples:</strong>
                            <ul className="list-disc list-inside ml-4 mt-1">
                              {penalty.examples.map((example, exampleIndex) => (
                                <li key={exampleIndex}>{example}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-primary-900">Contact Moderators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-primary-700">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{currentPolicy.contact.email}</span>
                      </div>
                      <div className="flex items-center text-primary-700">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        <span>{currentPolicy.contact.chat_channel}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>

            <Separator />

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleAccept}
                className="bg-primary-600 hover:bg-primary-700"
                disabled={loading}
              >
                I Accept the Policy
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}