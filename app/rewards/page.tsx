"use client";

import React, { useEffect, useState } from "react";
import {
  Star,
  Gift,
  Trophy,
  Zap,
  Target,
  Clock,
  Filter,
  History,
  Sparkles,
  Medal,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { RewardCard } from "@/components/RewardCard";
import { RewardFilters } from "@/components/RewardsFilter";
import { RewardHistory } from "@/components/RewardHistory";
import { toast } from "react-hot-toast";

interface UserRewardStatus {
  currentXP: number;
  currentLevel: number;
  availableTokens: number;
  totalEarnedTokens: number;
  unusedTokens: any[];
  usedTokens: any[];
  newTokensEarned: number;
  nextTokenLevel: number;
  xpToNextToken: number;
  message?: string;
  notificationSent?: boolean;
}

interface Reward {
  id: string;
  title: string;
  description: string;
  type: 'digital' | 'physical' | 'experience' | 'discount';
  cost: number;
  category: 'learning' | 'merchandise' | 'certification' | 'exclusive_access' | 'other';
  imageUrl?: string;
  isActive: boolean;
  stock?: number;
  details: {
    instructions?: string;
    validUntil?: string;
  };
}

interface RewardFilters {
  category?: string;
  type?: string;
  minCost?: number;
  maxCost?: number;
}

export default function RewardsPage() {
  const { user } = useAuth();
  const [userStatus, setUserStatus] = useState<UserRewardStatus | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<RewardFilters>({});
  const [activeTab, setActiveTab] = useState<'rewards' | 'history'>('rewards');

  // Fetch user reward status
  const fetchUserStatus = async () => {
    if (!user?.uid) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/rewards/user/${user.uid}/status`
      );
      const data = await response.json();
      setUserStatus(data);

      // Show notification for new tokens
      if (data.newTokensEarned > 0 && data.message) {
        toast.success(data.message, {
          duration: 5000,
          icon: '🎉',
        });
      }
    } catch (error) {
      console.error('Failed to fetch user status:', error);
    }
  };

  // Fetch available rewards
  const fetchRewards = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.minCost) queryParams.append('minCost', filters.minCost.toString());
      if (filters.maxCost) queryParams.append('maxCost', filters.maxCost.toString());

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/rewards/available?${queryParams}`
      );
      const data = await response.json();
      setRewards(data.rewards || []);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserStatus();
      fetchRewards();
    }
  }, [user]);

  useEffect(() => {
    fetchRewards();
  }, [filters]);

  // Handle reward redemption
  const handleRedeemReward = async (rewardId: string, deliveryInfo: any) => {
    if (!user?.uid) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/rewards/user/${user.uid}/redeem`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rewardId, deliveryInfo }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        // Refresh user status and rewards
        fetchUserStatus();
        fetchRewards();
      } else {
        toast.error(data.error || 'Failed to redeem reward');
      }
    } catch (error) {
      toast.error('Failed to redeem reward');
      console.error('Redemption error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Gift className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Login Required
          </h2>
          <p className="text-slate-600">
            Please log in to access your rewards dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (loading && !userStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading rewards...</p>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = userStatus ? 
    ((userStatus.currentXP % (userStatus.nextTokenLevel - (userStatus.nextTokenLevel - userStatus.xpToNextToken))) / 
     (userStatus.nextTokenLevel - (userStatus.nextTokenLevel - userStatus.xpToNextToken))) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                <Trophy className="w-8 h-8 text-yellow-500 mr-3" />
                Rewards Dashboard
              </h1>
              <p className="text-slate-600 mt-2">
                Earn tokens through participation and redeem amazing rewards!
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'rewards' ? 'default' : 'outline'}
                onClick={() => setActiveTab('rewards')}
                className="flex items-center"
              >
                <Gift className="w-4 h-4 mr-2" />
                Rewards
              </Button>
              <Button
                variant={activeTab === 'history' ? 'default' : 'outline'}
                onClick={() => setActiveTab('history')}
                className="flex items-center"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Status Card */}
        {userStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Level & XP */}
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Medal className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-emerald-100 text-sm">Level</p>
                      <p className="text-2xl font-bold">{userStatus.currentLevel}</p>
                      <p className="text-emerald-200 text-xs">{userStatus.currentXP} XP</p>
                    </div>
                  </div>

                  {/* Available Tokens */}
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-emerald-100 text-sm">Available Tokens</p>
                      <p className="text-2xl font-bold">{userStatus.availableTokens}</p>
                      <p className="text-emerald-200 text-xs">of {userStatus.totalEarnedTokens} earned</p>
                    </div>
                  </div>

                  {/* Progress to Next Token */}
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <Target className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-emerald-100 text-sm">Next Token</p>
                      <p className="text-lg font-bold">{userStatus.xpToNextToken} XP to go</p>
                      <div className="mt-2 bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white rounded-full h-2 transition-all duration-500"
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Action */}
                  <div className="flex items-center justify-center">
                    <Button 
                      variant="secondary"
                      className="bg-white text-emerald-600 hover:bg-emerald-50"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Earn More XP
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'rewards' ? (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Filters */}
              <RewardFilters onFiltersChange={setFilters} />

              {/* Available Rewards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-700">
                    <Gift className="w-6 h-6 mr-2" />
                    Available Rewards ({rewards.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {rewards.length === 0 ? (
                    <div className="text-center py-12">
                      <Gift className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-600 mb-2">
                        No rewards available
                      </h3>
                      <p className="text-slate-500">
                        Check back later for new rewards or adjust your filters.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {rewards.map((reward) => (
                        <RewardCard
                          key={reward.id}
                          reward={reward}
                          userTokens={userStatus?.availableTokens || 0}
                          onRedeem={handleRedeemReward}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <RewardHistory userId={user.uid} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}