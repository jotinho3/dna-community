"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  TrendingUp,
  MessageSquare,
  BookOpen,
  BarChart3,
  User,
  Settings,
  LogOut,
  Bell,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">DataHub</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
              <Link href="/questions">
                <MessageSquare className="w-4 h-4 mr-2" />
                Ask Question
              </Link>
            </Button>

            {user ? (
              <>
                <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                  <Link href="/workshops">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Workshops
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                  <Link href="/news">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    News
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                  <Link href="/profile-search">
                    <Users className="w-4 h-4 mr-2" />
                    Profiles
                  </Link>
                </Button>

                {/* Notification Bell */}
                <NotificationBell />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${user.uid}`}>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/workshops">
                        <BookOpen className="mr-2 h-4 w-4" />
                        My Workshops
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/news">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        News
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile-search">
                        <Users className="mr-2 h-4 w-4" />
                        Browse Profiles
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/notifications">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/edit">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                  <Link href="/workshops">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Workshops
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                  <Link href="/news">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    News
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="hidden md:inline-flex" asChild>
                  <Link href="/profile-search">
                    <Users className="w-4 h-4 mr-2" />
                    Profiles
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                  <Link href="/signup">Join Community</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}