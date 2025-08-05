"use client";

import React, { useEffect, useState } from "react";
import {
  History,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Calendar,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface RewardClaim {
  id: string;
  userId: string;
  rewardId: string;
  rewardTitle: string;
  tokensClaimed: number;
  levelWhenClaimed: number;
  xpWhenClaimed: number;
  claimedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  deliveryInfo: any;
}

interface RewardHistoryProps {
  userId: string;
}

export const RewardHistory: React.FC<RewardHistoryProps> = ({ userId }) => {
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/rewards/user/${userId}/history?page=${page}&limit=${pagination.limit}`
      );
      const data = await response.json();
      setClaims(data.claims || []);
      setPagination(data.pagination || { page: 1, limit: 10, total: 0 });
    } catch (error) {
      console.error('Failed to fetch reward history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-slate-700">
          <History className="w-6 h-6 mr-2" />
          Reward History ({pagination.total})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {claims.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              No reward history yet
            </h3>
            <p className="text-slate-500">
              Your redeemed rewards will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim, index) => (
              <motion.div
                key={claim.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(claim.status)}
                      <h4 className="font-semibold text-slate-900">
                        {claim.rewardTitle}
                      </h4>
                      <Badge className={getStatusColor(claim.status)}>
                        {claim.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{claim.tokensClaimed} tokens used</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(claim.claimedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="text-slate-500">
                        Level {claim.levelWhenClaimed} • {claim.xpWhenClaimed} XP
                      </div>
                    </div>

                    {/* Delivery Info (if available) */}
                    {claim.deliveryInfo?.email && (
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          Delivery Information:
                        </p>
                        <div className="text-sm text-slate-600 space-y-1">
                          <p>Email: {claim.deliveryInfo.email}</p>
                          {claim.deliveryInfo.address && (
                            <p>Address: {claim.deliveryInfo.address}</p>
                          )}
                          {claim.deliveryInfo.phone && (
                            <p>Phone: {claim.deliveryInfo.phone}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-slate-600">
                  Page {pagination.page} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchHistory(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchHistory(pagination.page + 1)}
                    disabled={pagination.page >= totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};