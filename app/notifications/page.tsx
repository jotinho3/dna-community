"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Bell,
  MessageSquare,
  ThumbsUp,
  UserPlus,
  Award,
  BookOpen,
  TrendingUp,
  MoreVertical,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Loader2,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import Link from "next/link"

interface Notification {
  id: string
  type: "answer" | "comment" | "upvote" | "follow" | "badge" | "workshop" | "mention"
  title: string
  message: string
  user?: {
    name: string
    avatar: string
  }
  timestamp: string
  isRead: boolean
  actionUrl?: string
  createdAt: string
  // Add these fields from your backend structure
  targetId: string
  targetType: 'question' | 'answer' | 'workshop' | 'certificate'
  answerId?: string
  workshopId?: string
  meetingLink?: string
  subType?: string
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!user?.uid) return

    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/notifications/${user.uid}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      
      // Transform API data to match our interface
      const transformedNotifications = data.notifications?.map((notif: any) => ({
        id: notif.id,
        type: notif.type || 'answer',
        title: notif.title || getDefaultTitle(notif.type),
        message: notif.message || notif.content,
        user: notif.fromUserId && notif.fromUserName ? {
          name: notif.fromUserName,
          avatar: notif.fromUserAvatar || notif.fromUserName?.[0]?.toUpperCase() || 'U'
        } : undefined,
        timestamp: formatTimestamp(notif.createdAt),
        isRead: notif.read || false,
        actionUrl: notif.actionUrl,
        createdAt: notif.createdAt,
        // Include backend structure fields
        targetId: notif.targetId,
        targetType: notif.targetType,
        answerId: notif.answerId,
        workshopId: notif.workshopId,
        meetingLink: notif.meetingLink,
        subType: notif.subType
      })) || []

      setNotifications(transformedNotifications)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to get default titles based on type
  const getDefaultTitle = (type: string) => {
    switch (type) {
      case 'answer': return 'New answer to your question'
      case 'comment': return 'New comment on your post'
      case 'upvote': return 'Your content was upvoted'
      case 'follow': return 'New follower'
      case 'badge': return 'Badge earned!'
      case 'workshop': return 'Workshop notification'
      case 'mention': return 'You were mentioned'
      default: return 'New notification'
    }
  }

  // Helper function to format timestamps
  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const notifTime = new Date(timestamp)
    const diffMs = now.getTime() - notifTime.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return notifTime.toLocaleDateString()
  }

  // Navigation logic from NotificationContext
const navigateToNotification = (notification: Notification) => {
  // Mark as read first
  if (!notification.isRead) {
    markAsRead(notification.id)
  }

  // Handle workshop notifications
  if (notification.type === 'workshop') {
    if (notification.subType === 'workshop_starting_now' && notification.meetingLink) {
      window.open(notification.meetingLink, '_blank')
      return
    } else if (notification.actionUrl) {
      window.location.href = notification.actionUrl
      return
    } else if (notification.workshopId) {
      window.location.href = `/workshops/${notification.workshopId}`
      return
    }
  }

  // Handle mention notifications specifically
  if (notification.type === 'mention') {
    // If it's a mention in an answer, navigate to the specific answer
    if (notification.targetType === 'answer' && notification.targetId && notification.answerId) {
      window.location.href = `/questions/${notification.targetId}#answer-${notification.answerId}`
      return
    }
    // If it's a mention in a question, navigate to the question
    if (notification.targetType === 'question' && notification.targetId) {
      window.location.href = `/questions/${notification.targetId}`
      return
    }
  }

  // Navigate based on target type
  if (notification.targetType === 'question') {
    window.location.href = `/questions/${notification.targetId}`
  } else if (notification.targetType === 'answer' && notification.targetId && notification.answerId) {
    window.location.href = `/questions/${notification.targetId}#answer-${notification.answerId}`
  } else if (notification.targetType === 'workshop' && notification.workshopId) {
    window.location.href = `/workshops/${notification.workshopId}`
  } else if (notification.targetType === 'certificate' && notification.actionUrl) {
    window.location.href = notification.actionUrl
  } else if (notification.actionUrl) {
    window.location.href = notification.actionUrl
  }
}

  useEffect(() => {
    if (user?.uid) {
      fetchNotifications()
    }
  }, [user?.uid])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "answer":
      case "comment":
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case "upvote":
        return <ThumbsUp className="w-5 h-5 text-emerald-500" />
      case "follow":
        return <UserPlus className="w-5 h-5 text-purple-500" />
      case "badge":
        return <Award className="w-5 h-5 text-amber-500" />
      case "workshop":
        return <BookOpen className="w-5 h-5 text-teal-500" />
      case "mention":
        return <TrendingUp className="w-5 h-5 text-orange-500" />
      default:
        return <Bell className="w-5 h-5 text-primary-500" />
    }
  }

  const markAsRead = async (id: string) => {
    if (!user?.uid) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/notifications/${id}/read`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        setNotifications((prev) => 
          prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
        )
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    if (!user?.uid) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/notifications/${user.uid}/mark-all-read`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    if (!user?.uid) return

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/notifications/${user.uid}/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const filteredNotifications = notifications.filter(
    (notif) => filter === "all" || (filter === "unread" && !notif.isRead),
  )

  const unreadCount = notifications.filter((n) => !n.isRead).length

  // ... Keep all the existing JSX for loading, error, and no user states ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                <Bell className="w-8 h-8 mr-3 text-primary-600" />
                Notifications
                {unreadCount > 0 && <Badge className="ml-3 bg-red-500 hover:bg-red-600">{unreadCount}</Badge>}
              </h1>
              <p className="text-slate-600 mt-2">Stay updated with your community activity</p>
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={markAllAsRead} 
                disabled={unreadCount === 0}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          <Tabs value={filter} onValueChange={(value) => setFilter(value as "all" | "unread")}>
            <TabsList>
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-6">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Bell className="w-16 h-16 text-primary-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">
                      {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                    </h3>
                    <p className="text-slate-500">
                      {filter === "unread"
                        ? "You're all caught up! Check back later for new activity."
                        : "Start engaging with the community to receive notifications."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`transition-all hover:shadow-md cursor-pointer ${
                        !notification.isRead ? "border-l-4 border-l-emerald-500 bg-emerald-50/30" : "hover:bg-slate-50"
                      }`}
                      onClick={() => navigateToNotification(notification)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">{getNotificationIcon(notification.type)}</div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-800 mb-1">{notification.title}</h3>
                                <p className="text-slate-600 text-sm mb-2">{notification.message}</p>

                                <div className="flex items-center space-x-4 text-xs text-slate-500">
                                  {notification.user && (
                                    <div className="flex items-center">
                                      <Avatar className="w-4 h-4 mr-1">
                                        <AvatarFallback className="bg-primary-100 text-emerald-700 text-xs">
                                          {notification.user.avatar}
                                        </AvatarFallback>
                                      </Avatar>
                                      {notification.user.name}
                                    </div>
                                  )}
                                  <span>{notification.timestamp}</span>
                                  {!notification.isRead && (
                                    <Badge variant="secondary" className="text-xs">
                                      New
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!notification.isRead && (
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation()
                                      markAsRead(notification.id)
                                    }}>
                                      <Check className="w-4 h-4 mr-2" />
                                      Mark as read
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteNotification(notification.id)
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}