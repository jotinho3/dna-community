"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Award,
  MessageSquare,
  Activity,
  Shield,
  Settings,
  TrendingUp,
  UserPlus,
  Gift,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../../context/AuthContext";
import { AdminAuthCheck } from "../../context/AdminAuth";
import { UsersManagement } from "@/components/admin/UsersManagement";
import { RewardsManagement } from "@/components/admin/RewardsManagement";
import { QuestionsManagement } from "@/components/admin/QuestionsManagement";
import { UserActivity } from "@/components/admin/UserActivity";
import { motion } from "framer-motion";

interface AdminStats {
  totalUsers: number;
  totalWorkshops: number;
  totalQuestions: number;
  totalAnswers: number;
  totalRewards: number;
  activeUsers: number;
  pendingQuestions: number;
  recentActivity: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch admin statistics
  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/stats`,
        {
          headers: {
            'Authorization': `Bearer ${user?.uid}`,
          },
        }
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthCheck>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                  <Shield className="w-8 h-8 text-blue-600 mr-3" />
                  Admin Dashboard
                </h1>
                <p className="text-slate-600 mt-2">
                  Manage users, content, and platform settings
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge className="bg-blue-100 text-blue-700">
                  <Shield className="w-4 h-4 mr-1" />
                  Administrator
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics Cards */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Users</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
                      <p className="text-sm text-emerald-600">
                        {stats.activeUsers} active today
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Workshops</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalWorkshops}</p>
                      <p className="text-sm text-slate-500">Total created</p>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <Award className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Q&A Content</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {stats.totalQuestions + stats.totalAnswers}
                      </p>
                      <p className="text-sm text-slate-500">
                        {stats.totalQuestions} questions, {stats.totalAnswers} answers
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Rewards</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalRewards}</p>
                      <p className="text-sm text-slate-500">Available rewards</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Gift className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="users" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="users" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Users</span>
                </TabsTrigger>
                <TabsTrigger value="rewards" className="flex items-center space-x-2">
                  <Gift className="w-4 h-4" />
                  <span>Rewards</span>
                </TabsTrigger>
                <TabsTrigger value="questions" className="flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Q&A</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Activity</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users">
                <UsersManagement />
              </TabsContent>

              <TabsContent value="rewards">
                <RewardsManagement />
              </TabsContent>

              <TabsContent value="questions">
                <QuestionsManagement />
              </TabsContent>

              <TabsContent value="activity">
                <UserActivity />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </AdminAuthCheck>
  );
}