"use client";

import React, { useEffect, useState } from "react";
import {
  Gift,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Package,
  Monitor,
  Star,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

interface Reward {
  id?: string;
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

export const RewardsManagement: React.FC = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [formData, setFormData] = useState<Reward>({
    title: '',
    description: '',
    type: 'digital',
    cost: 1,
    category: 'learning',
    imageUrl: '',
    isActive: true,
    stock: undefined,
    details: {},
  });

  const fetchRewards = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/rewards`,
        {
          headers: {
            'Authorization': `Bearer ${user?.uid}`,
          },
        }
      );
      const data = await response.json();
      setRewards(data.rewards || []);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRewards();
    }
  }, [user]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'digital',
      cost: 1,
      category: 'learning',
      imageUrl: '',
      isActive: true,
      stock: undefined,
      details: {},
    });
    setEditingReward(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingReward
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/rewards/${editingReward.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/rewards`;

      const response = await fetch(url, {
        method: editingReward ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.uid}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingReward ? 'Reward updated successfully' : 'Reward created successfully');
        setShowCreateDialog(false);
        resetForm();
        fetchRewards();
      } else {
        throw new Error('Failed to save reward');
      }
    } catch (error) {
      console.error('Failed to save reward:', error);
      toast.error('Failed to save reward');
    }
  };

  const handleDelete = async (rewardId: string) => {
    if (!confirm('Are you sure you want to delete this reward?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/rewards/${rewardId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.uid}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Reward deleted successfully');
        fetchRewards();
      } else {
        throw new Error('Failed to delete reward');
      }
    } catch (error) {
      console.error('Failed to delete reward:', error);
      toast.error('Failed to delete reward');
    }
  };

  const handleToggleStatus = async (rewardId: string, isActive: boolean) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/admin/rewards/${rewardId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.uid}`,
          },
          body: JSON.stringify({ isActive: !isActive }),
        }
      );

      if (response.ok) {
        toast.success(`Reward ${!isActive ? 'activated' : 'deactivated'}`);
        fetchRewards();
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update reward status:', error);
      toast.error('Failed to update reward status');
    }
  };

  const openEditDialog = (reward: Reward) => {
    setFormData(reward);
    setEditingReward(reward);
    setShowCreateDialog(true);
  };

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gift className="w-6 h-6" />
            <span>Rewards Management ({rewards.length})</span>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Create Reward
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingReward ? 'Edit Reward' : 'Create New Reward'}
                </DialogTitle>
                <DialogDescription>
                  {editingReward ? 'Update reward details' : 'Add a new reward to the platform'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cost">Cost (tokens) *</Label>
                    <Input
                      id="cost"
                      type="number"
                      min="1"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: parseInt(e.target.value) }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="physical">Physical</SelectItem>
                        <SelectItem value="experience">Experience</SelectItem>
                        <SelectItem value="discount">Discount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="merchandise">Merchandise</SelectItem>
                        <SelectItem value="certification">Certification</SelectItem>
                        <SelectItem value="exclusive_access">Exclusive Access</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="stock">Stock (optional)</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        stock: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.details.instructions || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      details: { ...prev.details, instructions: e.target.value }
                    }))}
                    placeholder="Instructions for users on how to redeem this reward"
                  />
                </div>

                <div>
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.details.validUntil || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      details: { ...prev.details, validUntil: e.target.value }
                    }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label>Active</Label>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingReward ? 'Update Reward' : 'Create Reward'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <Card key={reward.id} className={`${!reward.isActive ? 'opacity-60' : ''}`}>
                {reward.imageUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={reward.imageUrl}
                      alt={reward.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">
                        {reward.title}
                      </h3>
                      <div className="flex items-center space-x-2 mb-2">
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

                  <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                    {reward.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-lg font-bold text-emerald-600">
                      <Star className="w-5 h-5 fill-current" />
                      <span>{reward.cost}</span>
                    </div>
                    
                    {reward.stock !== undefined && (
                      <span className="text-sm text-slate-500">
                        Stock: {reward.stock}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(reward.id!, reward.isActive)}
                      >
                        {reward.isActive ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(reward)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(reward.id!)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {!reward.isActive && (
                      <Badge variant="outline" className="text-red-600">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {rewards.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Gift className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  No rewards yet
                </h3>
                <p className="text-slate-500">
                  Create your first reward to get started.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};