"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Award, Bell, List, Tag, FileText } from 'lucide-react';
import { Workshop, WorkshopFormData, WorkshopCategory, WorkshopDifficulty, WorkshopFormat } from '../types/workshop';
import { useWorkshop } from '../hooks/useWorkshops';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '../app/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkshopEditFormProps {
  workshop: Workshop;
  onWorkshopUpdated?: (workshop: Workshop) => void;
  onCancel?: () => void;
  className?: string;
}

const WorkshopEditForm: React.FC<WorkshopEditFormProps> = ({
  workshop,
  onWorkshopUpdated,
  onCancel,
  className = '',
}) => {
  const { updateWorkshop, loading, error, clearError } = useWorkshop();
  const { user } = useAuth();

  // Initialize form data with workshop values
  const [formData, setFormData] = useState<WorkshopFormData>({
    title: workshop.title,
    description: workshop.description,
    shortDescription: workshop.shortDescription || '',
    category: workshop.category,
    difficulty: workshop.difficulty,
    format: workshop.format,
    scheduledDate: workshop.scheduledDate,
    startTime: workshop.startTime,
    endTime: workshop.endTime,
    timezone: workshop.timezone,
    maxParticipants: workshop.maxParticipants,
    enrollmentDeadline: workshop.enrollmentDeadline || '',
    prerequisites: workshop.prerequisites || [],
    learningObjectives: workshop.learningObjectives,
    requirements: workshop.requirements || [],
    requiredTools: workshop.requiredTools || [],
    targetAudience: workshop.targetAudience || '',
    tags: workshop.tags,
    language: workshop.language,
    location: workshop.location || '',
    isRecorded: workshop.isRecorded,
    isInteractive: workshop.isInteractive || false,
    materialsProvided: workshop.materialsProvided || false,
    allowWaitlist: workshop.allowWaitlist,
    autoApproveEnrollments: workshop.autoApproveEnrollments,
    sendReminders: workshop.sendReminders,
    requiresCompletion: workshop.requiresCompletion,
    issuesCertificate: workshop.issuesCertificate,
    price: workshop.price,
    currency: workshop.currency,
    meetingLink: workshop.meetingLink || '',
    meetingPassword: workshop.meetingPassword || '',
    thumbnailUrl: workshop.thumbnailUrl || '',
    bannerUrl: workshop.bannerUrl || '',
  });

  // Form state for arrays and text inputs
  const [prerequisitesText, setPrerequisitesText] = useState<string>('');
  const [learningObjectivesText, setLearningObjectivesText] = useState<string>('');
  const [requirementsText, setRequirementsText] = useState<string>('');
  const [requiredToolsText, setRequiredToolsText] = useState<string>('');
  const [tagsText, setTagsText] = useState<string>('');

  // Track changes for notification purposes
  const [changes, setChanges] = useState<string[]>([]);

  // Initialize text fields from workshop data
  useEffect(() => {
    setPrerequisitesText(workshop.prerequisites?.join('\n') || '');
    setLearningObjectivesText(workshop.learningObjectives?.join('\n') || '');
    setRequirementsText(workshop.requirements?.join('\n') || '');
    setRequiredToolsText(workshop.requiredTools?.join('\n') || '');
    setTagsText(workshop.tags?.join(', ') || '');
  }, [workshop]);

  // Helper to calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, duration: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  // Calculate duration in minutes
  const calculateDuration = (): number => {
    if (!formData.startTime || !formData.endTime) return 0;
    
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  };

  const handleInputChange = (field: keyof WorkshopFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Track changes for notifications
    if (!changes.includes(field)) {
      setChanges(prev => [...prev, field]);
    }
    
    // Auto-calculate end time when start time changes
    if (field === 'startTime' && value) {
      const duration = calculateDuration();
      if (duration > 0) {
        const newEndTime = calculateEndTime(value, duration);
        setFormData(prev => ({ ...prev, endTime: newEndTime }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validate required fields
    if (!formData.title.trim()) {
      alert('Please enter a workshop title');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a workshop description');
      return;
    }

    if (learningObjectivesText.trim().length === 0) {
      alert('Please enter at least one learning objective');
      return;
    }

    if (!formData.scheduledDate) {
      alert('Please select a workshop date');
      return;
    }

    // Validate date is in the future (only for draft workshops)
    if (workshop.status === 'draft') {
      const workshopDate = new Date(`${formData.scheduledDate}T${formData.startTime}`);
      if (workshopDate <= new Date()) {
        alert('Workshop date and time must be in the future');
        return;
      }
    }

    // Process text inputs into arrays
    const processedData: Partial<Workshop> = {
      ...formData,
      prerequisites: prerequisitesText
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0),
      learningObjectives: learningObjectivesText
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0),
      requirements: requirementsText
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0),
      requiredTools: requiredToolsText
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0),
      tags: tagsText
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0),
      duration: calculateDuration(), // Include calculated duration
    };

    // Only include fields that have actually changed
    const changedFields = Object.keys(processedData).filter(key => {
      const typedKey = key as keyof Workshop;
      return JSON.stringify(processedData[typedKey]) !== JSON.stringify(workshop[typedKey]);
    });

    if (changedFields.length === 0) {
      alert('No changes detected');
      return;
    }

    const updates = changedFields.reduce((acc, key) => {
      const typedKey = key as keyof Workshop;
      (acc as any)[typedKey] = (processedData as any)[typedKey];
      return acc;
    }, {} as Partial<Workshop>);

    try {
      const updatedWorkshop = await updateWorkshop(workshop.id, updates, changes);
      if (updatedWorkshop) {
        onWorkshopUpdated?.(updatedWorkshop);
      }
    } catch (err) {
      console.error('Failed to update workshop:', err);
    }
  };

  const categories: { value: WorkshopCategory; label: string }[] = [
    { value: 'data_analysis', label: 'Data Analysis' },
    { value: 'machine_learning', label: 'Machine Learning' },
    { value: 'programming', label: 'Programming' },
    { value: 'statistics', label: 'Statistics' },
    { value: 'visualization', label: 'Data Visualization' },
    { value: 'databases', label: 'Databases' },
    { value: 'cloud_computing', label: 'Cloud Computing' },
    { value: 'web_development', label: 'Web Development' },
    { value: 'apis', label: 'APIs' },
    { value: 'other', label: 'Other' },
  ];

  const difficulties: { value: WorkshopDifficulty; label: string }[] = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const formats: { value: WorkshopFormat; label: string }[] = [
    { value: 'online', label: 'Online' },
    { value: 'in_person', label: 'In Person' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  const isCreator = user?.uid === workshop.creatorId;
  const canEdit = isCreator && (workshop.status === 'draft' || workshop.status === 'published');

  // Don't show form if user can't edit
  if (!canEdit) {
    return (
      <div className={`max-w-4xl mx-auto ${className}`}>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-slate-600">You don't have permission to edit this workshop.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Workshop</CardTitle>
          <CardDescription>
            Update your workshop details. {workshop.status === 'published' && 'Participants will be notified of significant changes.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Show current status */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 text-sm font-medium">Workshop Status</p>
                <Badge 
                  variant={workshop.status === 'published' ? 'default' : 'secondary'}
                  className="mt-1 capitalize"
                >
                  {workshop.status}
                </Badge>
              </div>
              {workshop.status === 'published' && (
                <div className="text-right">
                  <p className="text-blue-600 text-sm">{workshop.currentEnrollments} enrolled</p>
                  <p className="text-blue-500 text-xs">Be careful with major changes</p>
                </div>
              )}
            </div>
          </div>

          {/* Show changes being tracked */}
          {changes.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm font-medium mb-2">Pending Changes:</p>
              <div className="flex flex-wrap gap-1">
                {changes.map(change => (
                  <Badge key={change} variant="outline" className="text-yellow-700">
                    {change}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <FileText className="w-5 h-5" />
                <span>Basic Information</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Workshop Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter a compelling workshop title"
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: WorkshopCategory) => handleInputChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty Level *</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: WorkshopDifficulty) => handleInputChange('difficulty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(diff => (
                        <SelectItem key={diff.value} value={diff.value}>
                          {diff.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Brief description for workshop cards (optional)"
                  maxLength={200}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.shortDescription.length}/200 characters
                </p>
              </div>

              <div>
                <Label htmlFor="description">Full Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide a detailed description of your workshop..."
                  rows={4}
                  maxLength={2000}
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.description.length}/2000 characters
                </p>
              </div>
            </div>

            {/* Schedule & Format */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <Calendar className="w-5 h-5" />
                <span>Schedule & Format</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="format">Format *</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value: WorkshopFormat) => handleInputChange('format', value)}
                    disabled={workshop.status === 'published'} // Can't change format for published workshops
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map(format => (
                        <SelectItem key={format.value} value={format.value}>
                          <div className="flex items-center">
                            {format.value === 'online' && <MapPin className="w-4 h-4 mr-2" />}
                            {format.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {workshop.status === 'published' && (
                    <p className="text-xs text-slate-500 mt-1">
                      Format cannot be changed for published workshops
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="maxParticipants">Max Participants *</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value) || 1)}
                    min={workshop.currentEnrollments} // Can't reduce below current enrollments
                    max={1000}
                    required
                  />
                  {workshop.status === 'published' && (
                    <p className="text-xs text-slate-500 mt-1">
                      Cannot reduce below current enrollments ({workshop.currentEnrollments})
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="scheduledDate">Workshop Date *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    min={workshop.status === 'draft' ? new Date().toISOString().split('T')[0] : undefined}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Duration: {calculateDuration()} minutes
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="enrollmentDeadline">Enrollment Deadline (Optional)</Label>
                <Input
                  id="enrollmentDeadline"
                  type="date"
                  value={formData.enrollmentDeadline}
                  onChange={(e) => handleInputChange('enrollmentDeadline', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Meeting Details */}
            {formData.format !== 'in_person' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-lg font-semibold">
                  <MapPin className="w-5 h-5" />
                  <span>Meeting Details</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="meetingLink">Meeting Link</Label>
                    <Input
                      id="meetingLink"
                      type="url"
                      value={formData.meetingLink}
                      onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                      placeholder="https://meet.google.com/..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="meetingPassword">Meeting Password</Label>
                    <Input
                      id="meetingPassword"
                      value={formData.meetingPassword}
                      onChange={(e) => handleInputChange('meetingPassword', e.target.value)}
                      placeholder="Optional meeting password"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Location for in-person workshops */}
            {formData.format === 'in_person' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-lg font-semibold">
                  <MapPin className="w-5 h-5" />
                  <span>Location Details</span>
                </div>

                <div>
                  <Label htmlFor="location">Workshop Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter the workshop location"
                    required
                  />
                </div>
              </div>
            )}

            {/* Content Details */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <List className="w-5 h-5" />
                <span>Content Details</span>
              </div>

              <div>
                <Label htmlFor="learningObjectives">Learning Objectives *</Label>
                <Textarea
                  id="learningObjectives"
                  value={learningObjectivesText}
                  onChange={(e) => setLearningObjectivesText(e.target.value)}
                  placeholder="What will participants learn? (one objective per line)"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="prerequisites">Prerequisites</Label>
                <Textarea
                  id="prerequisites"
                  value={prerequisitesText}
                  onChange={(e) => setPrerequisitesText(e.target.value)}
                  placeholder="What should participants know beforehand? (one prerequisite per line)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={requirementsText}
                  onChange={(e) => setRequirementsText(e.target.value)}
                  placeholder="What do participants need? (software, tools, etc.)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="requiredTools">Required Tools</Label>
                <Textarea
                  id="requiredTools"
                  value={requiredToolsText}
                  onChange={(e) => setRequiredToolsText(e.target.value)}
                  placeholder="Required software/tools (one per line)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  placeholder="Who is this workshop for?"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="python, pandas, data-analysis, beginner"
                />
              </div>
            </div>

            {/* Workshop Settings */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <Bell className="w-5 h-5" />
                <span>Workshop Settings</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendReminders"
                      checked={formData.sendReminders}
                      onCheckedChange={(checked) => handleInputChange('sendReminders', checked)}
                    />
                    <Label htmlFor="sendReminders">Send reminder notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowWaitlist"
                      checked={formData.allowWaitlist}
                      onCheckedChange={(checked) => handleInputChange('allowWaitlist', checked)}
                    />
                    <Label htmlFor="allowWaitlist">Allow waitlist when full</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoApproveEnrollments"
                      checked={formData.autoApproveEnrollments}
                      onCheckedChange={(checked) => handleInputChange('autoApproveEnrollments', checked)}
                    />
                    <Label htmlFor="autoApproveEnrollments">Auto-approve enrollments</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isInteractive"
                      checked={formData.isInteractive}
                      onCheckedChange={(checked) => handleInputChange('isInteractive', checked)}
                    />
                    <Label htmlFor="isInteractive">Interactive workshop</Label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isRecorded"
                      checked={formData.isRecorded}
                      onCheckedChange={(checked) => handleInputChange('isRecorded', checked)}
                    />
                    <Label htmlFor="isRecorded">Workshop will be recorded</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="materialsProvided"
                      checked={formData.materialsProvided}
                      onCheckedChange={(checked) => handleInputChange('materialsProvided', checked)}
                    />
                    <Label htmlFor="materialsProvided">Materials provided</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="issuesCertificate"
                      checked={formData.issuesCertificate}
                      onCheckedChange={(checked) => handleInputChange('issuesCertificate', checked)}
                    />
                    <Label htmlFor="issuesCertificate" className="flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      Issue certificates
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requiresCompletion"
                      checked={formData.requiresCompletion}
                      onCheckedChange={(checked) => handleInputChange('requiresCompletion', checked)}
                    />
                    <Label htmlFor="requiresCompletion">Require completion tracking</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <Tag className="w-5 h-5" />
                <span>Pricing</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Set to 0 for free workshops
                  </p>
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="BRL">BRL (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={loading || changes.length === 0} 
                className="min-w-32"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkshopEditForm;