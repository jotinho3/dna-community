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
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
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
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    // Mock notifications data
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "answer",
        title: "New answer to your question",
        message: "Sarah Chen answered your question about handling missing data in time series analysis.",
        user: { name: "Sarah Chen", avatar: "SC" },
        timestamp: "2 hours ago",
        isRead: false,
        actionUrl: "/questions/123",
      },
      {
        id: "2",
        type: "upvote",
        title: "Your answer was upvoted",
        message: "Your answer about SQL optimization received 5 upvotes.",
        timestamp: "4 hours ago",
        isRead: false,
        actionUrl: "/questions/456",
      },
      {
        id: "3",
        type: "comment",
        title: "New comment on your answer",
        message: "Mike Rodriguez commented on your machine learning pipeline answer.",
        user: { name: "Mike Rodriguez", avatar: "MR" },
        timestamp: "6 hours ago",
        isRead: true,
        actionUrl: "/questions/789",
      },
      {
        id: "4",
        type: "follow",
        title: "New follower",
        message: "Alex Kumar started following you.",
        user: { name: "Alex Kumar", avatar: "AK" },
        timestamp: "1 day ago",
        isRead: true,
        actionUrl: "/profile/alex-kumar",
      },
      {
        id: "5",
        type: "badge",
        title: "Badge earned!",
        message: "You earned the 'Python Guru' badge for your contributions.",
        timestamp: "2 days ago",
        isRead: true,
      },
      {
        id: "6",
        type: "workshop",
        title: "Workshop reminder",
        message: "Your enrolled workshop 'Machine Learning Bootcamp' starts tomorrow.",
        timestamp: "2 days ago",
        isRead: false,
        actionUrl: "/workshops/1",
      },
      {
        id: "7",
        type: "mention",
        title: "You were mentioned",
        message: "Emily Zhang mentioned you in a discussion about deep learning frameworks.",
        user: { name: "Emily Zhang", avatar: "EZ" },
        timestamp: "3 days ago",
        isRead: true,
        actionUrl: "/questions/101",
      },
      {
        id: "8",
        type: "upvote",
        title: "Question upvoted",
        message: "Your question about feature engineering received 10 upvotes.",
        timestamp: "4 days ago",
        isRead: true,
        actionUrl: "/questions/202",
      },
    ]

    setNotifications(mockNotifications)
  }, [])

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
        return <Bell className="w-5 h-5 text-slate-500" />
    }
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const filteredNotifications = notifications.filter(
    (notif) => filter === "all" || (filter === "unread" && !notif.isRead),
  )

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Sign in to view notifications</h2>
            <p className="text-slate-600 mb-4">Get notified about answers, comments, and community activity.</p>
            <Button asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center">
                <Bell className="w-8 h-8 mr-3 text-emerald-600" />
                Notifications
                {unreadCount > 0 && <Badge className="ml-3 bg-red-500 hover:bg-red-600">{unreadCount}</Badge>}
              </h1>
              <p className="text-slate-600 mt-2">Stay updated with your community activity</p>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
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
                    <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
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
                      className={`transition-all hover:shadow-md ${
                        !notification.isRead ? "border-l-4 border-l-emerald-500 bg-emerald-50/30" : "hover:bg-slate-50"
                      }`}
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
                                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
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
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {!notification.isRead && (
                                    <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                      <Check className="w-4 h-4 mr-2" />
                                      Mark as read
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {notification.actionUrl && (
                              <div className="mt-3">
                                <Button variant="outline" size="sm" asChild onClick={() => markAsRead(notification.id)}>
                                  <Link href={notification.actionUrl}>View Details</Link>
                                </Button>
                              </div>
                            )}
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
