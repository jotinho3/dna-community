"use client";

import React, { useState } from "react";
import {
  Gift,
  Star,
  Clock,
  Package,
  Monitor,
  Award,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";

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

interface RewardCardProps {
  reward: Reward;
  userTokens: number;
  onRedeem: (rewardId: string, deliveryInfo: any) => Promise<void>;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  userTokens,
  onRedeem,
}) => {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    email: '',
    address: '',
    phone: '',
    notes: '',
  });
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);

  const canRedeem = userTokens >= reward.cost && reward.isActive;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'digital': return <Monitor className="w-4 h-4" />;
      case 'physical': return <Package className="w-4 h-4" />;
      case 'experience': return <Star className="w-4 h-4" />;
      case 'discount': return <Award className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'learning': return 'bg-blue-100 text-blue-700';
      case 'merchandise': return 'bg-purple-100 text-purple-700';
      case 'certification': return 'bg-yellow-100 text-yellow-700';
      case 'exclusive_access': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleRedeem = async () => {
    if (!canRedeem) return;

    setIsRedeeming(true);
    try {
      await onRedeem(reward.id, deliveryInfo);
      setShowRedeemDialog(false);
      setDeliveryInfo({ email: '', address: '', phone: '', notes: '' });
    } catch (error) {
      console.error('Redemption failed:', error);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`h-full ${canRedeem ? 'hover:shadow-lg transition-shadow' : 'opacity-75'}`}>
        {/* Reward Image */}
        {reward.imageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img
              src={reward.imageUrl}
              alt={reward.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2 mb-2">
                {reward.title}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className={getCategoryColor(reward.category)}>
                  {reward.category.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="flex items-center">
                  {getTypeIcon(reward.type)}
                  <span className="ml-1 capitalize">{reward.type}</span>
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-slate-600 text-sm line-clamp-3">
            {reward.description}
          </p>

          {/* Cost and Stock */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-lg font-bold text-emerald-600">
                <Star className="w-5 h-5 fill-current" />
                <span>{reward.cost}</span>
              </div>
              <span className="text-sm text-slate-500">tokens</span>
            </div>
            
            {reward.stock !== undefined && reward.stock !== null && (
              <div className="text-sm text-slate-500">
                {reward.stock > 0 ? `${reward.stock} left` : 'Out of stock'}
              </div>
            )}
          </div>

          {/* Valid Until */}
          {reward.details.validUntil && (
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              <span>Valid until {new Date(reward.details.validUntil).toLocaleDateString()}</span>
            </div>
          )}

          {/* Instructions */}
          {reward.details.instructions && (
            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Instructions:</p>
              <p>{reward.details.instructions}</p>
            </div>
          )}

          {/* Redeem Button */}
          <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
            <DialogTrigger asChild>
              <Button
                className="w-full"
                disabled={!canRedeem || (reward.stock !== undefined && reward.stock !== null && reward.stock <= 0)}
                variant={canRedeem ? "default" : "secondary"}
              >
                {!canRedeem ? (
                  userTokens < reward.cost ? 
                    `Need ${reward.cost - userTokens} more tokens` :
                    'Not available'
                ) : (
                  'Redeem Reward'
                )}
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Redeem {reward.title}</DialogTitle>
                <DialogDescription>
                  This will cost {reward.cost} tokens. Please provide your delivery information.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Email (always required) */}
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={deliveryInfo.email}
                      onChange={(e) => setDeliveryInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Address (for physical rewards) */}
                {reward.type === 'physical' && (
                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-slate-400 mt-3" />
                      <Textarea
                        id="address"
                        value={deliveryInfo.address}
                        onChange={(e) => setDeliveryInfo(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter your full address"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Phone */}
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={deliveryInfo.phone}
                      onChange={(e) => setDeliveryInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+55 11 99999-9999"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="w-4 h-4 text-slate-400 mt-3" />
                    <Textarea
                      id="notes"
                      value={deliveryInfo.notes}
                      onChange={(e) => setDeliveryInfo(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any special instructions..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowRedeemDialog(false)}
                    className="flex-1"
                    disabled={isRedeeming}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRedeem}
                    disabled={isRedeeming || !deliveryInfo.email || (reward.type === 'physical' && !deliveryInfo.address)}
                    className="flex-1"
                  >
                    {isRedeeming ? 'Redeeming...' : `Redeem (${reward.cost} tokens)`}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </motion.div>
  );
};