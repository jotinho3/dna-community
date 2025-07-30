"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  CheckCircle, 
  MessageSquare, 
  Heart, 
  BookOpen,
  Clock,
  Video,
  X,
  Award,
  Users,
  AlertCircle,
  Calendar
} from "lucide-react";
import { useNotifications } from "../app/context/NotificationContext";
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    navigateToNotification,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (notification: any) => {
    const iconProps = { className: "w-4 h-4" };

    if (notification.type === 'workshop') {
      switch (notification.subType) {
        case 'workshop_enrollment_confirmation':
          return <CheckCircle {...iconProps} className="w-4 h-4 text-green-500" />;
        case 'workshop_reminder_24h':
        case 'workshop_reminder_1h':
        case 'enrollment_deadline_reminder':
          return <Clock {...iconProps} className="w-4 h-4 text-yellow-500" />;
        case 'workshop_starting_now':
          return <Video {...iconProps} className="w-4 h-4 text-red-500" />;
        case 'workshop_cancelled':
          return <X {...iconProps} className="w-4 h-4 text-red-500" />;
        case 'workshop_updated':
          return <AlertCircle {...iconProps} className="w-4 h-4 text-blue-500" />;
        case 'workshop_completed':
        case 'certificate_issued':
          return <Award {...iconProps} className="w-4 h-4 text-blue-500" />;
        case 'waitlist_promoted':
        case 'workshop_creator_approved':
          return <CheckCircle {...iconProps} className="w-4 h-4 text-green-500" />;
        default:
          return <BookOpen {...iconProps} className="w-4 h-4 text-gray-500" />;
      }
    }

    // Existing notification icons
    switch (notification.type) {
      case 'mention':
        return <MessageSquare {...iconProps} className="w-4 h-4 text-blue-500" />;
      case 'answer':
        return <MessageSquare {...iconProps} className="w-4 h-4 text-green-500" />;
      case 'reaction':
        return <Heart {...iconProps} className="w-4 h-4 text-red-500" />;
      case 'accepted':
        return <CheckCircle {...iconProps} className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell {...iconProps} className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (notification: any) => {
    if (notification.type === 'workshop') {
      switch (notification.priority) {
        case 'urgent':
          return 'border-l-red-500 bg-red-50';
        case 'high':
          return 'border-l-orange-500 bg-orange-50';
        case 'medium':
          return 'border-l-blue-500 bg-blue-50';
        default:
          return 'border-l-gray-300 bg-gray-50';
      }
    }
    return 'border-l-gray-300 bg-gray-50';
  };

  const handleNotificationClick = (notification: any) => {
    navigateToNotification(notification);
    setIsOpen(false);
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs h-6 px-2"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-0 focus:bg-transparent ${!notification.read ? 'bg-blue-50' : ''}`}
                onSelect={(e) => e.preventDefault()}
              >
                <div
                  className={`w-full p-3 cursor-pointer hover:bg-gray-50 border-l-2 ${getPriorityColor(notification)} ${!notification.read ? 'bg-blue-25' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                        {notification.fromUserName?.[0]?.toUpperCase() || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getNotificationIcon(notification)}
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-900 mb-1">
                        <span className="font-medium">{notification.fromUserName}</span>{' '}
                        {notification.message}
                      </p>

                      {/* Workshop-specific action button */}
                      {notification.type === 'workshop' && notification.actionLabel && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                            notification.subType === 'workshop_starting_now'
                              ? 'bg-red-100 text-red-800'
                              : notification.subType === 'certificate_issued' || notification.subType === 'workshop_completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {notification.actionLabel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {notifications.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="w-full text-center py-2 text-sm text-emerald-600 hover:text-emerald-700">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;